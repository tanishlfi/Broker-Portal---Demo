import schedule
import time
import os
import utils
import logging
import utils
import controllers
import datetime
import json
import dotenv
import bulkQry

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), os.getenv("SQLITE_LOG") == "True")


def markAsComplete():
    try:
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            controllers.update2complete_service_bus_messages(conn)

            utils.orm_query(
                conn,
                "update op set op.status = pd.status, op.statusNote = pd.statusNote FROM onboarding.onboardingPolicies op JOIN onboarding.PolicyData pd (NOLOCK) ON pd.PolicyDataId = op.PolicyDataId where op.status = 'Approved' and pd.status = 'Complete'",
            )
    except Exception as e:
        logging.error(e)
        raise e


# @desc: confirm premium
# @param: policyId
def confirmPremium(
    conn,
    policyId,
    CommissionPercentage,
    PremiumAdjustmentPercentage,
    BinderFeePercentage,
    AdminPercentage=0,
):
    try:
        # get policy data
        getPolicyInfo = controllers.getMemberBenefitsByPolicyId(conn, policyId)

        for row in getPolicyInfo:
            logging.debug(f"Processing policy {row}")
            benefitRate = 0
            calcPremium = 0
            # get the benefit rate for the member
            getBenefit = utils.get_rma_api(
                f"/clc/api/Product/Benefit/{row["StatedBenefitId"]}"
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
                # print(calcPremium)
                # exit()

            if calcPremium != row["premium"]:
                logging.debug(f"Premium needs to be updated")
                controllers.updateMemberPremium(
                    conn,
                    row["PolicyMemberId"],
                    row["PolicyDataId"],
                    row["onboardingDataId"],
                    calcPremium,
                )

            logging.debug(f"Benefit Rate {benefitRate}")
            logging.debug(f"Calc Premium {calcPremium}")
            logging.debug(f"Commission Percentage {CommissionPercentage}")
        conn.commit()
        return True
    except Exception as e:
        logging.error(e)

    return False


def checkAddress1(conn):
    noAddress = controllers.getNoAddress(conn)
    if noAddress:
        print(noAddress)
        exit()

    return

    # if not member["AddressLine1"]:
    #     logging.debug(f"No address details specified")
    #     exceptions.append(
    #         {
    #             "field": "addressLine1",
    #             "message": "No address details specified",
    #         }
    #     )
    #     if controllers.updatePolicyMemberExceptions(
    #         conn,
    #         member["id"],
    #         member["memberId"],
    #         exceptions,
    #         "Error",
    #     ):
    #         logging.debug(
    #             f"Member {member} exceptions updated successfully {exceptions}"
    #         )
    #     stopProcessing = True
    #     continue


def addPolicyApprovals(lastPolicyId=0):
    allowedPolicies = []
    try:
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            getPolicies = controllers.getApprovedPoliciesOnboardingPolicies(
                conn, lastPolicyId
            )
            # while getPolicies:
            for row in getPolicies:
                outcome = controllers.addApprovalPolicy(conn, row["id"])
                if outcome:
                    allowedPolicies.append(row["id"])
                else:
                    logging.error(f"Failed to add approval for policy {row['id']}")
            # lastId = getPolicies[-1]["id"]
            # # print(lastId)
            # getPolicies = controllers.getApprovedPoliciesOnboardingPolicies(
            #     conn, lastId
            # )
            # getPolicies = []
    except Exception as e:
        logging.error(f"Error in addPolicyApprovals: {e}")
    return allowedPolicies


def sendPoliciesModernisation(allowedPolicies):

    try:
        logging.debug(f"Allowed policies: {allowedPolicies}")
        # exit()
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            session_conn = utils.orm_session(os.getenv("DATABASE_URL"))
            # checkAddress1(conn)
            # exit()
            # add approvals
            # addApprovalPolicy
            # getApprovedPoliciesOnboardingPolicies
            # utils.orm_query(conn, bulkQry.ADDAPPROVAL)

            # exit()

            # update Approved policies reference number
            controllers.update_approved_policies_ref(conn)

            # get Approved policies
            result = controllers.get_approved_policies(conn, allowedPolicies)

            # send to queue and flag as sent
            lastId = 0
            while result:
                # convert result to dict
                for row in result:
                    controllers.updateMembersAstuteDoubleCheck(
                        conn, status="Approved", specificId=row["onboardingPoliciesId"]
                    )
                    logging.debug("Members Astute Double Check updated")

                    if controllers.finalCheckDuplicate(
                        session_conn, row["onboardingPoliciesId"]
                    ):
                        logging.debug(f"Duplicate policy {row['ReferenceNumber']}")
                        continue

                    # print(row)
                    # exit()

                    rounding = True

                    logging.debug(f"update policy {row['ReferenceNumber']}")

                    resultDict = {"ReferenceNumber": row["ReferenceNumber"]}

                    # get parent policy info from rma api
                    getProvider = utils.get_rma_api(
                        f"/clc/api/Policy/Policy/{row["providerId"]}"
                    )

                    # exit()
                    paymentFrequencyId = None
                    paymentMethodId = None
                    if not getProvider:
                        logging.error(f"Provider not found for {row['providerId']}")
                        continue

                    if getProvider:
                        paymentFrequencyId = getProvider["paymentFrequencyId"]
                        paymentMethodId = getProvider["paymentMethodId"]
                        AdminPercentage = getProvider["adminPercentage"]
                        CommissionPercentage = getProvider["commissionPercentage"]
                        BinderFeePercentage = getProvider["binderFeePercentage"]
                        PremiumAdjustmentPercentage = getProvider[
                            "premiumAdjustmentPercentage"
                        ]
                        schemeRolePlayerid = getProvider["policyOwnerId"]

                        getBrokerageMapId = None

                        getBrokerageMapId = controllers.addBrokerageRepresentativeMap(
                            conn,
                            getProvider["brokerageId"],
                            getProvider["representativeId"],
                        )

                        if getBrokerageMapId is None:
                            logging.error(
                                f"BrokerageMapId not found for {getProvider['brokerageId']} and {getProvider['representativeId']}"
                            )
                            continue

                    # update paymentFrequencyId and paymentMethodId
                    utils.orm_query(
                        conn,
                        f"update pd set pd.PaymentFrequencyId = {paymentFrequencyId}, pd.PaymentMethodId = {paymentMethodId}, pd.AdminPercentage = {AdminPercentage}, CommissionPercentage = {CommissionPercentage}, BinderFeePercentage = {BinderFeePercentage}, PremiumAdjustmentPercentage = {PremiumAdjustmentPercentage}, SchemeRolePlayerId = {schemeRolePlayerid}, BrokerageRepresentativeMapId = {getBrokerageMapId}, IsEuropAssist = {1 if getProvider["isEuropAssist"] else 0} from onboarding.PolicyData pd where pd.ReferenceNumber = '{row['ReferenceNumber']}';",
                    )

                    if AdminPercentage > 0:
                        logging.debug(
                            f"Policy has premium adjustment or binder fee {row}"
                        )
                        # exit()
                        continue

                    # if getProvider["isEuropAssist"]:
                    #     logging.debug(f"Policy is Europ Assist {row}")
                    #     continue

                    logging.debug(f"Policy has no premium adjustment {getProvider}")

                    # providerInceptionDate from 'policyInceptionDate': '2024-02-01T00:00:00' to date
                    providerInceptionDate = datetime.datetime.strptime(
                        getProvider["policyInceptionDate"], "%Y-%m-%dT%H:%M:%S"
                    ).date()

                    # no rounding for the following parent policies
                    # 01-231025-376524, BCCEI CORPORATE FUNERAL
                    # 01-231222-462645, MUNICIPAL WORKERS RETIREMENT FUND

                    if getProvider["policyId"] in [376524, 462645]:
                        rounding = False
                    # if row["providerInceptionDate"] >= "2024-11-01" then set rounding to false
                    elif providerInceptionDate >= datetime.datetime(2023, 11, 1).date():
                        rounding = False

                    # print(
                    #     f"providerInceptionDate {providerInceptionDate} vs {datetime.datetime(2024, 11, 1).date()} = {rounding}"
                    # )
                    # exit()

                    # confirm premium
                    if confirmPremium(
                        conn,
                        row["PolicyDataId"],
                        CommissionPercentage,
                        PremiumAdjustmentPercentage,
                        BinderFeePercentage,
                        AdminPercentage,
                    ):
                        logging.debug(f"Confirmed premium {row}")
                    else:
                        continue

                    utils.orm_query(
                        conn,
                        f"""with cte as (
select od.policyId, od.idNumber
from onboarding.onboardingData od (nolock)
inner join onboarding.onboardingPolicies op (nolock) on od.policyId = op.id and op.status = 'Approved'
where od.idTypeId = 2
 and policyId = {row["onboardingPoliciesId"]}
and od.deletedAt is null
and od.idNumber is not null
and od.alsoMember = 0
group by od.policyId, od.idNumber
having count(od.id) > 1
),
cte2 as (
select od.id, od.policyId, od.idNumber, od.dateOfBirth, od.firstName, od.surname, trim(cast(od.dateOfBirth as char)) + '-' + od.firstName + ' ' + od.surname as uni_col
from onboarding.onboardingData od (nolock)
inner join cte as b on od.policyId = b.policyId and od.idNumber = b.idNumber
)
update od
set od.idNumber = b.uni_col
from onboarding.onboardingData od (nolock)
inner join cte2 as b on od.policyId = b.policyId and od.id= b.id""",
                    )

                    utils.orm_query(
                        conn,
                        f"""update m
set m.idNumber = od.idNumber
from onboarding.Member m
inner join onboarding.onboardingData od on m.onboardingDataId = od.id
where m.idNumber <> od.idNumber
and od.policyId = {row["onboardingPoliciesId"]};""",
                    )

                    if controllers.add_service_bus_message(
                        conn, row["ReferenceNumber"]
                    ):
                        logging.debug("Added to service bus")

                    utils.orm_query(
                        conn,
                        f"update pm set pm.StartDate = pd.PolicyInceptionDate  from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pm.StartDate is null and pd.ReferenceNumber = '{row["ReferenceNumber"]}';",
                    )

                    utils.orm_query(
                        conn,
                        f"update pm set pm.StatedBenefitId = 0 from onboarding.ServiceBusMessages sbm  inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pm.StatedBenefitId is NULL and pm.coverMemberTypeId = 6 and pd.ReferenceNumber = '{row['ReferenceNumber']}';",
                    )

                    utils.orm_query(
                        conn,
                        f"update m set m.AddressTypeId = 1, m.PostalCode = case when m.PostalCode is NULL then '' else m.PostalCode end from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and m.AddressLine1 is not NULL and pd.ReferenceNumber = '{row['ReferenceNumber']}';",
                    )

                    utils.orm_query(
                        conn,
                        f"update onboarding.[Member] set CommunicationPreferenceId = null where CommunicationPreferenceId = 0;",
                    )

                    utils.orm_query(
                        conn,
                        f"with cte as (select distinct pm.PolicyDataId, pm.InsuredMemberId from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pm.MemberTypeId = 10 and pd.ReferenceNumber = '{row['ReferenceNumber']}') update pm2 set pm2.PolicyHolderMemberId = b.InsuredMemberId from onboarding.PolicyMember as pm2 inner join cte as b on pm2.PolicyDataId = b.PolicyDataId;",
                    )

                    logging.debug(f"Rounding {rounding}")

                    premiumQry = (
                        f"with cte as (select distinct pm.PolicyDataId, round(sum(pm.premium), 0) as premium from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pd.ReferenceNumber = '{row['ReferenceNumber']}' group by pm.PolicyDataId) update pd set pd.Premium = b.premium from onboarding.PolicyData pd  inner join cte as b on pd.PolicyDataId = b.PolicyDataId"
                        if rounding
                        else f"with cte as (select distinct pm.PolicyDataId, sum(pm.premium) as premium from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pd.ReferenceNumber = '{row['ReferenceNumber']}' group by pm.PolicyDataId) update pd set pd.Premium = b.premium from onboarding.PolicyData pd  inner join cte as b on pd.PolicyDataId = b.PolicyDataId"
                    )
                    # print(premiumQry)
                    # print(rounding)
                    utils.orm_query(
                        conn,
                        premiumQry,
                    )

                    # check if premium is zero, if it is, skip
                    getPremium = utils.orm_select(
                        conn,
                        f"select * from onboarding.PolicyData where ReferenceNumber = '{row['ReferenceNumber']}';",
                    )

                    if getPremium and getPremium[0]["Premium"] == 0:
                        logging.debug(
                            f"Policy premium is zero {row['ReferenceNumber']}"
                        )
                        continue

                    if utils.sendQMsg(
                        os.getenv("RMA_SERVICE_QUEUE"),
                        os.getenv("RMA_Q_POLICY_CREATE"),
                        resultDict,
                    ):
                        logging.debug("Sent to queue")
                        utils.orm_query(
                            conn,
                            f"update onboarding.PolicyData set StatusNote = 'Policy queue for transfer' where ReferenceNumber = '{row['ReferenceNumber']}';",
                        )
                    # print(row)
                    # exit()
                logging.debug("Policies sent to modernisation")
                markAsComplete()
                lastId = result[-1]["PolicyDataId"]
                result = controllers.get_approved_policies(
                    conn, allowedPolicies, lastId
                )
                time.sleep(10)
                # print("lastId", lastId)

                # exit()
                # result = None

    except Exception as e:
        logging.error(e)
        raise e


def sendPoliciesModernisationManual(policyId):
    try:
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            session_conn = utils.orm_session(os.getenv("DATABASE_URL"), False)
            # update Approved policies reference number
            controllers.update_approved_policies_ref(conn)

            # get Approved policies
            result = controllers.get_approved_policy(conn, policyId)
            # send to queue and flag as sent
            if result:
                # convert result to dict
                for row in result:
                    if row["PolicyDataId"] != policyId:
                        continue
                    # print(row)
                    # exit()
                    logging.debug(f"update policy {row['ReferenceNumber']}")

                    resultDict = {"ReferenceNumber": row["ReferenceNumber"]}

                    if controllers.add_service_bus_message(
                        session_conn, row["ReferenceNumber"]
                    ):
                        logging.debug("Added to service bus")

                    utils.orm_query(
                        conn,
                        f"update pm set pm.StartDate = pd.PolicyInceptionDate  from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pm.StartDate is null and pd.ReferenceNumber = '{row["ReferenceNumber"]}';",
                    )

                    utils.orm_query(
                        conn,
                        f"update pm set pm.StatedBenefitId = 0 from onboarding.ServiceBusMessages sbm  inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pm.StatedBenefitId is NULL and pm.coverMemberTypeId = 6 and pd.ReferenceNumber = '{row['ReferenceNumber']}';",
                    )

                    utils.orm_query(
                        conn,
                        f"update m set m.AddressTypeId = 1, m.PostalCode = case when m.PostalCode is NULL then '' else m.PostalCode end from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and m.AddressLine1 is not NULL and pd.ReferenceNumber = '{row['ReferenceNumber']}';",
                    )

                    utils.orm_query(
                        conn,
                        f"with cte as (select distinct pm.PolicyDataId, pm.InsuredMemberId from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pm.MemberTypeId = 10 and pd.ReferenceNumber = '{row['ReferenceNumber']}') update pm2 set pm2.PolicyHolderMemberId = b.InsuredMemberId from onboarding.PolicyMember as pm2 inner join cte as b on pm2.PolicyDataId = b.PolicyDataId;",
                    )

                    utils.orm_query(
                        conn,
                        f"with cte as (select distinct pm.PolicyDataId, sum(pm.benefitRate) as premium from onboarding.ServiceBusMessages sbm inner join onboarding.PolicyData pd on sbm.RequestReferenceNumber  = pd.ReferenceNumber inner join onboarding.PolicyMember pm on pd.PolicyDataId = pm.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId where sbm.ResponseReferenceNumber is null and pd.ReferenceNumber = '{row['ReferenceNumber']}' group by pm.PolicyDataId) update pd set .Premium = b.premium from onboarding.PolicyData pd  inner join cte as b on pd.PolicyDataId = b.PolicyDataId",
                    )

                    # get parent policy info from rma api
                    getProvider = utils.get_rma_api(
                        f"/clc/api/Policy/Policy/{row["providerId"]}"
                    )
                    paymentFrequencyId = None
                    paymentMethodId = None
                    if getProvider:
                        paymentFrequencyId = getProvider["paymentFrequencyId"]
                        paymentMethodId = getProvider["paymentMethodId"]

                    # update paymentFrequencyId and paymentMethodId
                    utils.orm_query(
                        conn,
                        f"update pd set pd.PaymentFrequencyId = {paymentFrequencyId}, pd.PaymentMethodId = {paymentMethodId} from onboarding.PolicyData pd where pd.ReferenceNumber = '{row['ReferenceNumber']}';",
                    )

                    if utils.sendQMsg(
                        os.getenv("RMA_SERVICE_QUEUE"),
                        os.getenv("RMA_Q_POLICY_CREATE"),
                        resultDict,
                    ):
                        logging.debug("Sent to queue")
                        utils.orm_query(
                            conn,
                            f"update onboarding.PolicyData set StatusNote = 'Policy queue for transfer' where ReferenceNumber = '{row['ReferenceNumber']}';",
                        )

    except Exception as e:
        logging.error(e)
        # raise e


# check no benefit not allocated
def noBenefitCheck():
    try:
        qry = """select distinct od.policyId, od.memberType, od.memberTypeId, od.statedBenefit, od.statedBenefitId, od.benefitName, op.coverAmount, od.exceptions, od.id 
from onboarding.onboardingPolicies op (nolock)
inner join onboarding.onboardingData od (nolock) on op.id = od.policyId 
where op.status = 'Approved'
and op.deletedAt is null
and od.deletedAt is null
and od.statedBenefitId is null
and od.memberTypeId = 1
and op.coverAmount = 0"""
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            results = utils.orm_select(conn, qry)
            for row in results:
                logging.debug(f"Policy with no benefit allocated: {row}")
                exceptions = json.loads(row["exceptions"]) if row["exceptions"] else []
                exceptions.append(
                    {
                        "field": "coverAmount",
                        "message": "Unable to allocate benefit - Cover level not found",
                    }
                )
                if controllers.updatePolicyMemberExceptions(
                    conn,
                    row["policyId"],
                    row["id"],
                    exceptions,
                    "Error",
                ):
                    logging.debug(
                        f"Member {row} exceptions updated successfully {exceptions}"
                    )

            conn.commit()
    except Exception as e:
        logging.error(e)
        # raise e


# update rejections from eCare UPDATE_ECARE_REJECTIONS
def updateEcareRejections():
    try:
        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            utils.orm_query(conn, bulkQry.UPDATE_ECARE_REJECTIONS)
            logging.debug("eCare rejections updated")
    except Exception as e:
        logging.error(e)
        # raise e


def main():
    echoOpt = True if os.getenv("SQL_LOG") == "True" else False

    with utils.orm_session(os.getenv("DATABASE_URL"), echoOpt) as conn:
        if controllers.checkBypass(conn, "send4approval"):
            logging.debug("Bypass enabled")
            return
    updateEcareRejections()
    noBenefitCheck()
    markAsComplete()
    allowedPolicies = []
    allowedPolicies = addPolicyApprovals()
    ham = 0
    while allowedPolicies:
        ham += 1
        sendPoliciesModernisation(allowedPolicies)
        logging.debug("Policies sent to modernisation")
        markAsComplete()
        lastId = allowedPolicies[-1]
        allowedPolicies = addPolicyApprovals(lastId)
        if ham >= 5:
            allowedPolicies = []
    markAsComplete()


main()
schedule.every(10).minutes.do(main)

while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
        # print("ready to run")
    schedule.run_pending()


"""
reset

with cte as 
(
select distinct od.id
from onboarding.onboardingData od (nolock)
inner join onboarding.onboardingPolicies op (nolock) on od.policyId = op.id
where op.PolicyDataId = 41121
)
update od 
set od.MemberId = null, od.PolicyMemberId = null
from  onboarding.onboardingData od 
inner join cte as b on od.id = b.id;

delete from  onboarding.PolicyMember 
where policyDataId = 41121;

delete m from onboarding.[Member] m
where not exists(select * from onboarding.PolicyMember (nolock) where insuredMemberId = m.MemberId);

delete from onboarding.ServiceBusMessages  
where RequestReferenceNumber = 'CDA20241008-041121';

"""
