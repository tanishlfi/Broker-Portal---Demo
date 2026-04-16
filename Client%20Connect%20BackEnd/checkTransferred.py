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
    User,
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


def getCalculatedPremium(
    db_conn,
    policyId,
    PremiumAdjustmentPercentage,
    AdminPercentage,
    CommissionPercentage,
    BinderFeePercentage,
    ProviderInceptionDate,
):
    # s = (
    #     select(onboardingData)
    #     .with_hint(onboardingData, "WITH (NOLOCK)")
    #     .where(
    #         onboardingData.policyId == policyId,
    #         onboardingData.deletedAt == None,
    #         onboardingData.alsoMember == False,
    #         onboardingData.memberType != "Beneficiary",
    #     )
    #     .with_only_columns(
    #         onboardingData.policyId, onboardingData.id, onboardingData.statedBenefitId
    #     )
    # )
    s = (
        select(PolicyMember)
        .with_hint(PolicyMember, "WITH (NOLOCK)")
        .where(PolicyMember.policyId == policyId)
        .with_only_columns(
            PolicyMember.policyId,
            PolicyMember.PolicyMemberId,
            PolicyMember.statedBenefitId,
        )
    )
    result = db_conn.execute(s)
    getOnboardingData = result.mappings().all()
    totalPremium = 0
    for data in getOnboardingData:
        benefitRate = 0
        calcPremium = 0
        # get the benefit rate for the member
        getBenefit = utils.get_rma_api(
            f"/clc/api/Product/Benefit/{data["StatedBenefitId"]}"
        )

        if "benefitRates" in getBenefit and getBenefit["benefitRates"]:
            benefitRate = getBenefit["benefitRates"][0]["baseRate"]

        if benefitRate > 0:
            benefitRate = benefitRate * (1 + PremiumAdjustmentPercentage)
            # calcPremium = benefitRate / (
            #     1 - (CommissionPercentage + BinderFeePercentage)
            # )
            # # round to 0 decimal places
            # calcPremium = round(calcPremium, 0)

            qry = f"""select [dbo].[SynonymCalculateFuneralPolicyPremium] ( {benefitRate}, {AdminPercentage}, {CommissionPercentage}, {BinderFeePercentage}) as result;"""

            result = utils.orm_select(conn, qry)
            if result:
                calcPremium = result[0]["result"]

        totalPremium += calcPremium

    # if ProviderInceptionDate < "2023-11-01" then round to nearest 0
    if ProviderInceptionDate.date() < datetime.date(2023, 11, 1):
        totalPremium = round(totalPremium, 0)
    return totalPremium


def process_policy(policy):
    status = "transferred"
    premium = 0
    calcPremium = 0
    hasDocuments = "N"
    logging.debug(f"Processing policy {policy}")
    policyNumber = policy["PolicyNumber"] if "PolicyNumber" in policy else None
    if not policyNumber and "Policy Created Successfully" in policy["StatusNote"]:
        policyNumber = (
            policy["StatusNote"].replace("Policy Created Successfully - ", "").strip()
        )

    if not policyNumber:
        logging.error(f"Policy {policy['PolicyDataId']} has no PolicyNumber")
        status = "No Policy Number"
        getPolicyRMA = None
    else:
        getPolicyRMA = utils.get_rma_api(
            f"/clc/api/Policy/Policy/GetPolicyByNumber/{policyNumber}"
        )

    if not getPolicyRMA:
        logging.error(f"Policy {policyNumber} not found in RMA")
        status = "Not Found"
        policyInception = None
    else:
        logging.debug(f"Policy {policyNumber} found in RMA")
        getDocsRMA = utils.get_rma_api(
            f"/scn/api/Document/Document/GetDocumentsByKey/CaseCode/{policyNumber}"
        )
        if getDocsRMA:
            hasDocuments = "Y"
        policyInception = getPolicyRMA.get("policyInceptionDate")

    createdDate = policy["CreatedDate"].date()
    return [
        policy["PolicyDataId"],
        policy["BrokerageName"],
        policy["ProviderName"],
        createdDate,
        policy["PolicyInceptionDate"],
        policyNumber,
        policy["StatusNote"],
        # policy["onboardingPoliciesId"],
        status,
        policyInception,
        (
            policy["providerInceptionDate"].date()
            if "providerInceptionDate" in policy and policy["providerInceptionDate"]
            else None
        ),
        # 0,
        # 0,
        hasDocuments,
    ]


with utils.orm_conn(os.getenv("DATABASE_URL"), False) as conn:
    try:
        s = (
            select(Policy)
            .with_hint(Policy, "WITH (NOLOCK)")
            .where(Policy.status == "Complete")
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
            )
            .order_by(Policy.id.asc())
            .limit(25)
        )
        result = conn.execute(s)
        getPolicies = result.mappings().all()
        transferData = []
        while getPolicies:
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [
                    executor.submit(process_policy, policy) for policy in getPolicies
                ]
                for future in concurrent.futures.as_completed(futures):
                    transferData.append(future.result())

            lastPolicy = getPolicies[-1]["PolicyDataId"]
            s = (
                select(Policy)
                .with_hint(Policy, "WITH (NOLOCK)")
                .where(Policy.status == "Complete", Policy.id > lastPolicy)
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
                )
                .order_by(Policy.id.asc())
                .limit(25)
            )
            result = conn.execute(s)
            getPolicies = result.mappings().all()
            # getPolicies = []
        keys = [
            "PolicyDataId",
            "BrokerageName",
            "Scheme",
            "CreatedDate",
            "PolicyInceptionDate",
            "PolicyNumber",
            "StatusNote",
            # "onboardingPoliciesId",
            "status",
            "joinDate",
            "providerInceptionDate",
            # "premium",
            # "calculatedPremium",
            "hasDocuments",
        ]
        newFilename = utils.excelFileOnly(keys, transferData, f"checkTransferred.xlsx")
    except Exception as e:
        conn.rollback()
        logging.error(e)
        raise e
