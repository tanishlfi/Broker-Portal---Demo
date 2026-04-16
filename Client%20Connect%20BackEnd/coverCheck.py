# @description: adds the checks to be completed to a policy
import schedule
import time
import os
import utils
import controllers
import logging
import json
import datetime
import dotenv
import bulkQry
import re


dotenv.load_dotenv(verbose=True)


# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), os.getenv("SQLITE_LOG") == "True")


def setToSubmitted(conn):
    qry = """with cte as (
        select distinct op.id
        from onboarding.onboardingPolicies op (nolock)
        inner join onboarding.onboardingData od (nolock) on op.id = od.policyId
        where op.deletedAt is null
        and op.status = 'Processing'
        and od.deletedAt is null
        and od.alsoMember = 0
        and od.memberTypeId <> 6
        and COALESCE(od.statedBenefitId, 0) = 0
        )
        update  pc
        set pc.status = 1
        from onboarding.policy_checks pc
        inner join onboarding.onboardingPolicies op (nolock) on pc.policyId = op.id and op.status = 'Processing'
        where pc.checkDescr = 'Benefit Allocation'
        and pc.status = 0
        and not exists(select * from cte where id = op.id);"""
    utils.orm_query(conn, qry)
    logging.debug("Policies stated benefit id checked")

    # check for errors
    qry = "update pd set pd.status = 'Error', pd.statusNote = 'Issue on Policy' from onboarding.onboardingData pm  inner join onboarding.onboardingPolicies pd on pm.policyId = pd.id where pm.status = 'Error' and pd.status not in ('Complete','Error','Rejected','Duplicate','Removed', 'Expired') and pd.deletedAt is null;"
    utils.orm_query(conn, qry)

    # set ready
    qry = """with cte as (
    select distinct op.id
    from onboarding.policy_checks pc (nolock)
    inner join onboarding.onboardingPolicies op (nolock) on pc.policyId = op.id and op.status = 'Processing'
    where op.deletedAt is null
    and op.status = 'Processing'
    and pc.status = 1
    )
    update  op
    set op.status = 'Submitted', op.statusNote = 'Ready for approval'
    from onboarding.onboardingPolicies op
    inner join cte as b on op.id = b.id
    where op.status = 'Processing'
    and op.deletedAt is null
    and not exists(select * from onboarding.policy_checks (nolock) where policyId = op.id and status = 0);"""
    utils.orm_query(conn, qry)
    logging.debug("Policies submitted")


# @description: get max cover
# @params: db_conn, parentPolicyId
def getMaxAge(db_conn, parentPolicyId):
    try:
        getProvider = utils.get_rma_api(
            f"/clc/api/Policy/Policy/{parentPolicyId}", manualCache=True
        )
        # print(getProvider)
        if getProvider:
            productOptionId = getProvider["productOptionId"]
            qry = f"""select pob.productOptionId, max(br.maxAge) as maxAge
    from rules.BenefitRules br (nolock)
    inner join rules.ProductOptionBenefits pob (nolock) on br.benefitId = pob.benefitId and pob.productOptionId = {productOptionId}
    group by pob.productOptionId;"""
            result = utils.orm_select(db_conn, qry)
            # print(result)
            if result:
                return result[0]["maxAge"]
    except Exception as e:
        logging.error(f"Error: {e}")
        # logging.error("Traceback: %s", traceback.format_exc())
    return None


# @description: get max cover
# @params: db_conn, parentPolicyId
def getCoverLevel(db_conn, parentPolicyId, coverAmount):
    outcome = None
    getProvider = utils.get_rma_api(
        f"/clc/api/Policy/Policy/{parentPolicyId}", manualCache=True
    )
    # print(getProvider)
    if getProvider:
        outcome = True
        productOptionId = getProvider["productOptionId"]
        qry = f"""select pob.productOptionId, benefitAmount 
from rules.BenefitRules br (nolock)
inner join rules.ProductOptionBenefits pob (nolock) on br.benefitId = pob.benefitId and pob.productOptionId = {productOptionId} and benefitAmount = {coverAmount};"""
        result = utils.orm_select(db_conn, qry)

        # if result is empty then set outcome to False
        if not result:
            outcome = False
        # print(result)
        return outcome
    return None


# check for duplicate of beneficiary and update on policy
def checkDuplicateBeneficiary(conn, PolicyDataId):
    try:
        s = f"with cte as (select pm.PolicyDataId , pm.PolicyMemberId, pm.memberType, m.IdNumber, m.FirstName, m.Surname, m.IdType from onboarding.PolicyMember pm  (nolock) inner join onboarding.PolicyData pd  (nolock) on pm.PolicyDataId = pd.PolicyDataId inner join onboarding.[Member] m   (nolock) on pm.InsuredMemberId = m.MemberId where  idType = 2 and memberType = 'Beneficiary' and pd.PolicyDataId = {PolicyDataId}) update pm set pm.isBeneficiary = 1 from onboarding.PolicyMember pm inner join onboarding.PolicyData pd on pm.PolicyDataId = pd.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId inner join cte as a on pm.PolicyDataId = a.PolicyDataId and m.IdNumber = a.IdNumber and m.FirstName = a.FirstName and m.Surname = a.Surname where  m.idType = 2 and pm.memberType <> 'Beneficiary';"
        utils.orm_query(conn, s)

        s = f"with cte as (select pm.PolicyDataId , pm.PolicyMemberId, pm.memberType, m.IdNumber, m.FirstName, m.Surname, m.IdType from onboarding.PolicyMember pm  (nolock) inner join onboarding.PolicyData pd  (nolock) on pm.PolicyDataId = pd.PolicyDataId inner join onboarding.[Member] m  (nolock) on pm.InsuredMemberId = m.MemberId where  idType = 2 and memberType <> 'Beneficiary' and pm.isBeneficiary = 1 and pd.PolicyDataId = {PolicyDataId}) delete pm from onboarding.PolicyMember pm inner join onboarding.PolicyData pd on pm.PolicyDataId = pd.PolicyDataId inner join onboarding.[Member] m on pm.InsuredMemberId = m.MemberId inner join cte as a on pm.PolicyDataId = a.PolicyDataId and m.IdNumber = a.IdNumber and m.FirstName = a.FirstName and m.Surname = a.Surname where  m.idType = 2 and pm.memberType = 'Beneficiary';"
        utils.orm_query(conn, s)

    except Exception as e:
        logging.error(f"Error: {e}")
        # logging.error("Traceback: %s", traceback.format_exc())


recheckCover = []
recheckCounter = 0


def checkCover(conn):
    global recheckCover
    global recheckCounter
    recheckCounter = recheckCounter + 1

    # logging.debug(f"recheckCounter {recheckCounter}")
    # logging.debug(f"recheckCover {recheckCover}")

    if recheckCounter > 5:
        recheckCover = []
        recheckCounter = 0

    # if recheckCounter == 3:
    #     logging.debug(
    #         f"recheckCover {recheckCover} recheckCounter {recheckCounter}"
    #     )
    try:
        # policies = controllers.getPoliciesWaitVOPD(conn,status="Approved")
        policies = controllers.getPoliciesWaitVOPD(conn)
        lastPolicy = 0
        # iMaxRun = 0
        # maxRun = 250
        while policies:

            for policy in policies:
                if policy["id"] in recheckCover:
                    continue
                # iMaxRun += 1
                logging.debug(f"Checking policy {policy}")

                policyError = False

                if policy["parentPolicyId"] == None:
                    logging.debug(f"Policy {policy} has no parent policy")

                    controllers.updatePolicy(
                        conn, policy["id"], "Error", "Scheme not allocated"
                    )

                    continue
                # get  rma endpoint clc/api/Policy/Policy/:id
                getParentPolicy = utils.get_rma_api(
                    f"/clc/api/Policy/Policy/{policy['parentPolicyId']}",
                    manualCache=True,
                )

                if not getParentPolicy:
                    logging.debug(f"Policy {policy} parent policy not found")

                    recheckCover.append(policy["id"])

                    continue

                paymentFrequencyId = getParentPolicy["paymentFrequencyId"]
                paymentMethodId = getParentPolicy["paymentMethodId"]
                AdminPercentage = getParentPolicy["adminPercentage"]
                commissionPercentage = getParentPolicy["commissionPercentage"]
                BinderFeePercentage = getParentPolicy["binderFeePercentage"]
                PremiumAdjustmentPercentage = getParentPolicy[
                    "premiumAdjustmentPercentage"
                ]

                # if AdminPercentage > 0:

                #     logging.debug(f"Policy {policy} has admin or binder fee")

                #     recheckCover.append(policy["id"])

                #     continue

                logging.debug(
                    f"Policy {policy} productOptionId {getParentPolicy ['productOptionId']}"
                )
                logging.debug(
                    f"Policy {policy} policyInceptionDate {getParentPolicy ['policyInceptionDate']}"
                )

                # get /clc/api/Product/Benefit/GetProductBenefitRates/:ProductOptionId/:covertype
                getBenefit = utils.get_rma_api(
                    f"/clc/api/Product/Benefit/GetProductBenefitRates/{getParentPolicy['productOptionId']}/1",
                    manualCache=True,
                )

                if not getBenefit:
                    logging.debug(f"Check benefit {policy} benefit not found")

                    recheckCover.append(policy["id"])
                    # exit()
                    continue

                # check if coveramount is available
                coverFound: bool = False
                for benefit in getBenefit["benefits"]:
                    if (
                        policy["coverAmount"]
                        == benefit["benefitRates"][0]["benefitAmount"]
                    ):
                        logging.debug(f"Policy {policy} benefit found")
                        coverFound = True
                        break

                    else:
                        logging.debug(f"Check benefit 2 {policy} benefit not found")
                        recheckCover.append(policy["id"])
                        # exit()
                        continue

                # deprecated 20240808 LOURENS
                # checkDuplicateBeneficiary(conn, policy["PolicyDataId"])

                # get policy members
                getPolicy = controllers.getPolicy(conn, policy["id"])

                mainMemberCount = 0
                spouseCount = 0
                childCount = 0
                extendedFamilyCount = 0
                unknownCount = 0
                stopProcessing = False
                mainMemberAge = 0
                statedBenefitId = 0

                getPolicy2 = []

                for i, member in enumerate(getPolicy):
                    individualMember = {}
                    if stopProcessing:
                        continue

                    logging.debug(member)

                    # convert member["exceptions"] from string to json
                    exceptions = (
                        json.loads(member["exceptions"]) if member["exceptions"] else []
                    )

                    # convert member["PolicyInceptionDate"] from bytes to string
                    logging.debug(
                        f"Member {member} date of birth {member['PolicyInceptionDate']}"
                    )

                    # convert member["PolicyInceptionDate"] to datetime.date
                    getAge = 0
                    getAge = (
                        utils.return_age(
                            member["dateOfBirth"], member["PolicyInceptionDate"]
                        )
                        # + 1
                    )

                    logging.debug(f"Member {member} age {getAge}")

                    if (
                        member["preferredMethodOfCommunication"]
                        and member["preferredMethodOfCommunication"] == "1"
                        and member["email"] == None
                    ):
                        exceptions.append(
                            {
                                "field": "email",
                                "message": "Email is required for preferred method of communication",
                            }
                        )

                        if controllers.updatePolicyMemberExceptions(
                            conn,
                            member["id"],
                            member["memberId"],
                            exceptions,
                            "Error",
                        ):
                            logging.debug(
                                f"Member {member} exceptions updated successfully {exceptions}"
                            )

                        stopProcessing = True
                        # utils.sendEmailNotification("clientconnect@cdasolutions.co.za", "RMA Client Connect - File Processed", f"Member issue in age, {member} has failed to load. Please check the file and try again.")
                        # exit()
                        continue

                    if getAge is None:

                        exceptions.append(
                            {"field": "dateOfBirth", "message": "Age is unknown"}
                        )
                        # logging.debug(
                        #     f"Member {member} age {getAge} is unknown, exception added {exceptions}"
                        # )
                        if controllers.updatePolicyMemberExceptions(
                            conn,
                            member["id"],
                            member["memberId"],
                            exceptions,
                            "Error",
                        ):
                            logging.debug(
                                f"Member {member} exceptions updated successfully {exceptions}"
                            )

                        stopProcessing = True
                        # utils.sendEmailNotification("clientconnect@cdasolutions.co.za", "RMA Client Connect - File Processed", f"Member issue in age, {member} has failed to load. Please check the file and try again.")
                        # exit()
                        continue

                    logging.debug(f"Member {member} age {getAge}")

                    # invalid age
                    if getAge < 0:
                        exceptions.append(
                            {
                                "field": "dateOfBirth",
                                "message": "Invalid date of birth",
                            }
                        )
                        if controllers.updatePolicyMemberExceptions(
                            conn,
                            member["id"],
                            member["memberId"],
                            exceptions,
                            "Error",
                        ):
                            logging.debug(
                                f"Member {member} exceptions updated successfully {exceptions}"
                            )
                        stopProcessing = True
                        continue

                    # get max age
                    maxAge = None
                    maxAge = getMaxAge(conn, policy["parentPolicyId"])
                    # print(maxAge)
                    # exit()

                    individualMember = dict(member)
                    individualMember["age"] = getAge
                    getPolicy2.append(individualMember)

                    # check if member is main member
                    if member["memberType"] == "Main Member":
                        if not coverFound:
                            logging.debug(f"Cover not found")
                            continue
                            exceptions.append(
                                {
                                    "field": "coverAmount",
                                    "message": "Cover amount not found",
                                }
                            )
                            if controllers.updatePolicyMemberExceptions(
                                conn,
                                member["id"],
                                member["memberId"],
                                exceptions,
                                "Error",
                            ):
                                logging.debug(
                                    f"Member {member} exceptions updated successfully {exceptions}"
                                )
                            stopProcessing = True
                            continue

                        mainMemberAge = getAge

                        mainMemberCount += 1
                        statedBenefitId = member["statedBenefitId"]
                        # check if main member is older than 18
                        if getAge < 18:
                            exceptions.append(
                                {
                                    "field": "dateOfBirth",
                                    "message": "Main member is not older than 18",
                                }
                            )
                            # print(f"Main member is not older than 18")

                            if controllers.updatePolicyMemberExceptions(
                                conn,
                                member["id"],
                                member["memberId"],
                                exceptions,
                                "Error",
                            ):
                                logging.debug(
                                    f"Member {member} exceptions updated successfully {exceptions}"
                                )
                            stopProcessing = True

                            continue

                            # print(f"Max age is {maxAge}")
                        if maxAge and getAge > maxAge:

                            exceptions.append(
                                {
                                    "field": "dateOfBirth",
                                    "message": f"Main member exceeds maximum age of {maxAge} years",
                                }
                            )
                            if controllers.updatePolicyMemberExceptions(
                                conn,
                                member["id"],
                                member["memberId"],
                                exceptions,
                                "Error",
                            ):
                                logging.debug(
                                    f"Member {member} exceptions updated successfully {exceptions}"
                                )
                            stopProcessing = True
                            continue

                        if not member["AddressLine1"]:
                            logging.debug(f"No address details specified")
                            exceptions.append(
                                {
                                    "field": "addressLine1",
                                    "message": "No address details specified",
                                }
                            )
                            if controllers.updatePolicyMemberExceptions(
                                conn,
                                member["id"],
                                member["memberId"],
                                exceptions,
                                "Error",
                            ):
                                logging.debug(
                                    f"Member {member} exceptions updated successfully {exceptions}"
                                )
                            stopProcessing = True
                            continue

                    # check if member is a spouse
                    if member["memberType"] == "Spouse":
                        spouseCount += 1
                        # check if more than 1 spouse
                        if spouseCount > 1:
                            logging.debug(f"More than 1 spouse")
                            exceptions.append(
                                {
                                    "field": "memberType",
                                    "message": "More than 1 spouse",
                                }
                            )
                            if controllers.updatePolicyMemberExceptions(
                                conn,
                                member["id"],
                                member["memberId"],
                                exceptions,
                                "Error",
                            ):
                                logging.debug(
                                    f"Member {member} exceptions updated successfully {exceptions}"
                                )
                            stopProcessing = True
                            continue

                    # check if member is a child
                    if member["memberType"] == "Child":
                        childCount += 1
                        # check if more then 6 children
                        if childCount > 6:
                            logging.debug(f"More than 6 kids")
                            exceptions.append(
                                {
                                    "field": "memberType",
                                    "message": "More than 6 children",
                                }
                            )
                            if controllers.updatePolicyMemberExceptions(
                                conn,
                                member["id"],
                                member["memberId"],
                                exceptions,
                                "Error",
                            ):
                                logging.debug(
                                    f"Member {member} exceptions updated successfully {exceptions}"
                                )
                            stopProcessing = True
                            continue

                    # check if member is a extended family
                    if member["memberType"] == "Extended Family":
                        extendedFamilyCount += 1

                    if member["memberType"] not in [
                        "Main Member",
                        "Spouse",
                        "Child",
                        "Extended Family",
                        "Beneficiary",
                    ]:
                        unknownCount += 1
                        exceptions.append(
                            {
                                "field": "memberType",
                                "message": "Member type is unknown",
                            }
                        )
                        if controllers.updatePolicyMemberExceptions(
                            conn,
                            member["id"],
                            member["memberId"],
                            exceptions,
                            "Error",
                        ):
                            logging.debug(
                                f"Member {member} exceptions updated successfully {exceptions}"
                            )
                        stopProcessing = True
                        continue

                # check if getParentPolicy['policyInceptionDate'].date() < 2023-02-01
                logging.debug(getParentPolicy["policyInceptionDate"])

                # convert getParentPolicy["policyInceptionDate"] to date, split on T
                policyInceptionDate = datetime.datetime.strptime(
                    getParentPolicy["policyInceptionDate"].split("T")[0], "%Y-%m-%d"
                ).date()

                # logging.debug(policyInceptionDate)

                if mainMemberCount == 0:
                    if controllers.updatePolicy(
                        conn, policy["id"], "Error", "No main member"
                    ):
                        logging.debug(f"Policy {policy} updated successfully")
                    stopProcessing = True
                    continue

                if stopProcessing:
                    logging.debug(f"Policy {policy} members {getPolicy2}")
                    continue

                if getPolicy2 == []:
                    logging.debug(f"Policy {policy} members {getPolicy2}")
                    continue

                logging.debug(f"Policy {policy} members {getPolicy2}")

                if childCount < 6:
                    # loop through ages and check if there are extended family members that are children and set them to children
                    for policyMember in getPolicy2:
                        if (
                            policyMember["memberType"] == "Extended Family"
                            and policyMember["age"] <= 21
                        ):
                            logging.debug(f"Member {policyMember} is a child")
                            policyMember["memberType"] = "Child"
                            policyMember["memberTypeId"] = 3
                            childCount += 1
                            extendedFamilyCount -= 1
                            s = f"update onboarding.onboardingData set memberType = 'Child', memberTypeId = 3 where policyId = {policyMember['id']} and id = {policyMember['memberId']}"
                            utils.orm_query(conn, s)

                # order members by coverMemberTypeId asc
                getPolicy2 = sorted(
                    getPolicy2, key=lambda x: (x["memberTypeId"], -x["age"])
                )

                # exit()

                mainMemberBenefit = []

                currentMainMember = {}

                if statedBenefitId == 0 or statedBenefitId == None:

                    for member2 in getPolicy2:

                        # check if member is main member
                        if member2["memberType"] == "Main Member":
                            currentMainMember = member2

                    logging.debug(f"currentMainMember {currentMainMember}")
                    if currentMainMember["benefit"]:
                        mainMemberBenefit = controllers.getMainMemberBenefitFileBenefit(
                            conn,
                            getParentPolicy["productOptionId"],
                            policy["coverAmount"],
                            mainMemberAge,
                            spouseCount,
                            childCount,
                            extendedFamilyCount,
                            currentMainMember["benefit"],
                        )

                if not mainMemberBenefit and (
                    statedBenefitId == 0 or statedBenefitId == None
                ):

                    mainMemberBenefit = controllers.getMainMemberBenefit(
                        conn,
                        getParentPolicy["productOptionId"],
                        policy["coverAmount"],
                        mainMemberAge,
                        spouseCount,
                        childCount,
                        extendedFamilyCount,
                    )

                if not mainMemberBenefit and (
                    statedBenefitId == 0 or statedBenefitId == None
                ):
                    logging.debug(f"Main member benefit not found")
                    logging.debug(f"Policy {policy} members {getPolicy2}")

                    checkCoverLevel = getCoverLevel(
                        conn, policy["parentPolicyId"], policy["coverAmount"]
                    )

                    # 323 R15 000 m+s+c does not exist
                    if (
                        checkCoverLevel
                        and getParentPolicy["productOptionId"] == 323
                        and policy["coverAmount"] == 15000
                        and spouseCount > 0
                        and childCount > 0
                    ):
                        checkCoverLevel = False
                    # 323 R25000 main member only does not exist
                    if (
                        checkCoverLevel
                        and getParentPolicy["productOptionId"] == 323
                        and policy["coverAmount"] == 25000
                        and spouseCount == 0
                        and childCount == 0
                    ):
                        checkCoverLevel = False

                    # 369 main member only does not exist in cover levels 21000, 16500, 13000, 22500, 18500
                    if (
                        checkCoverLevel
                        and getParentPolicy["productOptionId"] == 369
                        and policy["coverAmount"] in [21000, 16500, 13000, 22500, 18500]
                        and spouseCount == 0
                        and childCount == 0
                    ):
                        checkCoverLevel = False

                    # 326 20 000 m does not exist
                    if (
                        checkCoverLevel
                        and getParentPolicy["productOptionId"] == 326
                        and policy["coverAmount"] == 20000
                        and spouseCount == 0
                        and childCount == 0
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 113
                        and (spouseCount > 0 or childCount > 0)
                        and mainMemberAge > 84
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 326
                        and childCount > 0
                        and policy["coverAmount"] == 15000
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 321
                        and childCount >= 0
                        and spouseCount == 1
                        and policy["coverAmount"] == 20000
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 182
                        and childCount == 0
                        and spouseCount == 0
                        and policy["coverAmount"] in [40000, 75000]
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 182
                        and childCount > 0
                        and spouseCount > 0
                        and policy["coverAmount"] == 75000
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 346
                        and childCount == 0
                        and spouseCount == 0
                        and policy["coverAmount"] in [45000]
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 439
                        and childCount > 0
                        and spouseCount > 0
                        and policy["coverAmount"] in [20000]
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 308
                        and childCount > 0
                        and policy["coverAmount"] in [25000]
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 308
                        and childCount == 0
                        and spouseCount == 0
                        and policy["coverAmount"] in [25000]
                    ):
                        checkCoverLevel = False

                    if getParentPolicy["productOptionId"] == 283 and (
                        childCount > 0 or spouseCount > 0
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 431
                        and childCount == 0
                        and spouseCount == 0
                        and policy["coverAmount"] in [40000]
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 409
                        and childCount == 0
                        and spouseCount == 0
                        and policy["coverAmount"] in [25000]
                    ):
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 415
                        and childCount == 0
                        and spouseCount == 0
                        and policy["coverAmount"] in [35000]
                    ):
                        checkCoverLevel = False

                    if getParentPolicy["productOptionId"] == 12 and mainMemberAge < 65:
                        checkCoverLevel = False

                    if (
                        getParentPolicy["productOptionId"] == 91
                        and (childCount > 0 or spouseCount > 0)
                        and mainMemberAge > 64
                    ):
                        checkCoverLevel = False

                    logging.debug(f"checkCoverLevel {checkCoverLevel}")
                    if not checkCoverLevel:
                        stopProcessing = True
                        recheckCover.append(policy["id"])
                        # continue
                        # get main member
                        for member in getPolicy2:
                            # check if member is main member
                            if member["memberType"] == "Main Member":
                                exceptions.append(
                                    {
                                        "field": "benefit",
                                        "message": "Cannot allocate main member benefit",
                                    }
                                )
                                if controllers.updatePolicyMemberExceptions(
                                    conn,
                                    member["id"],
                                    member["memberId"],
                                    exceptions,
                                    "Error",
                                ):
                                    logging.debug(
                                        f"Member {member} exceptions updated successfully {exceptions}"
                                    )
                            continue

                elif not mainMemberBenefit and statedBenefitId > 0:
                    mainMemberBenefit = controllers.getMainMemberBenefitByBenefitId(
                        conn, statedBenefitId
                    )

                if not mainMemberBenefit:
                    logging.debug(f"Main member benefit not found")
                    logging.debug(f"Policy {policy} members {getPolicy2}")
                    stopProcessing = True
                    recheckCover.append(policy["id"])
                    continue

                mainMemberBenefit = mainMemberBenefit
                logging.debug(f"mainMemberBenefit 2 {mainMemberBenefit}")
                other = mainMemberBenefit["otherBenefit"]
                parent = mainMemberBenefit["parentBenefit"]

                for member in getPolicy2:

                    if stopProcessing:
                        continue

                    # if member statedbenefitid is not 0 or None then continue
                    if (
                        member["statedBenefitId"] != 0
                        and member["statedBenefitId"] != None
                    ):

                        getBenefit = utils.get_rma_api(
                            f"/clc/api/Product/Benefit/{member["statedBenefitId"]}",
                            manualCache=True,
                        )

                        if getBenefit is None:
                            continue
                        # print(getBenefit)
                        if "benefitRates" in getBenefit and getBenefit["benefitRates"]:
                            benefitRate = getBenefit["benefitRates"][0]["baseRate"]
                            getCoverAmount = getBenefit["benefitRates"][0][
                                "benefitAmount"
                            ]

                        if controllers.updatePolicyMemberStatedBenefit(
                            conn,
                            member["id"],
                            member["memberId"],
                            member["statedBenefitId"],
                            getBenefit["name"],
                            benefitRate,
                            commissionPercentage,
                            getCoverAmount,
                            PremiumAdjustmentPercentage,
                            BinderFeePercentage,
                            AdminPercentage,
                        ):
                            logging.debug(
                                f"Member {member} stated benefit updated successfully {mainMemberBenefit['benefitId']}"
                            )
                        continue

                    getAge = 0
                    getAge = member["age"]
                    getCoverAmount = 0

                    if member["memberType"] == "Main Member":
                        getBenefit = utils.get_rma_api(
                            f"/clc/api/Product/Benefit/{mainMemberBenefit["benefitId"]}",
                            manualCache=True,
                        )
                        if "benefitRates" in getBenefit and getBenefit["benefitRates"]:
                            benefitRate = getBenefit["benefitRates"][0]["baseRate"]
                            getCoverAmount = getBenefit["benefitRates"][0][
                                "benefitAmount"
                            ]

                        if controllers.updatePolicyMemberStatedBenefit(
                            conn,
                            member["id"],
                            member["memberId"],
                            mainMemberBenefit["benefitId"],
                            mainMemberBenefit["benefit"],
                            benefitRate,
                            commissionPercentage,
                            getCoverAmount,
                            PremiumAdjustmentPercentage,
                            BinderFeePercentage,
                            AdminPercentage,
                        ):
                            logging.debug(
                                f"Member {member} stated benefit updated successfully {mainMemberBenefit['benefitId']}"
                            )
                            logging.debug(mainMemberBenefit)
                        # exit()
                        continue

                    subGroup = None

                    if (
                        member["memberType"] == "Extended Family"
                        and parent > 0
                        and getAge > 64
                        and getAge <= 84
                    ):
                        subGroup = "Parent"
                        parent -= 1
                    elif (
                        member["memberType"] == "Extended Family"
                        and other > 0
                        and getAge >= 18
                        and getAge <= 64
                    ):
                        subGroup = "Other"
                        other -= 1
                    elif (
                        member["memberType"] == "Extended Family"
                        and parent > 0
                        and other <= 0
                        and getAge >= 18
                        and getAge <= 84
                    ):
                        subGroup = "Parent"
                        parent -= 1

                    print(f"subGroup {subGroup}")

                    getDependantBenefit = controllers.getDependantBenefit(
                        conn,
                        mainMemberBenefit["benefitId"],
                        policy["coverAmount"],
                        member["memberType"],
                        getAge,
                        getParentPolicy["productOptionId"],
                        subGroup,
                    )

                    logging.debug(getDependantBenefit)

                    if (
                        not getDependantBenefit
                        and member["memberType"] == "Child"
                        # and childCount < 6
                        and getAge > 21
                    ):
                        logging.debug(f"Member {member} benefit not found")

                        # exit()
                        # exception for child over 21 and student or disabled benefit
                        exceptions.append(
                            {
                                "field": "benefit",
                                "message": "Member appears to be too old",
                            }
                        )
                        policyError = True
                        # if controllers.updatePolicyMemberExceptions(
                        #     conn,
                        #     member["id"],
                        #     member["memberId"],
                        #     exceptions,
                        #     "Error",
                        # ):
                        #     logging.debug(
                        #         f"Member {member} exceptions updated successfully {exceptions}"
                        #     )
                        # stopProcessing = True
                        # continue

                    if (
                        not getDependantBenefit
                        and member["memberType"] == "Extended Family"
                        and member["benefit"]
                    ):
                        getDependantBenefit = controllers.getDependantBenefitByName(
                            conn, mainMemberBenefit["benefitId"], member["benefit"]
                        )

                    if (
                        not getDependantBenefit
                        and member["memberType"] == "Extended Family"
                        and mainMemberBenefit["benefitId"] == 38932
                    ):
                        logging.debug(f"Member {member} benefit not found")
                        # exit()
                        # exception for child over 21 and student or disabled benefit
                        exceptions.append(
                            {
                                "field": "benefit",
                                "message": "Cannot allocate extended benefit",
                            }
                        )
                        policyError = True
                        # if controllers.updatePolicyMemberExceptions(
                        #     conn,
                        #     member["id"],
                        #     member["memberId"],
                        #     exceptions,
                        #     "Error",
                        # ):
                        #     logging.debug(
                        #         f"Member {member} exceptions updated successfully {exceptions}"
                        #     )
                        # stopProcessing = True
                        # continue

                    if (
                        not getDependantBenefit
                        and member["memberType"] == "Child"
                        and mainMemberBenefit["benefitId"] == 38932
                        and getAge > 21
                    ):
                        logging.debug(f"Member {member} benefit not found")
                        # exit()
                        # exception for child over 21 and student or disabled benefit
                        exceptions.append(
                            {
                                "field": "benefit",
                                "message": "Cannot allocate child benefit, confirm student",
                            }
                        )
                        policyError = True
                        # if controllers.updatePolicyMemberExceptions(
                        #     conn,
                        #     member["id"],
                        #     member["memberId"],
                        #     exceptions,
                        #     "Error",
                        # ):
                        #     logging.debug(
                        #         f"Member {member} exceptions updated successfully {exceptions}"
                        #     )
                        # stopProcessing = True
                        # continue

                    if (
                        not getDependantBenefit
                        and member["memberType"] == "Extended Family"
                    ):
                        getDependantBenefit = controllers.getExtendedMaxCoverBenefit(
                            conn,
                            mainMemberBenefit["benefitId"],
                            policy["coverAmount"],
                            member["memberType"],
                            getAge,
                            getParentPolicy["productOptionId"],
                            subGroup,
                        )

                    if not getDependantBenefit and not policyError:
                        logging.debug(f"Member {member} benefit not found")

                        # check if benefit exists for member type /clc/api/Product/Benefit/GetProductBenefitRates/:ProductOptionId/:covertype
                        getBenefitCheck = utils.get_rma_api(
                            f"/clc/api/Product/Benefit/GetProductBenefitRates/{getParentPolicy['productOptionId']}/{member['memberType']}"
                        )

                        if not getBenefitCheck:
                            logging.debug(f"Member {member} benefit not found")
                            # exit()
                            exceptions.append(
                                {
                                    "field": "benefit",
                                    "message": "Benefit not found",
                                }
                            )
                            policyError = True

                    if getDependantBenefit:
                        getBenefit = utils.get_rma_api(
                            f"/clc/api/Product/Benefit/{getDependantBenefit[0]["dependantBenefitId"]}",
                            manualCache=True,
                        )
                        if "benefitRates" in getBenefit and getBenefit["benefitRates"]:
                            benefitRate = getBenefit["benefitRates"][0]["baseRate"]
                            getCoverAmount = getBenefit["benefitRates"][0][
                                "benefitAmount"
                            ]

                        if controllers.updatePolicyMemberStatedBenefit(
                            conn,
                            member["id"],
                            member["memberId"],
                            getDependantBenefit[0]["dependantBenefitId"],
                            getDependantBenefit[0]["benefit"],
                            benefitRate,
                            commissionPercentage,
                            getCoverAmount,
                            PremiumAdjustmentPercentage,
                            BinderFeePercentage,
                            AdminPercentage,
                        ):
                            logging.debug(
                                f"Member {member} stated benefit updated successfully {mainMemberBenefit['benefitId']}"
                            )
                    # if member["memberType"] == "Child":
                    if policyError:

                        logging.debug(f"Member {member} exceptions {exceptions}")
                        if controllers.updatePolicyMemberExceptions(
                            conn,
                            member["id"],
                            member["memberId"],
                            exceptions,
                            "Error",
                        ):
                            logging.debug(
                                f"Member {member} exceptions updated successfully {exceptions}"
                            )
                        stopProcessing = True

                        # exit()

            conn.commit()
            logging.debug(f"Batch check done")
            setToSubmitted(conn)
            if lastPolicy == policies[-1]["id"]:
                policies = None
            else:
                lastPolicy = policies[-1]["id"]
                policies = controllers.getPoliciesWaitVOPD(conn, lastPolicy)
            # policies = None
    except Exception as e:
        logging.error(f"Error: {e}")
        # logging.error("Traceback: %s", traceback.format_exc())
        recheckCover.append(policy["id"])
        # utils.sendEmailNotification(
        #     "clientconnect@cdasolutions.co.za",
        #     "Cover Check error",
        #     f"Check API possible issue<br /> Error: {e}",
        # )
        # sleep for 10 minutes
        # time.sleep(600)
        # exit()


def checkPoliciesStatedBenefitId(conn):
    policies = controllers.getPoliciesWaitVOPD(conn)
    lastPolicy = 0
    while policies:
        for policy in policies:
            # if policy["PolicyDataId"] > 25:
            #     continue
            logging.debug(f"Checking policy {policy}")

            allBenefitsSet = True
            getPolicy = controllers.getPolicy(conn, policy["id"])
            for member in getPolicy:
                logging.debug(f"Checking member {member}")
                if member["statedBenefitId"] == 0 or member["statedBenefitId"] == None:
                    allBenefitsSet = False

            if allBenefitsSet:
                controllers.updatePolicyCheck(
                    conn, policy["id"], "Benefit Allocation", True
                )
                logging.debug(f"Policy {policy} benefit allocation checked")
        conn.commit()
        if lastPolicy == policies[-1]["id"]:
            policies = None
        else:
            lastPolicy = policies[-1]["id"]
            policies = controllers.getPoliciesWaitVOPD(conn, lastPolicy)
        # policies = None


# @descr: check for invalid ID numbers
def checkInvalidIdNumbers(conn):
    qry = """ with cte as (
        select distinct op.id
        from onboarding.onboardingPolicies op (nolock)
        inner join onboarding.policy_checks pc (nolock) on op.id = pc.policyId and pc.checkDescr = 'VOPD' and pc.status = 0
        where op.deletedAt is null
        and op.status = 'Processing'
        )
        select distinct od.policyId, od.id, od.idNumber, od.exceptions
        from onboarding.onboardingData od (nolock)
        inner join cte as b on od.policyId = b.id
        where od.idTypeId = 1
        and od.deletedAt is null
        and od.alsoMember = 0
        order by od.policyId, od.id;
        """
    result = utils.orm_select(conn, qry)

    for row in result:
        # set exceptions to exception value
        exceptions = [] if row["exceptions"] is None else json.loads(row["exceptions"])

        # check if id number is valid
        if not utils.validate_idno(row["idNumber"]):
            exceptions.append(
                {
                    "field": "idNumber",
                    "message": "Invalid ID number",
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

    qry = """ with cte as (
        select distinct op.id, op.status
        from onboarding.onboardingPolicies op (nolock)
        where op.deletedAt is null
        and op.status  in ('Processing')
        ),
        cte2 as (
        select distinct od.policyId, od.id, od.idNumber, od.exceptions, b.status, od.fileRow
        from onboarding.onboardingData od (nolock)
        inner join cte as b on od.policyId = b.id
        where od.idTypeId = 1
        and od.deletedAt is null
        and od.alsoMember = 0
        ),
        cte3 as (
        select policyId, idNumber
        from cte2
        group by policyId, idNumber
        having count(id) > 1
        )
        select distinct a.*
        from cte2 as a
        inner join cte3 as b on a.policyId = b.policyId and a.idNumber = b.idNumber
        order by a.policyId, a.idNUmber, a.fileRow;
        """
    result = utils.orm_select(conn, qry)
    policyId = 0
    uniqueIdNumbers = []
    for row in result:
        # set exceptions to exception value
        exceptions = [] if row["exceptions"] is None else json.loads(row["exceptions"])

        # logging.debug(f"Duplicate ID number {row}")

        if policyId == 0:
            policyId = row["policyId"]

        if policyId != row["policyId"]:
            policyId = row["policyId"]
            uniqueIdNumbers = []

        if row["idNumber"] in uniqueIdNumbers:
            logging.debug(f"Duplicate ID number {row}")
            exceptions.append(
                {
                    "field": "idNumber",
                    "message": "Duplicate ID number",
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
        else:
            uniqueIdNumbers.append(row["idNumber"])
    conn.commit()

    # reset IDnumbers not process
    sql = """with cte as (
select distinct od.id, od.policyId, od.idNumber, ar.updatedAt
from onboarding.onboardingPolicies op (nolock)
inner join onboarding.onboardingData od (nolock) on op.id = od.policyId 
left join vopd.AstuteResponses ar (nolock) on od.idNumber = ar.idNumber
where op.status = 'Processing'
and od.idTypeId = 1
and od.deletedAt is null
and op.deletedAt is null
and od.VopdVerificationDate is null
AND cast(ar.updatedAt as date) < DATEADD(MONTH, -1, GETDATE())
)
update ar
set ar.status = 'pending', ar.updatedAt = current_timestamp
from  vopd.AstuteResponses ar 
inner JOIN  cte as b on ar.idNumber = b.idNumber;"""

    utils.orm_query(conn, sql)
    conn.commit()


# @descr: check for invalid memberTypeId
def checkMemberTypeId(conn):
    qry = """ select distinct od.policyId, od.id, od.memberTypeId, od.exceptions
    from onboarding.onboardingData od (nolock)
    inner join onboarding.onboardingPolicies op (nolock) on od.policyId = op.id
    where memberTypeId  = 0 
    and od.deletedAt is null 
    and op.deletedAt is null
    and alsoMember = 0 
    and COALESCE(memberType, 'Not') <> 'Unknown';"""
    result = utils.orm_select(conn, qry)
    for row in result:
        # set exceptions to exception value
        exceptions = [] if row["exceptions"] is None else json.loads(row["exceptions"])

        exceptions.append(
            {
                "field": "memberType",
                "message": "Member type is unknown",
            }
        )
        if controllers.updatePolicyMemberExceptions(
            conn,
            row["policyId"],
            row["id"],
            exceptions,
            "Error",
        ):
            logging.debug(f"Member {row} exceptions updated successfully {exceptions}")

        updQry = f"update onboarding.onboardingData set memberType = 'Unknown' where id = {row['id']};"
        utils.orm_query(conn, updQry)
    conn.commit()


def main():
    global recheckCover
    global recheckCounter
    echoOpt = True if os.getenv("SQL_LOG") == "True" else False
    with utils.orm_session(os.getenv("DATABASE_URL"), echoOpt) as conn:

        if controllers.checkBypass(conn, "coverCheck"):
            logging.debug("Bypass enabled")
            recheckCounter = 0
            recheckCover = []
            return

        utils.orm_query(conn, bulkQry.JOINDATE_UPDATE)
        logging.debug("Join date updated")

        controllers.checkPolicyFlag(conn)
        logging.debug("Policy flag checked")

        checkInvalidIdNumbers(conn)
        logging.debug("ID numbers checked")

        checkMemberTypeId(conn)
        logging.debug("Member type checked")

        # updated VOPD status per member fail
        controllers.updateMembersAstuteFail(conn)
        logging.debug("Members Astute Fail updated")
        # updated VOPD status per member
        controllers.updateMembersAstute(conn)
        logging.debug("Members Astute updated")

        # double check processing members after reset
        # controllers.updateMembersAstuteDoubleCheck(conn)
        # logging.debug("Members Astute Double Check updated")
        # exit()

        # updates VOPD check status per policy
        qry = """ with cte as (
                    select distinct op.id
                    from onboarding.onboardingPolicies op (nolock)
                    inner join onboarding.policy_checks pc (nolock) on op.id = pc.policyId and pc.checkDescr = 'VOPD' and pc.status = 0
                    where op.deletedAt is null
                    and op.status = 'Processing'
                    ),
                    cte2 as (
                    select distinct od.policyId
                    from onboarding.onboardingData od (nolock)
                    inner join cte as b on od.policyId = b.id
                    where od.idTypeId = 1
                    and od.deletedAt is null
                    and od.alsoMember = 0
                    and od.vopdResponse is null
                    )
                    update pc
                    set pc.status = 1
                    from onboarding.onboardingPolicies op (nolock)
                    inner join onboarding.policy_checks pc  on op.id = pc.policyId and pc.checkDescr = 'VOPD' and pc.status = 0
                    where op.deletedAt is null
                    and op.status = 'Processing'
                    and not exists(select * from cte2 where policyId = pc.policyId);"""
        utils.orm_query(conn, qry)
        logging.debug("VOPD marked as complete")

        controllers.internalCheckDuplicateCover(conn)
        logging.debug("Internal check duplicate cover")

        controllers.internalCheckPassport(conn)
        logging.debug("Internal check duplicate members")

        # check for errors
        qry = "update pd set pd.status = 'Duplicate', pd.statusNote = 'Possible duplicate for main member on Client Connect' from onboarding.onboardingPolicies pd inner join onboarding.onboardingData od (nolock) on pd.id = od.policyId and od.exceptions like '%Possible duplicate for main member on Client Connect%' where pd.status not in ('Complete', 'Duplicate', 'Stop') and pd.deletedAt is null;"
        utils.orm_query(conn, qry)
        logging.debug("Internal check duplicate cover updated")

        qry = "update pd set pd.status = 'Duplicate', pd.statusNote = 'Possible duplicate for main member on Client Connect' from onboarding.onboardingPolicies pd inner join onboarding.onboardingData od (nolock) on pd.id = od.policyId and od.exceptions like '%Possible duplicate for main member on Client Connect%' where pd.status not in ('Complete', 'Duplicate', 'Stop') and pd.deletedAt is null;"
        utils.orm_query(conn, qry)
        logging.debug("Internal check duplicate cover updated")

        controllers.addRolePlayerId(conn)
        logging.debug("RolePlayerId added")

        qry = """with cte as (
        select pc.id, pc.policyId, op.parentPolicyId, op.allowDuplicate
        from onboarding.policy_checks pc (nolock)
        inner join onboarding.onboardingPolicies op (nolock) on pc.policyId = op.id
        where pc.status = 0
        and op.deletedAt is null
        and op.status = 'Processing'
        and pc.checkDescr in ('Claim for RMA', 'Duplicate cover')
        and not exists(select 1 from onboarding.policy_checks (nolock) where policyId = op.id and status = 0 and checkDescr like 'VOPD')
        and not exists(select 1 from  onboarding.onboardingData (nolock) where policyId = op.id and rolePlayerId is null and memberType <> 'Beneficiary' and deletedAt is null and alsoMember = 0)
        ),
        cte2 as (
        select od.policyId, od.id, od.idNumber, od.exceptions, od.rolePlayerId, od.memberType
        from onboarding.onboardingData od (nolock)
        inner join cte as b on od.policyId = b.policyId
        where od.rolePlayerId > 0
        and od.memberType <> 'Beneficiary'
        and od.deletedAt is null
        and od.alsoMember = 0
        )
        update pc
        set pc.status = 1, pc.updatedAt = current_timestamp
        from onboarding.policy_checks pc
        inner join cte as b on pc.id = b.id
        where not exists(select * from cte2 where policyId = pc.policyId);"""
        utils.orm_query(conn, qry)
        logging.debug("Clear external checks no rolePlayerId")

        controllers.externalChecksPerMember(conn)
        logging.debug("External checks per member added")

        qry = """
          -- set previous insurer details to null if not main member
          update onboarding.onboardingData
          set previousInsurer = null, previousInsurerPolicyNumber = null, previousInsurerCancellationDate = null, previousInsurerJoinDate = null, previousInsurerCoverAmount = 0
          where memberTypeId <> 1
          and deletedAt is null;

          -- set previous insurer details to null if n/a
          update onboarding.onboardingData
          set previousInsurer = null, previousInsurerPolicyNumber = null, previousInsurerCancellationDate = null, previousInsurerJoinDate = null, previousInsurerCoverAmount = 0
          where (previousInsurer = 'N/A' or previousInsurer = 'NA')
          and deletedAt is null;

          -- set addresses to null for none main members
          update onboarding.onboardingData
          set address1=null, address2=null, city=null, province=null, country=null, areaCode=null, postalAddress1=null, postalAddress2=null, postalCity=null, postalProvince=null, postalCountry=null, postalCode=null
          where memberTypeId not in (1)
          and deletedAt is null;

          -- set communication to null for none main members and beneficiaries
          update onboarding.onboardingData
          set telephone=null, mobile=null, email=null, preferredMethodOfCommunication=null
          where memberTypeId not in (1,6)
          and deletedAt is null;
        """
        utils.orm_query(conn, qry)
        logging.debug("Clear address details issues and previous insurer detail issues")

        checkCover(conn)
        logging.debug("Cover checked")

        setToSubmitted(conn)

        utils.orm_query(conn, bulkQry.ONBOARDINGDATA_HISTORY)


main()

schedule.every(5).minutes.do(main)

while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
    schedule.run_pending()
