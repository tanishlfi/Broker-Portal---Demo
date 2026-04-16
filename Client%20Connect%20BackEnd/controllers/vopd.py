import json
import logging
import utils
from models import AstuteResponse
from sqlalchemy import update, insert, text, func, and_, update, cast, DateTime
from datetime import datetime, timedelta
import controllers
import utils


# @description: return VOPD details for ID number provided if updated in the last 30 days
def returnVOPD(db_conn, idNumber):
    try:
        # print((datetime.now() - timedelta(days=30)))
        s = (
            AstuteResponse.__table__.select()
            .with_hint(AstuteResponse, "WITH (NOLOCK)")
            .where(
                and_(
                    AstuteResponse.idNumber == idNumber,
                    AstuteResponse.fullResponse.isnot(None),
                    AstuteResponse.status == "completed",
                    AstuteResponse.updatedAt >= (datetime.now() - timedelta(days=30)),
                )
            )
            .with_only_columns(
                AstuteResponse.idNumber,
                AstuteResponse.status,
                AstuteResponse.firstName,
                AstuteResponse.surname,
                AstuteResponse.dateOfDeath,
                AstuteResponse.dateOfBirth,
                cast(AstuteResponse.updatedAt, DateTime).label("updatedAt"),
                AstuteResponse.fullResponse,
            )
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as e:
        logging.error(e)
        return []


# @description add new VOPD request
def addVOPD(db_conn, idNumber):
    try:
        s = (
            AstuteResponse.__table__.select()
            .where(AstuteResponse.idNumber == idNumber)
            .with_only_columns(AstuteResponse.idNumber)
            .order_by(AstuteResponse.updatedAt.asc())
        )

        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        if resultSet:
            s = (
                update(AstuteResponse)
                .values(status="pending", queueTransfer=False)
                .where(AstuteResponse.idNumber == idNumber)
            )
        else:
            s = insert(AstuteResponse).values(idNumber=idNumber, status="pending")
        db_conn.execute(s)
        # db_conn.commit()
        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(e)
        return False


# @description: return count of specific status for VOPD requests
def returnVOPDCountByStatus(db_conn, status):
    try:
        s = (
            AstuteResponse.__table__.select()
            .where(AstuteResponse.status == status)
            .with_only_columns(func.count(AstuteResponse.idNumber))
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as e:
        logging.error(e)
    return None


# @description: update VOPD status
def updateVOPDStatus(db_conn, idNumber, new_status="submitted"):
    try:
        s = (
            update(AstuteResponse)
            .values(status=new_status)
            .where(AstuteResponse.idNumber == idNumber)
        )

        db_conn.execute(s)
        db_conn.commit()

        return True
    except Exception as e:
        db_conn.rollback()  # rollback to savepoint
        logging.error(e)
    return False


# @description: update vopd to pending or add new record
def createVOPDrequest(db_conn, idNumber, allocatedNumber, new_status="pending"):
    try:
        # check if record exists
        s = (
            AstuteResponse.__table__.select()
            .where(AstuteResponse.idNumber == idNumber)
            .with_only_columns(AstuteResponse.idNumber)
        )
        result = db_conn.execute(s)
        resultSet = result.mappings().all()

        if resultSet:
            # update status
            s = (
                update(AstuteResponse)
                .values(status=new_status, groupNumber=allocatedNumber)
                .where(AstuteResponse.idNumber == idNumber)
            )
        else:
            # insert new record
            s = insert(AstuteResponse).values(
                idNumber=idNumber, status=new_status, groupNumber=allocatedNumber
            )
        db_conn.execute(s)
        db_conn.commit()

        return True
    except Exception as e:
        db_conn.rollback()  # rollback to savepoint
        logging.error(e)
    return False


# @description: double check if VOPD is valid ID
def checkValidID(db_conn):
    try:
        s = (
            AstuteResponse.__table__.select()
            .where(AstuteResponse.status == "pending")
            .with_only_columns(AstuteResponse.idNumber)
        )
        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        for record in resultSet:
            if not utils.validate_idno(record["idNumber"]):
                s = (
                    update(AstuteResponse)
                    .values(status="fail")
                    .where(AstuteResponse.idNumber == record["idNumber"])
                )
                db_conn.execute(s)
        db_conn.commit()
    except Exception as e:
        db_conn.rollback()
        logging.error(e)


# @description: update VOPD groupNumber where groupNumber = None to random value between 1 and 10
def updateVOPDGroupNumber(db_conn):
    try:
        s = text(
            f"""with cte as (
select distinct ar.idNumber, coalesce(od.fileId, 'Manual') as fileName
FROM vopd.AstuteResponses ar
inner join onboarding.onboardingData od on ar.idNumber = od.idNumber and od.deletedAt is null and od.VopdVerified = 0 and od.idValid = 1
inner join onboarding.onboardingPolicies op on od.policyId = op.id and op.deletedAt is null and op.status not like 'completed'
where ar.status like 'pending'
and ar.groupNumber is null
),
cte2 as (
select fileName, count(idNumber) as ids
from cte
group by fileName
),
cte3 as (
select distinct a.idNumber, case when ids < 100 then 1 when ids < 500 then 2 when ids < 1000 then 3 when ids < 2500 then 4 else 5 end as groupNumber
from cte as a
inner join cte2 as b on a.fileName = b.fileName
)
update ar
set ar.groupNumber = b.groupNumber
from vopd.AstuteResponses ar
inner join cte3 as b on ar.idNumber = b.idNumber
where ar.status like 'pending'
and ar.groupNumber is null"""
        )
        db_conn.execute(s)
        db_conn.commit()
        return True
    except Exception as e:
        db_conn.rollback()  # rollback to savepoint
        logging.error(e)
    return False


# @description: return ID number by status
def returnTopNByStatus(db_conn, status, limit=100):
    try:
        # s = (
        #     AstuteResponse.__table__.select()
        #     # .where(AstuteResponse.status == status)
        #     # .where(AstuteResponse.createdAt >= "2024-02-06")
        #     # .where(
        #     #     AstuteResponse.idNumber.in_(
        #     #         (
        #     #             "",
        #     #         )
        #     #     )
        #     # )
        #     .with_only_columns(AstuteResponse.idNumber).order_by(
        #         AstuteResponse.updatedAt.asc()
        #     )
        #     # .limit(limit)
        # )

        # query that returns x amount of idNumbers per groupNumber
        s = text(
            f"""WITH RankedResponses AS (SELECT idNumber, groupNumber, ROW_NUMBER() OVER (PARTITION BY groupNumber ORDER BY updatedAt ASC) AS RowNum FROM vopd.AstuteResponses (nolock) where status = '{status}') SELECT idNumber FROM RankedResponses WHERE RowNum <= {limit};"""
        )
        # s = text(
        #     f"""select top {limit} idNumber from vopd.AstuteResponses (nolock) where status = '{status}' order by updatedAt asc"""
        # )

        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as e:
        db_conn.rollback()  # rollback to savepoint
        logging.error(e)
        return False


# @description: update VOPD values
def updateVOPD(
    db_conn,
    fullResponse,
):
    try:
        logging.debug("Check if VOPD exists")
        s = (
            AstuteResponse.__table__.select()
            .with_hint(AstuteResponse, "WITH (NOLOCK)")
            .where(
                AstuteResponse.idNumber
                == fullResponse["VerificationDetails"][0]["IdNumber"]
            )
            .with_only_columns(AstuteResponse.idNumber)
            .order_by(AstuteResponse.updatedAt.asc())
        )

        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        updateOnly = False
        if resultSet:
            updateOnly = True
            logging.debug("Updating VOPD")
        else:
            logging.debug("Adding new VOPD")

        if (
            updateOnly
            and fullResponse["VerificationDetails"][0]["ErrorMessage"]
            not in [
                "",
                "Successful",
            ]
            and "cached" not in fullResponse["VerificationDetails"][0]["ErrorMessage"]
        ):
            logging.debug("Updating VOPD to fail")
            s = (
                update(AstuteResponse)
                .values(
                    status="fail",
                    fullResponse=json.dumps(fullResponse),
                    groupNumber=None,
                )
                .where(
                    AstuteResponse.idNumber
                    == fullResponse["VerificationDetails"][0]["IdNumber"]
                )
            )

        elif updateOnly:
            s = (
                update(AstuteResponse)
                .values(
                    status="completed",
                    fullResponse=json.dumps(fullResponse),
                    firstName=fullResponse["VerificationDetails"][0]["Forename"],
                    surname=fullResponse["VerificationDetails"][0]["Surname"],
                    dateOfDeath=fullResponse["VerificationDetails"][0]["DateOfDeath"],
                    dateOfBirth=fullResponse["VerificationDetails"][0]["DateOfBirth"],
                    deceasedStatus=fullResponse["VerificationDetails"][0][
                        "DeceasedStatus"
                    ],
                    # queueTransfer=False,
                    maritalStatus=fullResponse["VerificationDetails"][0][
                        "MaritalStatus"
                    ],
                    gender=fullResponse["VerificationDetails"][0]["Gender"],
                    groupNumber=None,
                )
                .where(
                    AstuteResponse.idNumber
                    == fullResponse["VerificationDetails"][0]["IdNumber"]
                )
            )
        elif fullResponse["VerificationDetails"][0]["ErrorMessage"] not in [
            "",
            "Successful",
        ]:
            s = insert(AstuteResponse).values(
                idNumber=fullResponse["VerificationDetails"][0]["IdNumber"],
                status="fail",
                fullResponse=json.dumps(fullResponse),
                groupNumber=None,
            )

        else:
            # insert new record
            s = insert(AstuteResponse).values(
                idNumber=fullResponse["VerificationDetails"][0]["IdNumber"],
                status="completed",
                fullResponse=json.dumps(fullResponse),
                firstName=fullResponse["VerificationDetails"][0]["Forename"],
                surname=fullResponse["VerificationDetails"][0]["Surname"],
                dateOfDeath=fullResponse["VerificationDetails"][0]["DateOfDeath"],
                dateOfBirth=fullResponse["VerificationDetails"][0]["DateOfBirth"],
                deceasedStatus=fullResponse["VerificationDetails"][0]["DeceasedStatus"],
                # queueTransfer=False,
                maritalStatus=fullResponse["VerificationDetails"][0]["MaritalStatus"],
                gender=fullResponse["VerificationDetails"][0]["Gender"],
                groupNumber=None,
            )
        db_conn.execute(s)
        db_conn.commit()
        logging.debug("VOPD updated or inserted")

        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(f"Error updating VOPD {fullResponse}: {e}")

    return False


def updateVOPDAlt(
    db_conn,
    fullResponse,
):
    try:
        logging.debug("Check if VOPD exists")
        s = (
            AstuteResponse.__table__.select()
            .with_hint(AstuteResponse, "WITH (NOLOCK)")
            .where(AstuteResponse.idNumber == fullResponse["IdNumber"])
            .with_only_columns(AstuteResponse.idNumber)
            .order_by(AstuteResponse.updatedAt.asc())
        )

        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        updateOnly = False
        if resultSet:
            updateOnly = True
            logging.debug("Updating VOPD")
        else:
            logging.debug("Adding new VOPD")

        if (
            updateOnly
            and "ErrorMessage" in fullResponse
            and fullResponse["ErrorMessage"]
            not in [
                "",
                "Successful",
            ]
            and "cached" not in fullResponse["ErrorMessage"]
        ):
            logging.debug("Updating VOPD to fail")
            s = (
                update(AstuteResponse)
                .values(
                    status="fail",
                    fullResponse=json.dumps(fullResponse),
                    groupNumber=None,
                )
                .where(AstuteResponse.idNumber == fullResponse["IdNumber"])
            )
        elif updateOnly and "status_code" in fullResponse:
            logging.debug("Updating VOPD to fail")
            s = (
                update(AstuteResponse)
                .values(
                    status="fail",
                    groupNumber=None,
                )
                .where(AstuteResponse.idNumber == fullResponse["IdNumber"])
            )
        elif updateOnly:
            s = (
                update(AstuteResponse)
                .values(
                    status="completed",
                    fullResponse=json.dumps(fullResponse),
                    firstName=fullResponse["Forename"],
                    surname=fullResponse["Surname"],
                    dateOfDeath=fullResponse["DateOfDeath"],
                    dateOfBirth=fullResponse["DateOfBirth"],
                    deceasedStatus=fullResponse["DeceasedStatus"],
                    maritalStatus=fullResponse["MaritalStatus"],
                    gender=fullResponse["Gender"],
                    groupNumber=None,
                )
                .where(AstuteResponse.idNumber == fullResponse["IdNumber"])
            )
        elif "ErrorMessage" in fullResponse and fullResponse["ErrorMessage"] not in [
            "",
            "Successful",
        ]:
            s = insert(AstuteResponse).values(
                idNumber=fullResponse["IdNumber"],
                status="fail",
                fullResponse=json.dumps(fullResponse),
                groupNumber=None,
            )
        elif "status_code" in fullResponse:
            logging.debug("Updating VOPD to fail")
            s = (
                update(AstuteResponse)
                .values(
                    status="fail",
                    groupNumber=None,
                )
                .where(AstuteResponse.idNumber == fullResponse["IdNumber"])
            )
        else:
            # insert new record
            s = insert(AstuteResponse).values(
                idNumber=fullResponse["IdNumber"],
                status="completed",
                fullResponse=json.dumps(fullResponse),
                firstName=fullResponse["Forename"],
                surname=fullResponse["Surname"],
                dateOfDeath=fullResponse["DateOfDeath"],
                dateOfBirth=fullResponse["DateOfBirth"],
                deceasedStatus=fullResponse["DeceasedStatus"],
                # queueTransfer=False,
                maritalStatus=fullResponse["MaritalStatus"],
                gender=fullResponse["Gender"],
                groupNumber=None,
            )
        db_conn.execute(s)
        # db_conn.commit()
        logging.debug("VOPD updated or inserted")

        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(f"Error updating VOPD {fullResponse}: {e}")

    return False


# @description: get VOPD response where queueTransfer is false
def returnVOPDQueue(db_conn):
    try:
        s = (
            AstuteResponse.__table__.select()
            .where(
                and_(
                    AstuteResponse.queueTransfer == False,
                    AstuteResponse.status == "completed",
                )
            )
            .with_only_columns(
                AstuteResponse.idNumber,
                AstuteResponse.firstName,
                AstuteResponse.surname,
                AstuteResponse.dateOfDeath,
                AstuteResponse.dateOfBirth,
                AstuteResponse.deceasedStatus,
                cast(AstuteResponse.updatedAt, DateTime).label("updatedAt"),
            )
            .limit(100)
            .order_by(AstuteResponse.updatedAt.asc())
        )
        # return execute query as a list of dictionaries
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as e:
        logging.error(e)
    return None


# @description: update VOPD queueTransfer to true
def updateQueueTranferTrue(db_conn, idNumber):
    try:
        s = (
            update(AstuteResponse)
            .values(queueTransfer=True)
            .where(AstuteResponse.idNumber == idNumber)
        )
        db_conn.execute(s)
        db_conn.commit()
        return True
    except Exception as e:
        db_conn.rollback()
        logging.error(e)
    return False
