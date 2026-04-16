import os
import schedule
import time
import json
import utils
import logging
import controllers
import dotenv
from models import onboardingData, onboardingPolicy, AstuteResponse
from sqlalchemy import select, update, exists
from sqlalchemy.orm import aliased
import concurrent.futures
from datetime import datetime

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), os.getenv("SQLITE_LOG") == "True")

astuteErrorCount = 0
rmaErrorCount = 0


def parsedRMAResponse(id_no: str):
    global rmaErrorCount
    verificationType = "death-verification"
    getDOB = utils.return_dob(id_no)
    # Ensure getDOB is a date object
    if isinstance(getDOB, str):
        try:
            getDOB = datetime.strptime(getDOB, "%Y-%m-%d").date()
        except ValueError:
            # Try another format or handle error
            getDOB = datetime.strptime(getDOB, "%Y%m%d").date()
    getAge = utils.return_age(getDOB, datetime.now().date())
    if getAge > 21:
        verificationType = "status-verification"
    # verificationType = "death-verification"
    response = utils.RMAQuickTransact(id_no, verificationType)

    if response and rmaErrorCount > 0:
        rmaErrorCount -= 1
    elif not response:
        rmaErrorCount += 1
    finalResponse = None
    if response:
        try:
            # check if key exists "ErrorMessage in json.loads(idSubmission)["VerificationDetails"][0]["ErrorMessage"]
            # check if idSubmission type is string
            if isinstance(response, str):
                idSubmissionJSON = json.loads(response)
            else:
                idSubmissionJSON = response

            if "CacheResult" in idSubmissionJSON and idSubmissionJSON["CacheResult"]:
                logging.debug(f"RMA VOPD Cache hit for ID Number: {id_no}")
                print(response)
                return finalResponse

            if (
                "VerificationResponse" in idSubmissionJSON
                and "VerificationDetails" in idSubmissionJSON["VerificationResponse"]
            ):
                if idSubmissionJSON["StatusCode"] == "200":
                    errorMessage = idSubmissionJSON["VerificationResponse"][
                        "VerificationDetails"
                    ][0]["ErrorMessage"]

                    if (
                        "ID Number valid but not found on NPR" not in errorMessage
                        and "ID Number was not found on Track and Trace"
                        not in errorMessage
                    ):
                        idSubmissionJSON["VerificationResponse"]["VerificationDetails"][
                            0
                        ]["apiMessage"] = idSubmissionJSON["VerificationResponse"][
                            "VerificationDetails"
                        ][
                            0
                        ][
                            "ErrorMessage"
                        ]
                        idSubmissionJSON["VerificationResponse"]["VerificationDetails"][
                            0
                        ]["ErrorMessage"] = ""

                finalResponse = idSubmissionJSON["VerificationResponse"][
                    "VerificationDetails"
                ][0]
            elif (
                "VerificationDetails" not in idSubmissionJSON
                or "ErrorMessage" not in idSubmissionJSON["VerificationDetails"][0]
            ):
                finalResponse = None
            elif response:
                finalResponse = idSubmissionJSON["VerificationDetails"][0]

        except Exception as error:
            logging.error(error)
            finalResponse = None
    if getAge > 21:
        finalResponse["DateOfBirth"] = getDOB.strftime("%Y-%m-%d")
        finalResponse["MaritalStatus"] = "Unknown"
        finalResponse["Gender"] = None
    return finalResponse


def parsedAstuteResponse(id_no: str):
    global astuteErrorCount
    response = utils.validateIdNo(id_no)

    if response and astuteErrorCount > 0:
        astuteErrorCount -= 1
    elif not response:
        astuteErrorCount += 1

    if response and "ResponseData" in response:
        try:
            response_data = json.loads(response["ResponseData"])
            if (
                "VerificationDetails" in response_data
                and len(response_data["VerificationDetails"]) > 0
            ):
                return response_data["VerificationDetails"][0]
        except json.JSONDecodeError as e:
            logging.error(f"Error decoding ResponseData: {e}")

    elif response and "status_code" in response:
        try:
            return response
        except json.JSONDecodeError as e:
            logging.error(f"Error decoding ResponseData: {e}")
    return None


# this function is deprecated, leaving it in for future reference if required
# Lourens 22/12/2025
def processVOPD(idNumber):
    global astuteErrorCount
    global rmaErrorCount
    vopdResults = []
    if astuteErrorCount > 5 or rmaErrorCount > 5:
        logging.error(
            f"Too many errors from Astute ({astuteErrorCount}) or RMA ({rmaErrorCount}), pausing for 30 minutes"
        )
        time.sleep(1800)
        astuteErrorCount = 0
        rmaErrorCount = 0
        return vopdResults

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        AstuteResponse = []
        RMAResponse = []
        # Process idNumber list in pairs
        for i in range(0, len(idNumber), 2):
            if i + 1 < len(idNumber):

                AstuteResponse.append(
                    executor.submit(parsedAstuteResponse, idNumber[i])
                )
                RMAResponse.append(executor.submit(parsedRMAResponse, idNumber[i + 1]))
            else:
                # If odd number, just process the last one with astuteValidateIdNo
                AstuteResponse.append(
                    executor.submit(parsedAstuteResponse, idNumber[i])
                )

        for future in concurrent.futures.as_completed(AstuteResponse):
            vopdResults.append(future.result())

        for future in concurrent.futures.as_completed(RMAResponse):
            vopdResults.append(future.result())
    return vopdResults


def processVOPDRMAOnly(idNumbers):
    global rmaErrorCount
    vopdResults = []
    if rmaErrorCount > 5:
        logging.error(
            f"Too many errors from RMA ({rmaErrorCount}), pausing for 30 minutes"
        )
        time.sleep(1800)
        rmaErrorCount = 0
        return vopdResults

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        RMAResponse = []
        for idNumber in idNumbers:
            logging.debug(f"Submitting RMA VOPD request for ID Number: {idNumber}")
            RMAResponse.append(executor.submit(parsedRMAResponse, idNumber))

        for future in concurrent.futures.as_completed(RMAResponse):
            vopdResults.append(future.result())
    return vopdResults


def updatePassportNumber(conn):
    try:
        s = """update onboarding.onboardingData set idNumber = dateOfBirth where  idTypeId = 2 and idNumber is null and dateOfBirth is not null;"""
        utils.orm_query(conn, s)
    except Exception as error:
        logging.error(error)
    return None


def AddVOPDIDNumbersWithCharacters(conn):
    try:
        s = (
            select(onboardingData)
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .where(onboardingData.idNumber.contains("'"), onboardingData.idTypeId == 2)
            .with_only_columns(
                onboardingData.idNumber,
                onboardingData.firstName,
                onboardingData.surname,
                onboardingData.id,
            )
        )
        result = conn.execute(s)
        resultSet = result.mappings().all()
        for idNumber in resultSet:
            newIdNumber = idNumber["idNumber"].replace("'", "").replace('"', "")
            valid_id = utils.validate_idno(newIdNumber)
            logging.debug(f"idNumber: {newIdNumber} {valid_id}")
            if valid_id:
                s = (
                    update(onboardingData)
                    .where(
                        onboardingData.id == idNumber["id"],
                        onboardingData.idTypeId == 2,
                    )
                    .values(idNumber=newIdNumber, idTypeId=1)
                )
                conn.execute(s)
                conn.commit()
                if controllers.addVOPD(conn, newIdNumber):
                    logging.debug(f"Added VOPD {newIdNumber}")

    except Exception as error:
        logging.error(error)


def ConfirmIdType(conn):
    try:
        s = (
            select(onboardingData)
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingData.policyId == onboardingPolicy.id)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .where(
                onboardingData.idValid == 0,
                onboardingData.idTypeId == 1,
                onboardingPolicy.status == "Processing",
            )
            .with_only_columns(
                onboardingData.idNumber,
                onboardingData.firstName,
                onboardingData.surname,
                onboardingData.id,
                onboardingData.vopdVerified,
            )
        )
        result = conn.execute(s)
        resultSet = result.mappings().all()
        for idNumber in resultSet:

            logging.debug(idNumber)
            newIdNumber = idNumber["idNumber"]
            valid_id = utils.validate_idno(newIdNumber)
            logging.debug(f"idNumber: {newIdNumber} {valid_id}")
            if valid_id:
                s = (
                    update(onboardingData)
                    .where(
                        onboardingData.id == idNumber["id"],
                    )
                    .values(idValid=1)
                )
                conn.execute(s)

                if not idNumber["VopdVerified"] and controllers.addVOPD(
                    conn, newIdNumber
                ):
                    logging.debug(f"Added VOPD {newIdNumber}")

        conn.commit()

    except Exception as error:
        logging.error(error)
        conn.rollback()


def addMissingIDNumbers(conn):
    try:
        aliasVOPDCheck = aliased(AstuteResponse)
        s = (
            select(onboardingData)
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingData.policyId == onboardingPolicy.id)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .where(
                onboardingData.idValid == 1,
                onboardingData.idTypeId == 1,
                onboardingData.vopdVerified == False,
            )
            .with_only_columns(
                onboardingData.policyId,
                onboardingData.idNumber,
                onboardingData.firstName,
                onboardingData.surname,
                onboardingData.id,
                onboardingData.vopdVerified,
            )
            .filter(~exists().where(aliasVOPDCheck.idNumber == onboardingData.idNumber))
        )
        result = conn.execute(s)
        resultSet = result.mappings().all()
        for idNumber in resultSet:

            logging.debug(idNumber)
            newIdNumber = idNumber["idNumber"]
            valid_id = utils.validate_idno(newIdNumber)
            logging.debug(f"idNumber: {newIdNumber} {valid_id}")
            if valid_id:

                if not idNumber["VopdVerified"] and controllers.addVOPD(
                    conn, newIdNumber
                ):
                    logging.debug(f"Added VOPD {newIdNumber}")

        conn.commit()

    except Exception as error:
        logging.error(error)
        conn.rollback()


def checkIds():
    global errorCntv2
    global TransUnionBypass
    try:
        errorCntv2 = 0

        greenEggs = 0
        ham = 0

        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            if controllers.checkBypass(conn, "vopd_requests"):
                logging.debug("Bypass enabled")
                return

            ConfirmIdType(conn)
            logging.debug("Confirmed ID Types")

            updatePassportNumber(conn)
            logging.debug("Updated Passport Numbers")

            AddVOPDIDNumbersWithCharacters(conn)
            logging.debug("Updated ID Numbers with characters")

            controllers.checkValidID(conn)
            logging.debug("Checked Valid ID Numbers")

            controllers.updateVOPDGroupNumber(conn)
            logging.debug("Updated VOPD Group Numbers")

            addMissingIDNumbers(conn)
            logging.debug("Added missing VOPD ID Numbers")

            idNumbers = []
            idNumbersDict = controllers.returnTopNByStatus(conn, "pending", limit=20)
            idNumbers = [item["idNumber"] for item in idNumbersDict]
            # print(idNumbers)
            # exit()

            greenEggs = 0
            while idNumbers:
                results = processVOPDRMAOnly(idNumbers)
                # for idNumber in idNumbers:
                #     print(f"Processing VOPD for ID Number: {idNumber}")
                #     res = parsedRMAResponse(idNumber)
                for res in results:
                    if res is None:
                        continue
                    greenEggs += 1
                    controllers.updateVOPDAlt(conn, res)
                conn.commit()

                time.sleep(10)
                idNumbersDict = controllers.returnTopNByStatus(
                    conn, "pending", limit=20
                )

                idNumbers = [item["idNumber"] for item in idNumbersDict]
                if greenEggs == 200:
                    greenEggs = 0
                    time.sleep(60)
                    idNumbers = []

            qry = """update  vopd.AstuteResponses
            set status = 'fail'
            where fullResponse like '%ID Number valid but not found on NP%'
            and status <> 'fail';
            """
            utils.orm_query(conn, qry)
            logging.debug("Processed VOPD Responses")
    except Exception as error:
        logging.error(error)


# print(parsedRMAResponse("8208131189087"))
# exit()
# print(utils.validateIdNo("0801225022087"))
checkIds()
schedule.every(2).minutes.do(checkIds)
# with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
#     addMissingIDNumbers(conn)

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
