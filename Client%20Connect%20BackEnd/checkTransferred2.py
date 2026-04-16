import schedule
import time
import os
import utils
import controllers
import logging
import json
import datetime
import dotenv
import concurrent.futures

from models import (
    PolicyCheck,
    Member,
    ClientUpdate,
    Policy,
    PolicyMember,
    ClientUpdateData,
    OnboardingPolicy,
    ServiceBusMessage,
    OnboardingFile,
    onboardingData,
    onboardingPolicy,
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


def process_policy(policy):
    mainMemberIdnumber = policy["IdNumber"]
    getPolicyRMA = utils.get_rma_api(
        f"/clc/api/Policy/Policy/GetPolicyByNumber/{policy['PolicyNumber']}"
    )
    if not getPolicyRMA:
        logging.error(f"Policy {policy['PolicyNumber']} not found in RMA")
        return []

    # print(getPolicyRMA)
    # exit()
    getMembers = utils.get_rma_api(
        f"/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/{getPolicyRMA['policyId']}"
    )

    for mem in getMembers:
        if mem["rolePlayerTypeId"] == 10:
            # print(mem["rolePlayer"]["person"]["idNumber"])
            eCare = mem["rolePlayer"]["person"]["idNumber"]
    misMatch = False
    if eCare != mainMemberIdnumber:
        print(f"{policy['PolicyNumber']} - {eCare} != {mainMemberIdnumber}")
        misMatch = True
    return [
        policy["PolicyDataId"],
        policy["PolicyNumber"],
        eCare,
        mainMemberIdnumber,
        misMatch,
        getPolicyRMA["policyId"],
        getPolicyRMA["clientReference"],
        getPolicyRMA["createdDate"],
        getPolicyRMA["policyInceptionDate"],
    ]


with utils.orm_conn(os.getenv("DATABASE_URL"), False) as conn:
    try:
        s = (
            select(Policy)
            .join(PolicyMember, PolicyMember.policyId == Policy.id)
            .join(Member, Member.id == PolicyMember.memberId)
            .with_hint(Policy, "WITH (NOLOCK)")
            .where(
                Policy.status == "Complete",
                PolicyMember.memberType == "Main Member",
                Policy.updatedAt >= "2025-03-01 00:00:00",
                Policy.id.in_(
                    [
                        57223,
                        57891,
                        60743,
                        60768,
                        60829,
                        61008,
                        61052,
                        61364,
                        66179,
                        67034,
                        67065,
                        67284,
                        67485,
                        67644,
                        69806,
                        70935,
                        70964,
                        71109,
                        71116,
                        71132,
                        71327,
                        72374,
                        77003,
                        77437,
                        77669,
                        77691,
                        77739,
                        77821,
                        77852,
                        77902,
                        77947,
                    ]
                ),
                # Policy.updatedAt <= "2025-04-22 17:30:00",
            )
            .with_only_columns(
                Policy.id,
                Policy.joinDate,
                Policy.PolicyNumber,
                Policy.StatusNote,
                Policy.onboardingPoliciesId,
                Policy.CreatedDate,
                Policy.providerInceptionDate,
                Policy.BrokerageName,
                Policy.ProviderName,
                Member.idNumber,
            )
            .order_by(Policy.id.asc())
            .limit(25)
        )
        result = conn.execute(s)
        getPolicies = result.mappings().all()
        transferData = []
        while getPolicies:
            with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                futures = {
                    executor.submit(process_policy, policy): policy
                    for policy in getPolicies
                }
                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    if result:
                        transferData.append(result)

            lastPolicy = getPolicies[-1]["PolicyDataId"]
            s = (
                select(Policy)
                .join(PolicyMember, PolicyMember.policyId == Policy.id)
                .join(Member, Member.id == PolicyMember.memberId)
                .with_hint(Policy, "WITH (NOLOCK)")
                .where(
                    Policy.status == "Complete",
                    PolicyMember.memberType == "Main Member",
                    Policy.id > lastPolicy,
                    Policy.updatedAt >= "2025-03-01 00:00:00",
                    Policy.id.in_(
                        [
                            57223,
                            57891,
                            60743,
                            60768,
                            60829,
                            61008,
                            61052,
                            61364,
                            66179,
                            67034,
                            67065,
                            67284,
                            67485,
                            67644,
                            69806,
                            70935,
                            70964,
                            71109,
                            71116,
                            71132,
                            71327,
                            72374,
                            77003,
                            77437,
                            77669,
                            77691,
                            77739,
                            77821,
                            77852,
                            77902,
                            77947,
                        ]
                    ),
                    # Policy.updatedAt <= "2025-04-22 17:30:00",
                )
                .with_only_columns(
                    Policy.id,
                    Policy.joinDate,
                    Policy.PolicyNumber,
                    Policy.StatusNote,
                    Policy.onboardingPoliciesId,
                    Policy.CreatedDate,
                    Policy.providerInceptionDate,
                    Policy.BrokerageName,
                    Policy.ProviderName,
                    Member.idNumber,
                )
                .order_by(Policy.id.asc())
                .limit(25)
            )
            result = conn.execute(s)
            getPolicies = result.mappings().all()
            # getPolicies = []

        keys = [
            "PolicyDataId",
            "PolicyNumber",
            "eCare Main Member IdNumber",
            "Client Connect Main Member IdNumber",
            "Mismatch",
            "PolicyId RMA",
            "Client Reference",
            "Created Date RMA",
            "Policy Inception Date RMA",
        ]
        newFilename = utils.excelFileOnly(keys, transferData, f"checkTransferred.xlsx")
    except Exception as e:
        conn.rollback()
        logging.error(e)
        raise e
