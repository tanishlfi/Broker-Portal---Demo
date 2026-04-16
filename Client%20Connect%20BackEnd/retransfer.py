import schedule
import time
import os
import utils
import controllers
import logging
import json
import datetime
import dotenv

from models import (
    PolicyCheck,
    Member,
    ClientUpdate,
    Policy,
    PolicyMember,
    ClientUpdateData,
    OnboardingPolicy,
    ServiceBusMessage,
    User,
    OnboardingFile,
)
from sqlalchemy import (
    update,
    func,
    cast,
    Date,
    insert,
    exists,
    or_,
    select,
    text,
    alias,
    and_,
)
from sqlalchemy.orm import aliased


dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))


def resetQry(PolicyNumber):
    return f"""-- Declare with proper length and clear name
DECLARE @PolicyNumber VARCHAR(50)
DECLARE @policyId INT
DECLARE @oolicyDataId INT

-- Set value 
SET @PolicyNumber = '{PolicyNumber}'

-- Add NOLOCK hint if read-only query
-- Add explicit column names instead of *
set @oolicyDataId = (SELECT 
    pd.PolicyDataId 
FROM onboarding.PolicyData pd WITH (NOLOCK)
WHERE pd.PolicyNumber = @PolicyNumber
    AND pd.PolicyNumber IS NOT NULL)

    
set @policyId = (
SELECT 
    pd.onboardingPoliciesId
FROM onboarding.PolicyData pd WITH (NOLOCK)
WHERE pd.PolicyNumber = @PolicyNumber
    AND pd.PolicyNumber IS NOT NULL)
    
    
delete from onboarding.PolicyMember 
where PolicyDataId = @oolicyDataId

update onboarding.onboardingData 
set PolicyMemberId = null, MemberId = null
where policyId = @policyId

delete from onboarding.ServiceBusMessages 
where ResponseReferenceNumber = @PolicyNumber

update onboarding.PolicyData
set status = 'Approved'
where PolicyDataId = @oolicyDataId

update onboarding.onboardingPolicies 
set status = 'Approved'
where id = @policyId;"""


with utils.orm_conn(os.getenv("DATABASE_URL"), False) as conn:
    try:
        s = (
            select(Policy)
            .with_hint(Policy, "WITH (NOLOCK)")
            .where(
                # Policy.status == "Complete",
                Policy.id.in_(
                    [
                        43359,
                    ]
                ),
            )
            .with_only_columns(
                Policy.id,
                Policy.joinDate,
                Policy.PolicyNumber,
                Policy.StatusNote,
                Policy.onboardingPoliciesId,
                Policy.CreatedDate,
            )
            .order_by(Policy.id.asc())
        )
        result = conn.execute(s)
        getPolicies = result.mappings().all()
        transferData = []
        while getPolicies:
            for policy in getPolicies:
                status = "transferred"
                logging.debug(f"Processing policy {policy}")
                if (
                    not policy["PolicyNumber"]
                    and "Policy Created Successfully" in policy["StatusNote"]
                ):
                    getPolicyRMA = utils.get_rma_api(
                        f"/clc/api/Policy/Policy/GetPolicyByNumber/{policy["StatusNote"].replace('Policy Created Successfully - ', '').strip()}"
                    )
                elif (
                    not policy["PolicyNumber"]
                    and "Policy Created Successfully" not in policy["StatusNote"]
                ):
                    logging.error(
                        f"Policy {policy['PolicyDataId']} has no PolicyNumber"
                    )
                    status = "No Policy Number"
                    getPolicyRMA = None
                else:
                    getPolicyRMA = utils.get_rma_api(
                        f"/clc/api/Policy/Policy/GetPolicyByNumber/{policy["PolicyNumber"]}"
                    )
                if not getPolicyRMA:
                    logging.error(f"Policy {policy['PolicyNumber']} not found in RMA")
                    status = "Not Found"
                    utils.orm_query(conn, resetQry(policy["PolicyNumber"]))

            getPolicies = []

    except Exception as e:
        conn.rollback()
        logging.error(e)
        raise e
