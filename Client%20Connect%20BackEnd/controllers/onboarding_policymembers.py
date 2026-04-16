import json
import logging
from models import (
    OnboardingMember,
    OnboardingPolicyMember,
    OnboardingPolicy,
    AstuteResponse,
    PolicyCheck,
    onboardingPolicy,
    onboardingData,
)
from sqlalchemy import func, and_, update, case, or_, select
import utils
from datetime import datetime, timedelta


# function ro return object
def fmt_obj(field, error):
    # field = field.replace("_", " ").title()
    return {
        "field": field,
        "message": error,
    }


# @description: get member details by policyId
def getMemberBenefitsByPolicyId(db_conn, policyId):
    try:
        s = (
            select(OnboardingPolicyMember)
            .with_hint(OnboardingPolicyMember, "WITH (NOLOCK)")
            .where(
                OnboardingPolicyMember.policyId == policyId,
                OnboardingPolicyMember.memberType != "Beneficiary",
            )
            .with_only_columns(
                OnboardingPolicyMember.policyId,
                OnboardingPolicyMember.PolicyMemberId,
                OnboardingPolicyMember.statedBenefitId,
                OnboardingPolicyMember.premium,
                OnboardingPolicyMember.onboardingDataId,
            )
        )
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as e:
        logging.error(e)
        return None


def updateMemberPremium(db_conn, policyMemberId, policyId, onboardDataId, premium):
    try:
        stmt = (
            update(OnboardingPolicyMember)
            .where(
                OnboardingPolicyMember.PolicyMemberId == policyMemberId,
                OnboardingPolicyMember.policyId == policyId,
            )
            .values(premium=premium, benefitRate=premium)
        )
        db_conn.execute(stmt)

        stmt = (
            update(onboardingData)
            .where(onboardingData.id == onboardDataId)
            .values(premium=premium)
        )
        db_conn.execute(stmt)
        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(e)
        return False


# @description: update member isVOPDverifeid
def updateMemberVOPD(db_conn, idNumber, vopdVerificationDate):
    try:
        stmt = (
            update(OnboardingMember)
            .where(
                OnboardingMember.idNumber == idNumber,
                OnboardingMember.vopdVerified == False,
            )
            .values(vopdVerified=True, vopdVerificationDate=vopdVerificationDate)
        )
        db_conn.execute(stmt)
        db_conn.commit()
        s = (
            OnboardingMember.__table__.select()
            .where(OnboardingMember.idNumber == idNumber)
            .with_only_columns(OnboardingMember.idNumber, OnboardingMember.id)
        )
        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        for res in resultSet:
            # set status to VOPD Complete
            stmt = (
                update(OnboardingPolicyMember)
                .where(
                    OnboardingPolicyMember.memberId == res["id"],
                    OnboardingPolicyMember.status == "Waiting for VOPD",
                )
                .values(status="VOPD Complete")
            )
            db_conn.execute(stmt)
        db_conn.commit()
        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(e)
        return False


# @description: get member details by idNumber with any astute response
def getMemberAstuteByIdNumber(db_conn, idNumber):
    try:
        s = (
            OnboardingMember.__table__.select()
            .join(AstuteResponse, OnboardingMember.idNumber == AstuteResponse.idNumber)
            .join(
                OnboardingPolicyMember,
                OnboardingMember.id == OnboardingPolicyMember.memberId,
                isouter=True,
            )
            .where(
                OnboardingMember.idNumber == idNumber,
                AstuteResponse.fullResponse.isnot(None),
            )
            .with_only_columns(
                OnboardingMember.idNumber,
                OnboardingMember.id,
                OnboardingMember.firstName,
                OnboardingMember.surname,
                OnboardingMember.dateOfBirth,
                AstuteResponse.firstName.label("astuteFirstName"),
                AstuteResponse.surname.label("astuteSurname"),
                AstuteResponse.dateOfBirth.label("astuteDateOfBirth"),
                AstuteResponse.dateOfDeath.label("astuteDateOfDeath"),
                AstuteResponse.status.label("astuteStatus"),
                AstuteResponse.updatedAt.label("astuteUpdatedAt"),
                OnboardingPolicyMember.exceptions,
                OnboardingPolicyMember.status,
            )
        )

        # return execute query as a list of dictionaries
        result = db_conn.execute(s)

        # add similarity scores for each astute response on firstName and surname
        resultSet = result.mappings().all()
        for res in resultSet:
            res["firstNameSimilarity"] = utils.similarityScores(
                res["firstName"], res["astuteFirstName"]
            )
            res["surnameSimilarity"] = utils.similarityScores(
                res["surname"], res["astuteSurname"]
            )

        return resultSet
    except Exception as e:
        logging.error(e)
        return False


# @description: get member details
def getMembers(db_conn):
    try:
        s = OnboardingMember.__table__.select().with_only_columns(
            OnboardingMember.idNumber,
            OnboardingMember.id,
            OnboardingMember.firstName,
            OnboardingMember.surname,
            OnboardingMember.dateOfBirth,
        )

        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        return resultSet
    except Exception as e:
        logging.error(e)
        return False


# @description: update policies where we can allocate benefits
def updateBenefitAllocateStatus(db_conn):
    try:
        s = (
            OnboardingPolicyMember.__table__.select()
            .with_only_columns(OnboardingPolicyMember.policyId)
            .group_by(OnboardingPolicyMember.policyId)
            .having(
                func.sum(
                    case(
                        (
                            and_(
                                OnboardingPolicyMember.status != "New",
                                OnboardingPolicyMember.status != "VOPD Complete",
                            ),
                            1,
                        ),
                        else_=0,
                    )
                )
                == 0
            )
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        for res in resultSet:
            stmt = (
                update(OnboardingPolicyMember)
                .where(
                    OnboardingPolicyMember.policyId == res["policyId"],
                    OnboardingPolicyMember.memberType != "Beneficiary",
                )
                .values(status="Benefit Allocation")
            )
            db_conn.execute(stmt)
        db_conn.commit()
        return True
    except Exception as e:
        logging.error(e)
        db_conn.rollback()
        return False


# @description: update policies status
def updatePolicyStatus(db_conn, policyId, status):
    try:
        stmt = (
            update(OnboardingPolicy)
            .where(OnboardingPolicy.id == policyId)
            .values(status=status)
        )
        db_conn.execute(stmt)
        # db_conn.commit()
        return True
    except Exception as e:
        logging.error(e)
        db_conn.rollback()
        return False


# @description: update policy to review
def updatePolicyReviewStatus(db_conn, policyId):
    try:
        s = (
            OnboardingPolicyMember.__table__.select()
            .where(
                OnboardingPolicyMember.memberType != "Beneficiary",
                OnboardingPolicyMember.policyId == policyId,
            )
            .with_only_columns(OnboardingPolicyMember.policyId)
            .group_by(OnboardingPolicyMember.policyId)
            .having(
                func.sum(
                    case(
                        (
                            OnboardingPolicyMember.status != "Completed",
                            1,
                        ),
                        else_=0,
                    )
                )
                == 0
            )
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        for res in resultSet:
            stmt = (
                update(OnboardingPolicy)
                .where(OnboardingPolicy.id == res["policyId"])
                .values(status="Review")
            )
            db_conn.execute(stmt)
        db_conn.commit()
        return True
    except Exception as e:
        logging.error(e)
        db_conn.rollback()
        return False


# @description: get summar of policy
def getPolicyInfo(db_conn):
    try:
        s = (
            OnboardingPolicyMember.__table__.select()
            .join(
                OnboardingMember, OnboardingPolicyMember.memberId == OnboardingMember.id
            )
            .join(
                OnboardingPolicy, OnboardingPolicyMember.policyId == OnboardingPolicy.id
            )
            .where(
                OnboardingPolicyMember.status == "Benefit Allocation",
            )
            .group_by(
                OnboardingPolicyMember.policyId,
                OnboardingPolicy.joinDate,
                OnboardingPolicy.coverAmount,
                OnboardingPolicy.productOptionId,
            )
            .with_only_columns(
                OnboardingPolicyMember.policyId,
                OnboardingPolicy.joinDate,
                OnboardingPolicy.coverAmount,
                OnboardingPolicy.productOptionId,
                func.sum(
                    case((OnboardingPolicyMember.memberType == "Child", 1), else_=0)
                ).label("childCount"),
                func.sum(
                    case((OnboardingPolicyMember.memberType == "Spouse", 1), else_=0)
                ).label("spouseCount"),
                func.sum(
                    case(
                        (OnboardingPolicyMember.memberType == "Extended Family", 1),
                        else_=0,
                    )
                ).label("otherCount"),
            )
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        return result.mappings().all()

    except Exception as e:
        logging.error(e)
        return False


# @description: get main member memberId, dob, joinDate, policyId
def getMainMember(db_conn, policyId):
    try:
        s = (
            OnboardingPolicyMember.__table__.select()
            .join(
                OnboardingMember, OnboardingPolicyMember.memberId == OnboardingMember.id
            )
            .join(
                OnboardingPolicy, OnboardingPolicyMember.policyId == OnboardingPolicy.id
            )
            .where(
                OnboardingPolicyMember.memberType == "Main Member",
                OnboardingPolicyMember.status.in_(["Benefit Allocation", "Completed"]),
            )
            .with_only_columns(
                OnboardingPolicyMember.policyId,
                OnboardingPolicyMember.memberId,
                OnboardingMember.dateOfBirth,
                OnboardingPolicyMember.benefit,
                OnboardingPolicyMember.statedBenefitId,
            )
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        return result.mappings().all()

    except Exception as e:
        logging.error(e)
        return False


# @description: get dependants memberId, dob, joinDate, policyId
def getDependentMembers(db_conn, policyId):
    try:
        s = (
            OnboardingPolicyMember.__table__.select()
            .join(
                OnboardingMember, OnboardingPolicyMember.memberId == OnboardingMember.id
            )
            .join(
                OnboardingPolicy, OnboardingPolicyMember.policyId == OnboardingPolicy.id
            )
            .where(
                OnboardingPolicyMember.memberType != "Main Member",
                OnboardingPolicyMember.memberType != "Beneficiary",
                OnboardingPolicyMember.status == "Benefit Allocation",
                OnboardingPolicyMember.policyId == policyId,
            )
            .with_only_columns(
                OnboardingPolicyMember.policyId,
                OnboardingPolicyMember.memberId,
                OnboardingMember.dateOfBirth,
                OnboardingPolicyMember.benefit,
                OnboardingPolicyMember.memberType,
            )
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        return result.mappings().all()

    except Exception as e:
        logging.error(e)
        return False


# @description: update member statedBenefitId
def updateMemberStatedBenefitId(
    db_conn, policyId, memberId, statedBenefitId, statedBenefit
):
    try:
        stmt = (
            update(OnboardingPolicyMember)
            .where(
                OnboardingPolicyMember.policyId == policyId,
                OnboardingPolicyMember.memberId == memberId,
            )
            .values(
                statedBenefitId=statedBenefitId,
                statedBenefit=statedBenefit,
                status="Completed",
            )
        )
        db_conn.execute(stmt)
        db_conn.commit()
        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(e)
        return False


# @description: update extended family membertype to child
def updateMemberType(
    db_conn, policyId, memberId, memberType, memberTypeId, roleplayerTypeId
):
    try:
        stmt = (
            update(OnboardingPolicyMember)
            .where(
                OnboardingPolicyMember.policyId == policyId,
                OnboardingPolicyMember.memberId == memberId,
            )
            .values(
                memberType=memberType,
                memberTypeId=memberTypeId,
                roleplayerTypeId=roleplayerTypeId,
            )
        )
        db_conn.execute(stmt)
        db_conn.commit()
        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(e)
        return False


# @description: get members ID number with astute response but not updated
def return2UpdateVOPD(db_conn, lastId=0, status="completed"):
    try:
        s = (
            onboardingData.__table__.select()
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .join(AstuteResponse, onboardingData.idNumber == AstuteResponse.idNumber)
            .with_hint(AstuteResponse, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingData.policyId == onboardingPolicy.id)
            .where(
                onboardingData.id > lastId,
                onboardingData.idTypeId == 1,
                or_(
                    onboardingData.vopdVerified == False,
                    onboardingData.vopdResponse == None,
                ),
                onboardingData.alsoMember == False,
                onboardingData.deletedAt == None,
                onboardingPolicy.deletedAt == None,
                onboardingData.idValid == True,  # added for not checked
                AstuteResponse.status == status,
                AstuteResponse.updatedAt >= (datetime.now() - timedelta(days=5)),
                # onboardingPolicy.status == "Processing",
            )
            .with_only_columns(
                onboardingData.idNumber,
                onboardingData.id,
                onboardingData.firstName,
                onboardingData.surname,
                onboardingData.dateOfBirth,
                onboardingData.exceptions,
                onboardingData.status,
                onboardingData.policyId,
                onboardingPolicy.status.label("policyStatus"),
                AstuteResponse.firstName.label("astuteFirstName"),
                AstuteResponse.surname.label("astuteSurname"),
                AstuteResponse.dateOfBirth.label("astuteDateOfBirth"),
                AstuteResponse.dateOfDeath.label("astuteDateOfDeath"),
                AstuteResponse.status.label("astuteStatus"),
                AstuteResponse.updatedAt.label("astuteUpdatedAt"),
                AstuteResponse.createdAt.label("astuteCreatedAt"),
                AstuteResponse.deceasedStatus,
                AstuteResponse.maritalStatus,
                AstuteResponse.gender,
                # AstuteResponse.fullResponse,
            )
            .limit(20)
            .order_by(onboardingData.id)
        )
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as e:
        logging.error(f"Error for function return2UpdateVOPD: {e}")
    return None


# @description: update members with astute response fail
def updateMembersAstuteFail(db_conn):
    try:
        resultSet = return2UpdateVOPD(db_conn, "fail")
        while resultSet:
            for res in resultSet:
                logging.debug(res)
                if res["astuteStatus"] != "fail":
                    continue

                if not res["exceptions"]:
                    exceptions = []
                else:
                    exceptions = json.loads(res["exceptions"])

                if not exceptions:
                    exceptions = []

                exceptions = utils.addExceptionsExistingValues(
                    exceptions,
                    "idNumber",
                    f"Invalid ID number - {res['IdNumber']}",
                )

                errors = True if len(exceptions) > 0 else False
                # res["exceptions"] = json.dumps(exceptions)

                # update policy member info
                s = (
                    update(OnboardingPolicyMember)
                    .where(OnboardingPolicyMember.memberId == res["MemberId"])
                    .values(
                        exceptions=json.dumps(exceptions),
                        status="Error" if errors else "Submitted",
                    )
                )
                db_conn.execute(s)

                # if errors update policy status
                if errors:
                    s = (
                        update(OnboardingPolicy)
                        .where(
                            OnboardingPolicy.id == res["PolicyDataId"],
                            OnboardingPolicy.status != "Error",
                            OnboardingPolicy.deletedAt == None,
                        )
                        .values(status="Error", StatusNote="VOPD Error")
                    )
                    db_conn.execute(s)

            db_conn.commit()
            resultSet = return2UpdateVOPD(db_conn, "fail")

        return "Ids updated"
    except Exception as e:
        logging.error(e)
        db_conn.rollback()
        return f"Error {e}"


# @description: update members with astute response
def updateMembersAstute(db_conn):
    try:

        resultSet = return2UpdateVOPD(db_conn)

        while resultSet:
            for res in resultSet:
                similarityScore = None
                logging.debug(res)
                try:
                    if not res["exceptions"]:
                        exceptions = []
                    else:
                        exceptions = json.loads(res["exceptions"])

                    if not exceptions:
                        exceptions = []

                    firstName = res["firstName"]
                    surname = res["surname"]
                    dob = res["dateOfBirth"]
                    dod = None

                    similarityScore = utils.similarityScores(
                        res["astuteFirstName"], res["firstName"]
                    )

                    if (
                        similarityScore["percentage"] > 0
                        or similarityScore["levenshtein"] >= 0.5
                    ):

                        firstName = res["astuteFirstName"]
                    else:
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "firstName",
                            f"First name does not match VOPD - {res['astuteFirstName']}",
                        )

                    similarityScore = None

                    similarityScore = utils.similarityScores(
                        res["astuteSurname"], res["surname"]
                    )

                    if (
                        similarityScore["percentage"] > 0
                        or similarityScore["levenshtein"] >= 0.5
                    ):
                        surname = res["astuteSurname"]
                    else:
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "surname",
                            f"Surname does not match VOPD - {res['astuteSurname']}",
                        )

                    dob = res["astuteDateOfBirth"]

                    # if person deceased then rerunning vopd doesn't matter
                    if res["astuteDateOfDeath"]:
                        dod = res["astuteDateOfDeath"]
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "idNumber",
                            "Member is deceased",
                        )

                    errors = True if len(exceptions) > 0 else False
                    # res["exceptions"] = json.dumps(exceptions)

                    # update member info
                    s = (
                        update(onboardingData)
                        .where(onboardingData.id == res["id"])
                        .values(
                            firstName=firstName,
                            surname=surname,
                            dateOfBirth=dob,
                            dateOfDeath=dod,
                            vopdVerified=True,
                            vopdVerificationDate=res["astuteUpdatedAt"],
                            vopdResponse=json.dumps(
                                {
                                    "idNumber": res["idNumber"],
                                    "status": res["astuteStatus"],
                                    "firstName": res["astuteFirstName"],
                                    "surname": res["astuteSurname"],
                                    "dateOfDeath": (
                                        res["astuteDateOfDeath"].strftime("%Y-%m-%d")
                                        if res["astuteDateOfDeath"]
                                        else None
                                    ),
                                    "dateOfBirth": res["astuteDateOfBirth"].strftime(
                                        "%Y-%m-%d"
                                    ),
                                    "maritalStatus": res["maritalStatus"],
                                    "gender": res["gender"],
                                    "updatedAt": res["astuteUpdatedAt"].strftime(
                                        "%Y-%m-%dT%H:%M:%S.%f"
                                    )[:-3]
                                    + "Z",
                                    "createdAt": res["astuteCreatedAt"].strftime(
                                        "%Y-%m-%dT%H:%M:%S.%f"
                                    )[:-3]
                                    + "Z",
                                    "deceasedStatus": res["deceasedStatus"],
                                }
                            ),
                            exceptions=(
                                json.dumps(exceptions)
                                if res["policyStatus"] == "Processing"
                                else None
                            ),
                            status=(
                                "Error"
                                if errors and res["policyStatus"] == "Processing"
                                else res["status"]
                            ),
                        )
                    )
                    db_conn.execute(s)

                    # if errors update policy status
                    if errors and res["policyStatus"] == "Processing":
                        s = (
                            update(onboardingPolicy)
                            .where(
                                onboardingPolicy.id == res["policyId"],
                                onboardingPolicy.status != "Error",
                            )
                            .values(status="Error", statusNote="VOPD Error")
                        )
                        db_conn.execute(s)
                except Exception as e:
                    logging.error(e)
                    s = (
                        update(AstuteResponse)
                        .where(AstuteResponse.idNumber == res["idNumber"])
                        .values(status="pending")
                    )
                    db_conn.execute(s)

            db_conn.commit()
            lastId = resultSet[-1]["id"]
            resultSet = return2UpdateVOPD(db_conn, lastId)

    except Exception as e:
        logging.error(e)
        db_conn.rollback()
        exit()


# @description: get members ID number with astute response but not updated
def return2UpdateVOPD2(db_conn, lastId=0, status="Processing"):
    try:
        s = (
            onboardingData.__table__.select()
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .join(AstuteResponse, onboardingData.idNumber == AstuteResponse.idNumber)
            .with_hint(AstuteResponse, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingData.policyId == onboardingPolicy.id)
            .where(
                onboardingData.id > lastId,
                onboardingData.idTypeId == 1,
                onboardingData.alsoMember == False,
                onboardingData.deletedAt == None,
                onboardingPolicy.deletedAt == None,
                AstuteResponse.status == "completed",
                AstuteResponse.updatedAt >= (datetime.now() - timedelta(days=31)),
                onboardingPolicy.status == status,
                # ~onboardingPolicy.status.in_(
                #     ["Error", "Complete", "Duplicate", "Rejected", "Draft", "Expired"]
                # ),
                # onboardingPolicy.id == 112078,
            )
            .with_only_columns(
                onboardingData.idNumber,
                onboardingData.id,
                onboardingData.firstName,
                onboardingData.surname,
                onboardingData.dateOfBirth,
                onboardingData.exceptions,
                onboardingData.status,
                onboardingData.policyId,
                onboardingPolicy.status.label("policyStatus"),
                AstuteResponse.firstName.label("astuteFirstName"),
                AstuteResponse.surname.label("astuteSurname"),
                AstuteResponse.dateOfBirth.label("astuteDateOfBirth"),
                AstuteResponse.dateOfDeath.label("astuteDateOfDeath"),
                AstuteResponse.status.label("astuteStatus"),
                AstuteResponse.updatedAt.label("astuteUpdatedAt"),
                AstuteResponse.createdAt.label("astuteCreatedAt"),
                AstuteResponse.deceasedStatus,
                AstuteResponse.maritalStatus,
                AstuteResponse.gender,
                # AstuteResponse.fullResponse,
            )
            .limit(20)
            .order_by(onboardingData.id)
        )
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as e:
        logging.error(f"Error for function return2UpdateVOPD: {e}")
    return None


"""
select distinct op.id, op.status, od.idNumber, od.DateOfDeath, od.memberType, pd.PolicyNumber, op.PolicyInceptionDate
from onboarding.onboardingPolicies op 
inner join onboarding.onboardingData od on op.id = od.policyId 
inner join onboarding.PolicyData pd on op.PolicyDataId = pd.PolicyDataId 
where op.status = 'complete'
and op.deletedAt is null
and od.deletedAt is null
and od.alsoMember = 0
and od.DateOfDeath is not null
"""


# @description: update members with astute response
def updateMembersAstuteDoubleCheck(db_conn, status="Processing", specificId=None):
    try:

        resultSet = return2UpdateVOPD2(db_conn, status=status)

        while resultSet:
            for res in resultSet:
                if specificId and res["policyId"] != specificId:
                    continue
                similarityScore = None
                logging.debug(res)
                try:
                    if not res["exceptions"]:
                        exceptions = []
                    else:
                        exceptions = json.loads(res["exceptions"])

                    if not exceptions:
                        exceptions = []

                    firstName = res["firstName"]
                    surname = res["surname"]
                    dob = res["dateOfBirth"]
                    dod = None

                    similarityScore = utils.similarityScores(
                        res["astuteFirstName"], res["firstName"]
                    )

                    if (
                        similarityScore["percentage"] > 0
                        or similarityScore["levenshtein"] >= 0.5
                    ):

                        firstName = res["astuteFirstName"]
                    else:
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "firstName",
                            f"First name does not match VOPD - {res['astuteFirstName']}",
                        )

                    similarityScore = None

                    similarityScore = utils.similarityScores(
                        res["astuteSurname"], res["surname"]
                    )

                    if (
                        similarityScore["percentage"] > 0
                        or similarityScore["levenshtein"] >= 0.5
                    ):
                        surname = res["astuteSurname"]
                    else:
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "surname",
                            f"Surname does not match VOPD - {res['astuteSurname']}",
                        )

                    dob = res["astuteDateOfBirth"]

                    # if person deceased then rerunning vopd doesn't matter
                    if res["astuteDateOfDeath"]:
                        dod = res["astuteDateOfDeath"]
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "idNumber",
                            "Member is deceased",
                        )

                    errors = True if len(exceptions) > 0 else False
                    # res["exceptions"] = json.dumps(exceptions)

                    # update member info
                    s = (
                        update(onboardingData)
                        .where(onboardingData.id == res["id"])
                        .values(
                            firstName=firstName,
                            surname=surname,
                            dateOfBirth=dob,
                            dateOfDeath=dod,
                            vopdVerified=True,
                            vopdVerificationDate=res["astuteUpdatedAt"],
                            vopdResponse=json.dumps(
                                {
                                    "idNumber": res["idNumber"],
                                    "status": res["astuteStatus"],
                                    "firstName": res["astuteFirstName"],
                                    "surname": res["astuteSurname"],
                                    "dateOfDeath": (
                                        res["astuteDateOfDeath"].strftime("%Y-%m-%d")
                                        if res["astuteDateOfDeath"]
                                        else None
                                    ),
                                    "dateOfBirth": res["astuteDateOfBirth"].strftime(
                                        "%Y-%m-%d"
                                    ),
                                    "maritalStatus": res["maritalStatus"],
                                    "gender": res["gender"],
                                    "updatedAt": res["astuteUpdatedAt"].strftime(
                                        "%Y-%m-%dT%H:%M:%S.%f"
                                    )[:-3]
                                    + "Z",
                                    "createdAt": res["astuteCreatedAt"].strftime(
                                        "%Y-%m-%dT%H:%M:%S.%f"
                                    )[:-3]
                                    + "Z",
                                    "deceasedStatus": res["deceasedStatus"],
                                }
                            ),
                            exceptions=(json.dumps(exceptions)),
                            status=("Error" if errors else res["status"]),
                            # exceptions=(
                            #     json.dumps(exceptions)
                            #     if res["policyStatus"] == "Processing"
                            #     else None
                            # ),
                            # status=(
                            #     "Error"
                            #     if errors and res["policyStatus"] == "Processing"
                            #     else res["status"]
                            # ),
                        )
                    )
                    db_conn.execute(s)

                    # if errors update policy status
                    # if errors and res["policyStatus"] == "Processing":
                    if errors:
                        s = (
                            update(onboardingPolicy)
                            .where(
                                onboardingPolicy.id == res["policyId"],
                                onboardingPolicy.status != "Error",
                            )
                            .values(status="Error", statusNote="VOPD Error")
                        )
                        db_conn.execute(s)
                except Exception as e:
                    logging.error(e)
                    s = (
                        update(AstuteResponse)
                        .where(AstuteResponse.idNumber == res["idNumber"])
                        .values(status="pending")
                    )
                    db_conn.execute(s)

            db_conn.commit()
            lastId = resultSet[-1]["id"]
            resultSet = return2UpdateVOPD2(db_conn, lastId, status=status)
            if specificId and specificId < lastId:
                resultSet = []

    except Exception as e:
        logging.error(e)
        db_conn.rollback()
        exit()


# @description: update members with astute response fail
def updateMembersAstuteFail(db_conn):
    try:

        resultSet = return2UpdateVOPD(db_conn, status="fail")
        similarityScore = None
        while resultSet:
            for res in resultSet:
                if res["astuteStatus"] != "fail":
                    continue

                if res["policyStatus"] == "Complete":
                    continue

                logging.debug(f"fail: {res}")

                if not res["exceptions"]:
                    exceptions = []
                else:
                    exceptions = json.loads(res["exceptions"])

                if not exceptions:
                    exceptions = []

                exceptions = utils.addExceptionsExistingValues(
                    exceptions,
                    "idNumber",
                    f"Invalid ID number - {res['idNumber']}",
                )

                errors = True if len(exceptions) > 0 else False
                # res["exceptions"] = json.dumps(exceptions)

                # update member info
                s = (
                    update(onboardingData)
                    .where(onboardingData.id == res["id"])
                    .values(
                        exceptions=json.dumps(exceptions),
                        status="Error" if errors else "Submitted",
                        idValid=False,
                    )
                )
                db_conn.execute(s)

                # if errors update policy status
                if errors:
                    s = (
                        update(onboardingPolicy)
                        .where(
                            onboardingPolicy.id == res["policyId"],
                            onboardingPolicy.status != "Error",
                        )
                        .values(status="Error", statusNote="VOPD Error")
                    )
                    db_conn.execute(s)

            db_conn.commit()
            lastId = resultSet[-1]["id"]
            resultSet = return2UpdateVOPD(db_conn, lastId, status="fail")

    except Exception as e:
        logging.error(e)
        db_conn.rollback()
