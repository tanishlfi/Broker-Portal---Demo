import os
import schedule
import time
import json
import utils
import logging
import controllers
import dotenv
from sqlalchemy import text
from datetime import datetime
import uuid

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), os.getenv("SQLITE_LOG") == "True")

def performAMLCheck(employee_id_number):
    """
    Mock AML check for Broker Portal employees.
    """
    try:
        # Simulate a small delay for the API call
        time.sleep(0.5)
        return {
            "status": "Passed",
            "riskScore": "Low",
            "message": "No adverse media found.",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as error:
        logging.error(f"AML check failed for ID {employee_id_number}: {error}")
        return {"status": "Error", "message": str(error)}

def parsedRMAResponse(id_no: str):
    """
    Direct VOPD check via RMA utility.
    """
    if not id_no:
        return None
        
    verificationType = "death-verification"
    try:
        getDOB = utils.return_dob(id_no)
        if isinstance(getDOB, str):
            try:
                getDOB = datetime.strptime(getDOB, "%Y-%m-%d").date()
            except ValueError:
                getDOB = datetime.strptime(getDOB, "%Y%m%d").date()
        
        getAge = utils.return_age(getDOB, datetime.now().date())
        if getAge > 21:
            verificationType = "status-verification"
        
        response = utils.RMAQuickTransact(id_no, verificationType)
        
        if not response:
            return None
            
        if isinstance(response, str):
            idSubmissionJSON = json.loads(response)
        else:
            idSubmissionJSON = response

        if "VerificationResponse" in idSubmissionJSON and "VerificationDetails" in idSubmissionJSON["VerificationResponse"]:
            return idSubmissionJSON["VerificationResponse"]["VerificationDetails"][0]
        elif "VerificationDetails" in idSubmissionJSON:
            return idSubmissionJSON["VerificationDetails"][0]
            
        return None
    except Exception as e:
        logging.error(f"RMA Parse error for {id_no}: {e}")
        return None

def processBrokerPortalVerifications():
    """
    Main loop to process Broker Portal verifications using broker schema tables.
    """
    try:
        logging.info("Checking for pending Broker Portal verifications (Broker Schema)...")
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            # 1. Find employees from Accepted/Onboarding leads that need verification
            s = text("""
                SELECT 
                    e.employee_id, e.lead_id, e.id_number, e.first_name, e.last_name,
                    l.lead_reference, l.lead_status
                FROM broker.bp_employees e
                JOIN broker.bp_leads l ON e.lead_id = l.lead_id
                LEFT JOIN broker.bp_verification_results v ON e.employee_id = v.employee_id
                WHERE l.lead_status IN ('Accepted', 'Onboarding Submitted')
                AND v.id IS NULL
                AND e.is_active = 1
            """)
            
            result = conn.execute(s)
            employees = result.mappings().all()
            
            if not employees:
                logging.debug("No pending Broker Portal verifications found in broker.bp_employees.")
                return

            logging.info(f"Processing {len(employees)} Broker Portal employees from broker schema...")
            
            processed_leads = set()
            
            for emp in employees:
                id_no = emp["id_number"]
                emp_id = emp["employee_id"]
                lead_id = emp["lead_id"]
                lead_ref = emp["lead_reference"]
                processed_leads.add((lead_id, lead_ref))
                
                logging.info(f"Verifying Employee {emp['first_name']} {emp['last_name']} (ID: {id_no}) for Lead {lead_ref}")
                
                # 1. VOPD Check
                vopd_res = parsedRMAResponse(id_no)
                vopd_status = "Completed" if vopd_res else "Failed"
                
                # 2. AML Check
                aml_res = performAMLCheck(id_no)
                aml_status = "Completed" if aml_res["status"] == "Passed" else "Failed"
                
                # 3. Save to broker.bp_verification_results
                res_id = str(uuid.uuid4())
                ins_v = text("""
                    INSERT INTO broker.bp_verification_results 
                    (id, lead_id, employee_id, vopd_status, vopd_response, aml_status, aml_response, created_at, updated_at)
                    VALUES (:id, :lead_id, :employee_id, :vopd_status, :vopd_response, :aml_status, :aml_response, :now, :now)
                """)
                conn.execute(ins_v, {
                    "id": res_id,
                    "lead_id": lead_id,
                    "employee_id": emp_id,
                    "vopd_status": vopd_status,
                    "vopd_response": json.dumps(vopd_res) if vopd_res else None,
                    "aml_status": aml_status,
                    "aml_response": json.dumps(aml_res),
                    "now": datetime.now()
                })
                
                # 4. Attempt to update onboarding.onboardingData if it was already copied
                # First find the policy ID associated with this lead
                s_pol = text("SELECT id FROM onboarding.onboardingPolicies WHERE statusNote LIKE :ref")
                pol_row = conn.execute(s_pol, {"ref": f"%{lead_ref}%"}).mappings().first()
                
                if pol_row:
                    policy_id = pol_row["id"]
                    is_vopd_valid = (vopd_status == "Completed")
                    notes = f"VOPD: {vopd_status} | AML: {aml_status}"
                    
                    u_od = text("""
                        UPDATE onboarding.onboardingData 
                        SET VopdVerified = :v_val, 
                            VopdVerificationDate = :v_date,
                            vopdResponse = :v_res,
                            notes = :v_notes
                        WHERE policyId = :p_id AND idNumber = :id_no
                    """)
                    conn.execute(u_od, {
                        "v_val": 1 if is_vopd_valid else 0,
                        "v_date": datetime.now() if is_vopd_valid else None,
                        "v_res": json.dumps(vopd_res) if vopd_res else None,
                        "v_notes": notes,
                        "p_id": policy_id,
                        "id_no": id_no
                    })
            
            conn.commit()
            
            # 5. Check if any Leads/Policies are now fully verified and update status
            for lead_id, lead_ref in processed_leads:
                # Count unverified members for this lead in broker schema
                s_rem = text("""
                    SELECT COUNT(e.employee_id) 
                    FROM broker.bp_employees e
                    LEFT JOIN broker.bp_verification_results v ON e.employee_id = v.employee_id
                    WHERE e.lead_id = :l_id AND v.id IS NULL AND e.is_active = 1
                """)
                rem_count = conn.execute(s_rem, {"l_id": lead_id}).scalar()
                
                if rem_count == 0:
                    logging.info(f"All employees for Lead {lead_ref} verified. Updating statuses...")
                    
                    # Update Lead status
                    u_lead = text("UPDATE broker.bp_leads SET lead_status = 'Pending Approval' WHERE lead_id = :l_id")
                    conn.execute(u_lead, {"l_id": lead_id})
                    
                    # Update Onboarding Policy status
                    u_pol = text("""
                        UPDATE onboarding.onboardingPolicies 
                        SET status = 'Pending Approval',
                            statusNote = 'VOPD/AML Verification completed for all employees.'
                        WHERE statusNote LIKE :ref AND status = 'Processing'
                    """)
                    conn.execute(u_pol, {"ref": f"%{lead_ref}%"})
            
            conn.commit()
            
    except Exception as error:
        logging.error(f"Error in Broker Portal verification service: {error}")

if __name__ == "__main__":
    logging.info("Broker Portal Verification Service Started (Broker Schema Focused)")
    processBrokerPortalVerifications() # Run immediately on start
    
    schedule.every(1).minutes.do(processBrokerPortalVerifications)
    
    while True:
        schedule.run_pending()
        time.sleep(1)
