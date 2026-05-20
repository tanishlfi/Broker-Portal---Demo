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
        if getAge is not None and getAge > 21:
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
        logging.info("Checking for pending Broker Portal verifications (Accepted Leads)...")
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            # 1. Find employees from 'Accepted' leads that need verification
            s = text("""
                SELECT 
                    e.employee_id, e.lead_id, e.id_number, e.first_name, e.last_name,
                    l.lead_reference, l.lead_status, v.id as existing_v_id
                FROM broker.bp_employees e
                JOIN broker.bp_leads l ON e.lead_id = l.lead_id
                LEFT JOIN broker.bp_verification_results v ON e.employee_id = v.employee_id
                WHERE l.lead_status = 'Accepted'
                AND v.id IS NULL
                AND e.is_active = 1
            """)
            
            result = conn.execute(s)
            employees = result.mappings().all()
            
            if not employees:
                logging.debug("No pending Broker Portal verifications found for Accepted leads.")
            else:
                logging.info(f"Processing {len(employees)} Broker Portal employees...")
                
            for emp in employees:
                id_no = emp["id_number"]
                emp_id = emp["employee_id"]
                lead_id = emp["lead_id"]
                lead_ref = emp["lead_reference"]
                
                logging.info(f"Verifying Employee {emp['first_name']} {emp['last_name']} (ID: {id_no}) for Lead {lead_ref}")
                
                # 1. VOPD Check
                vopd_res = parsedRMAResponse(id_no)
                vopd_status = "Verified" if vopd_res else "Failed"
                vopd_ref = f"VOPD-{uuid.uuid4().hex[:8].upper()}" if vopd_res else None
                
                # 2. AML Check
                aml_res = performAMLCheck(id_no)
                aml_status = "Pass" if aml_res["status"] == "Passed" else "Fail"
                aml_ref = f"AML-{uuid.uuid4().hex[:8].upper()}"
                aml_time = datetime.now()
                
                # 3. Save to broker.bp_verification_results
                res_id = str(uuid.uuid4())
                ins_v = text("""
                    INSERT INTO broker.bp_verification_results 
                    (id, lead_id, employee_id, vopd_status, vopd_response, vopd_reference, 
                     aml_status, aml_response, aml_reference, aml_timestamp,
                     verified_party_type, created_at, updated_at)
                    VALUES (:id, :lead_id, :employee_id, :vopd_status, :vopd_response, :vopd_ref,
                            :aml_status, :aml_response, :aml_ref, :aml_time,
                            :party_type, :now, :now)
                """)
                conn.execute(ins_v, {
                    "id": res_id,
                    "lead_id": lead_id,
                    "employee_id": emp_id,
                    "vopd_status": vopd_status,
                    "vopd_response": json.dumps(vopd_res) if vopd_res else None,
                    "vopd_ref": vopd_ref,
                    "aml_status": aml_status,
                    "aml_response": json.dumps(aml_res),
                    "aml_ref": aml_ref,
                    "aml_time": aml_time,
                    "party_type": "Employee",
                    "now": datetime.now()
                })
            
            conn.commit()
            
            # 4. Check if any Leads are now fully verified (ALL PASS/VERIFIED) and update status
            s_leads = text("SELECT lead_id, lead_reference FROM broker.bp_leads WHERE lead_status = 'Accepted'")
            active_leads = conn.execute(s_leads).mappings().all()
            
            for lead in active_leads:
                lead_id = lead["lead_id"]
                lead_ref = lead["lead_reference"]
                
                # Count total active employees
                s_total = text("SELECT COUNT(*) FROM broker.bp_employees WHERE lead_id = :l_id AND is_active = 1")
                total_emp = conn.execute(s_total, {"l_id": lead_id}).scalar()
                
                # Count successfully verified employees
                s_success = text("""
                    SELECT COUNT(*) 
                    FROM broker.bp_verification_results v
                    WHERE v.lead_id = :l_id 
                    AND v.vopd_status = 'Verified' 
                    AND v.aml_status = 'Pass'
                """)
                success_count = conn.execute(s_success, {"l_id": lead_id}).scalar()
                
                if total_emp > 0 and total_emp == success_count:
                    logging.info(f"All {total_emp} employees for Lead {lead_ref} successfully verified. Updating status to 'Onboarding Submitted'...")
                    
                    # Update Lead status ONLY
                    u_lead = text("UPDATE broker.bp_leads SET lead_status = 'Onboarding Submitted' WHERE lead_id = :l_id")
                    conn.execute(u_lead, {"l_id": lead_id})
                    
                    conn.commit()
                elif total_emp > 0:
                    # Check if any have failed
                    s_fail = text("""
                        SELECT COUNT(*) 
                        FROM broker.bp_verification_results v
                        WHERE v.lead_id = :l_id 
                        AND (v.vopd_status IN ('Failed', 'Error') OR v.aml_status IN ('Fail', 'Error', 'High Risk'))
                    """)
                    fail_count = conn.execute(s_fail, {"l_id": lead_id}).scalar()
                    if fail_count > 0:
                        logging.warning(f"Lead {lead_ref} has {fail_count} failed verifications. Lead status remains 'Accepted'.")
            
    except Exception as error:
        logging.error(f"Error in Broker Portal verification service: {error}")

if __name__ == "__main__":
    logging.info("Broker Portal Verification Service Started (Accepted Leads Only)")
    processBrokerPortalVerifications() # Run immediately on start
    
    schedule.every(1).minutes.do(processBrokerPortalVerifications)
    
    while True:
        schedule.run_pending()
        time.sleep(1)
