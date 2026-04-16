import schedule
import logging
import time
import os
import utils
import controllers
import dotenv
from models import OnboardingFile, onboardingData, onboardingPolicy
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
import json
from openpyxl import Workbook
import datetime

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))

# def main():
echoOpt = True if os.getenv("SQL_LOG") == "True" else False


def vopdFiles(conn):
    files = utils.orm_select(
        conn,
        """with cte as (
select
	distinct od.fileId,
	idNumber,
	idValid,
	VopdVerified,
	VopdVerificationDate,
	firstName,
	surname,
	dateOfBirth,
	DateOfDeath,
	case
		when DateOfDeath is not null then 'DECEASED'
		else 'ALIVE'
	end as deceased_status,
	vopdResponse
from
	onboarding.onboardingData od (nolock)
	inner join onboarding.onboardingPolicies op (nolock) on od.policyId = op.id and op.deletedAt is null
where
	od.fileId is not null
	and idValid = 1
	and od.deletedAt is null 
	and od.alsoMember = 0
	and VopdVerified = 0
	)
select
	distinct f.id as fileId,
	f.orgFileName,
	f.fileName,
	f.documents
from
	onboarding.Files f (nolock)
where
	not exists(select * from cte where fileId = f.id)
	and coalesce(documents, '') not like '%vopd%'
	and f.status in ('Uploaded', 'submitted');""",
    )
    for file in files:
        keys = [
            "idNumber",
            "idValid",
            "VopdVerificationDate",
            "firstName",
            "surname",
            "status",
            "dateOfBirth",
            "DateOfDeath",
        ]
        vopd = []
        members = utils.orm_select(
            conn,
            f"""select distinct fileId, idNumber, idValid, VopdVerified, VopdVerificationDate, firstName, surname, dateOfBirth, DateOfDeath, case when idValid = 0 then 'NA' when DateOfDeath is not null then 'DECEASED' else 'ALIVE' end as deceased_status, vopdResponse from onboarding.onboardingData od (nolock) where od.fileId is not null and od.fileId = '{file["fileId"]}' and od.alsoMember = 0;""",
        )
        for member in members:
            vopdResponse = None
            firstName = member["firstName"]
            surname = member["surname"]
            deceased_status = member["deceased_status"]
            dateOfBirth = member["dateOfBirth"]
            DateOfDeath = member["DateOfDeath"]
            if member["VopdVerified"] == 1:
                vopdResponse = json.loads(member["vopdResponse"])

                firstName = vopdResponse["firstName"]
                surname = vopdResponse["surname"]
                dateOfBirth = vopdResponse["dateOfBirth"]
                DateOfDeath = vopdResponse["dateOfDeath"]
                deceased_status = "DECEASED" if DateOfDeath else "ALIVE"

            vopd.append(
                [
                    member["idNumber"],
                    member["idValid"],
                    (
                        member["VopdVerificationDate"].strftime("%Y-%m-%d %H:%M:%S")
                        if member["VopdVerificationDate"]
                        else None
                    ),
                    firstName,
                    surname,
                    deceased_status,
                    dateOfBirth,
                    DateOfDeath,
                ]
            )

        # Save the workbook
        newFilename = utils.excelFile(keys, vopd, f"vopd_{file['fileName']}")
        documents = {}
        if file["documents"]:
            documents = json.loads(file["documents"])
        documents["vopd"] = newFilename

        # update file with vopd file
        qry = f"""update onboarding.Files set documents = '{json.dumps(documents)}' where id = '{file["fileId"]}';"""
        utils.orm_query(conn, qry)


def exceptionFiles(conn):
    files = utils.orm_select(
        conn,
        """select distinct f.id as fileId, f.fileName, f.documents from onboarding.Files f (nolock) where not exists(select * from onboarding.onboardingPolicies (nolock) where fileId = f.id and deletedAt is null and status = 'Processing') and f.status not in ('Error', 'failed') and coalesce(f.documents, '') not like '%exceptions%';""",
    )
    for file in files:
        policies = utils.orm_select(
            conn,
            f"""select distinct f.orgFileName, f.fileName, od.policyId, op.PolicyInceptionDate, op.coverAmount, op.ProviderName, od.id, od.fileId, od.fileRow, od.status, od.exceptions, od.memberType, od.memberTypeId, od.firstName, od.surname, case when od.idTypeId = 1 then 'SA ID' else 'Passport' end as idType, od.idNumber, od.dateOfBirth, od.DateOfDeath, od.benefitName, od.previousInsurer, od.previousInsurerPolicyNumber, od.previousInsurerJoinDate, od.previousInsurerCancellationDate, od.PreviousInsurerCoverAmount, od.address1, od.address2, od.city, od.province, od.country, od.areaCode, od.telephone, od.mobile, od.email, case when od.preferredMethodOfCommunication = '1' then 'Email' when od.preferredMethodOfCommunication = '2' then 'Phone' when od.preferredMethodOfCommunication = '3' then 'SMS' when od.preferredMethodOfCommunication = '4' then 'Post' else null end as preferredMethodOfCommunication, od.isStudent, od.isBeneficiary, od.isDisabled from onboarding.onboardingPolicies op (nolock) inner join onboarding.onboardingData od (nolock) on op.id = od.policyId inner join onboarding.Files f (nolock) on op.fileId = f.id where op.status = 'Error' and od.alsoMember = 0 and od.deletedAt is null and op.deletedAt is null and op.fileId = '{file["fileId"]}' order by od.policyId, od.memberTypeId, od.fileRow;""",
        )
        keys = [
            "ProviderName",
            "policyId",
            "exceptions",
            "memberType",
            "isBeneficiary",
            "firstName",
            "surname",
            "idNumber",
            "dateOfBirth",
            "PolicyInceptionDate",
            "coverAmount",
            "benefitName",
            "isStudent",
            "isDisabled",
            "previousInsurer",
            "previousInsurerPolicyNumber",
            "previousInsurerJoinDate",
            "previousInsurerCancellationDate",
            "PreviousInsurerCoverAmount",
            "address1",
            "address2",
            "city",
            "province",
            "areaCode",
            "telephone",
            "mobile",
            "email",
            "preferredMethodOfCommunication",
        ]
        policiesArr = []
        for policy in policies:
            exceptions = (
                json.loads(policy["exceptions"]) if policy["exceptions"] else []
            )
            # add "message" for each row in exceptions to one string
            policy["message"] = ""
            for exception in exceptions:
                if (
                    "message" in exception
                    and exception["message"] not in policy["message"]
                ):
                    policy["message"] = policy["message"] + exception["message"] + ", "

            # remove last comma
            policy["message"] = policy["message"][:-2]

            policiesArr.append(
                [
                    policy["ProviderName"],
                    policy["policyId"],
                    policy["message"],
                    policy["memberType"],
                    policy["isBeneficiary"],
                    policy["firstName"],
                    policy["surname"],
                    policy["idNumber"],
                    policy["dateOfBirth"],
                    policy["PolicyInceptionDate"].strftime("%Y-%m-%d %H:%M:%S"),
                    policy["coverAmount"],
                    policy["benefitName"],
                    policy["isStudent"],
                    policy["isDisabled"],
                    policy["previousInsurer"],
                    policy["previousInsurerPolicyNumber"],
                    policy["previousInsurerJoinDate"],
                    policy["previousInsurerCancellationDate"],
                    policy["PreviousInsurerCoverAmount"],
                    policy["address1"],
                    policy["address2"],
                    policy["city"],
                    policy["province"],
                    policy["areaCode"],
                    policy["telephone"],
                    policy["mobile"],
                    policy["email"],
                    policy["preferredMethodOfCommunication"],
                ]
            )

        if len(policiesArr) == 0:
            continue
        # Save the workbook
        newFilename = utils.excelFile(
            keys, policiesArr, f"rejections_{file['fileName']}"
        )
        documents = {}
        if file["documents"]:
            documents = json.loads(file["documents"])
        documents["exceptions"] = newFilename

        # update file with vopd file
        qry = f"""update onboarding.Files set documents = '{json.dumps(documents)}' where id = '{file["fileId"]}';"""
        utils.orm_query(conn, qry)
        logging.debug(
            f"File {file['fileName']} has been updated with exceptions {file["fileId"]}"
        )


def duplicatesFiles(conn):
    files = utils.orm_select(
        conn,
        """select distinct f.id as fileId, f.fileName, f.documents from onboarding.Files f (nolock) where not exists(select * from onboarding.onboardingPolicies (nolock) where fileId = f.id and deletedAt is null and status = 'Processing') and f.status not in ('Error', 'failed') and coalesce(f.documents, '') not like '%duplicates%';""",
    )
    for file in files:
        policies = utils.orm_select(
            conn,
            f"""select distinct f.orgFileName, f.fileName, od.policyId, op.PolicyInceptionDate, op.coverAmount, op.ProviderName, od.id, od.fileId, od.fileRow, od.status, od.exceptions, od.memberType, od.memberTypeId, od.firstName, od.surname, case when od.idTypeId = 1 then 'SA ID' else 'Passport' end as idType, od.idNumber, od.dateOfBirth, od.DateOfDeath, od.benefitName, od.previousInsurer, od.previousInsurerPolicyNumber, od.previousInsurerJoinDate, od.previousInsurerCancellationDate, od.PreviousInsurerCoverAmount, od.address1, od.address2, od.city, od.province, od.country, od.areaCode, od.telephone, od.mobile, od.email,  case when od.preferredMethodOfCommunication = '1' then 'Email' when od.preferredMethodOfCommunication = '2' then 'Phone' when od.preferredMethodOfCommunication = '3' then 'SMS' when od.preferredMethodOfCommunication = '4' then 'Post' else null end as preferredMethodOfCommunication, od.isStudent, od.isBeneficiary, od.isDisabled from onboarding.onboardingPolicies op (nolock) inner join onboarding.onboardingData od (nolock) on op.id = od.policyId inner join onboarding.Files f (nolock) on op.fileId = f.id where op.status = 'Duplicate' and od.alsoMember = 0 and od.deletedAt is null and op.deletedAt is null and op.fileId = '{file["fileId"]}' order by od.policyId, od.memberTypeId, od.fileRow;""",
        )
        keys = [
            "ProviderName",
            "policyId",
            "exceptions",
            "memberType",
            "isBeneficiary",
            "firstName",
            "surname",
            "idNumber",
            "dateOfBirth",
            "PolicyInceptionDate",
            "coverAmount",
            "benefitName",
            "isStudent",
            "isDisabled",
            "previousInsurer",
            "previousInsurerPolicyNumber",
            "previousInsurerJoinDate",
            "previousInsurerCancellationDate",
            "PreviousInsurerCoverAmount",
            "address1",
            "address2",
            "city",
            "province",
            "areaCode",
            "telephone",
            "mobile",
            "email",
            "preferredMethodOfCommunication",
        ]
        policiesArr = []
        for policy in policies:
            # load exceptions
            exceptions = (
                json.loads(policy["exceptions"]) if policy["exceptions"] else []
            )

            # get message for field coveramount in exceptions if field = coverAmount and message contains duplicate cover
            coverAmount = None
            for exception in exceptions:
                if (
                    "field" in exception
                    and exception["field"] == "coverAmount"
                    and "duplicate cover" in exception["message"].lower()
                ):
                    coverAmount = exception["message"]

            policiesArr.append(
                [
                    policy["ProviderName"],
                    policy["policyId"],
                    coverAmount,
                    policy["memberType"],
                    policy["isBeneficiary"],
                    policy["firstName"],
                    policy["surname"],
                    policy["idNumber"],
                    policy["dateOfBirth"],
                    policy["PolicyInceptionDate"].strftime("%Y-%m-%d %H:%M:%S"),
                    policy["coverAmount"],
                    policy["benefitName"],
                    policy["isStudent"],
                    policy["isDisabled"],
                    policy["previousInsurer"],
                    policy["previousInsurerPolicyNumber"],
                    policy["previousInsurerJoinDate"],
                    policy["previousInsurerCancellationDate"],
                    policy["PreviousInsurerCoverAmount"],
                    policy["address1"],
                    policy["address2"],
                    policy["city"],
                    policy["province"],
                    policy["areaCode"],
                    policy["telephone"],
                    policy["mobile"],
                    policy["email"],
                    policy["preferredMethodOfCommunication"],
                ]
            )

        if len(policiesArr) == 0:
            continue
        # Save the workbook
        newFilename = utils.excelFile(
            keys, policiesArr, f"duplicates_{file['fileName']}"
        )
        documents = {}
        if file["documents"]:
            documents = json.loads(file["documents"])
        documents["duplicates"] = newFilename

        # update file with vopd file
        qry = f"""update onboarding.Files set documents = '{json.dumps(documents)}' where id = '{file["fileId"]}';"""
        utils.orm_query(conn, qry)


def cleanedFiles(conn):
    files = utils.orm_select(
        conn,
        """select distinct f.id as fileId, f.fileName, f.documents from onboarding.Files f (nolock) where not exists(select * from onboarding.onboardingPolicies (nolock) where fileId = f.id and deletedAt is null and status = 'Processing') and f.status not in ('Error', 'failed') and coalesce(f.documents, '') not like '%cleaned%';""",
    )
    for file in files:
        policies = utils.orm_select(
            conn,
            f"""select distinct f.orgFileName, f.fileName, od.policyId, op.PolicyInceptionDate, op.coverAmount, op.ProviderName, od.id, od.fileId, od.fileRow, od.status, od.exceptions, od.memberType, od.memberTypeId, od.firstName, od.surname, case when od.idTypeId = 1 then 'SA ID' else 'Passport' end as idType, od.idNumber, od.dateOfBirth, od.DateOfDeath, od.benefitName, od.previousInsurer, od.previousInsurerPolicyNumber, od.previousInsurerJoinDate, od.previousInsurerCancellationDate, od.PreviousInsurerCoverAmount, od.address1, od.address2, od.city, od.province, od.country, od.areaCode, od.telephone, od.mobile, od.email,  case when od.preferredMethodOfCommunication = '1' then 'Email' when od.preferredMethodOfCommunication = '2' then 'Phone' when od.preferredMethodOfCommunication = '3' then 'SMS' when od.preferredMethodOfCommunication = '4' then 'Post' else null end as preferredMethodOfCommunication, od.isStudent, od.isBeneficiary, od.isDisabled, od.statedBenefit, od.premium from onboarding.onboardingPolicies op (nolock) inner join onboarding.onboardingData od (nolock) on op.id = od.policyId inner join onboarding.Files f (nolock) on op.fileId = f.id where op.status = 'Submitted' and od.alsoMember = 0 and od.deletedAt is null and op.deletedAt is null and op.fileId = '{file["fileId"]}' order by od.policyId, od.memberTypeId, od.fileRow;""",
        )
        keys = [
            "ProviderName",
            "policyId",
            "memberType",
            "isBeneficiary",
            "firstName",
            "surname",
            "idNumber",
            "dateOfBirth",
            "PolicyInceptionDate",
            "coverAmount",
            "statedBenefit",
            "premium",
            "isStudent",
            "isDisabled",
            "previousInsurer",
            "previousInsurerPolicyNumber",
            "previousInsurerJoinDate",
            "previousInsurerCancellationDate",
            "PreviousInsurerCoverAmount",
            "address1",
            "address2",
            "city",
            "province",
            "areaCode",
            "telephone",
            "mobile",
            "email",
            "preferredMethodOfCommunication",
        ]
        policiesArr = []
        for policy in policies:

            policiesArr.append(
                [
                    policy["ProviderName"],
                    policy["policyId"],
                    policy["memberType"],
                    policy["isBeneficiary"],
                    policy["firstName"],
                    policy["surname"],
                    policy["idNumber"],
                    policy["dateOfBirth"],
                    policy["PolicyInceptionDate"].strftime("%Y-%m-%d %H:%M:%S"),
                    policy["coverAmount"],
                    policy["statedBenefit"],
                    policy["premium"],
                    policy["isStudent"],
                    policy["isDisabled"],
                    policy["previousInsurer"],
                    policy["previousInsurerPolicyNumber"],
                    policy["previousInsurerJoinDate"],
                    policy["previousInsurerCancellationDate"],
                    policy["PreviousInsurerCoverAmount"],
                    policy["address1"],
                    policy["address2"],
                    policy["city"],
                    policy["province"],
                    policy["areaCode"],
                    policy["telephone"],
                    policy["mobile"],
                    policy["email"],
                    policy["preferredMethodOfCommunication"],
                ]
            )

        if len(policiesArr) == 0:
            continue
        # Save the workbook
        newFilename = utils.excelFile(keys, policiesArr, f"cleaned_{file['fileName']}")
        documents = {}
        if file["documents"]:
            documents = json.loads(file["documents"])
        documents["cleaned"] = newFilename

        # update file with vopd file
        qry = f"""update onboarding.Files set documents = '{json.dumps(documents)}' where id = '{file["fileId"]}';"""
        utils.orm_query(conn, qry)


def main():
    with utils.orm_conn(os.getenv("DATABASE_URL"), False) as conn:
        if controllers.checkBypass(conn, "generate_files"):
            logging.debug("Bypass enabled")
            return
        # reset files where policies may be processing
        qry = """with cte as (
        select distinct op.fileId
        from onboarding.onboardingPolicies op (nolock)
        where op.status = 'Processing'
        )
        update f
        set f.documents = null
        from onboarding.Files f 
        inner join cte as b on f.id = b.fileId and f.documents is not null;"""
        utils.orm_query(conn, qry)
        logging.debug("Files reset")

        vopdFiles(conn)
        logging.debug("VOPD files processed")
        exceptionFiles(conn)
        logging.debug("Exceptions files processed")
        duplicatesFiles(conn)
        logging.debug("Duplicates files processed")
        cleanedFiles(conn)
        logging.debug("Cleaned files processed")

        # update files to submitted, if submitted available
        qry = """with cte as (
        select distinct f.id
        from onboarding.Files f (nolock)
        inner join onboarding.onboardingPolicies op (nolock) on f.id = op.fileId 
        where f.status = 'Uploaded'
        and f.deletedAt is null
        and op.status in ('Submitted')
        ),
        cte2 as (
        select distinct f.id
        from onboarding.Files f (nolock)
        inner join onboarding.onboardingPolicies op (nolock) on f.id = op.fileId 
        where f.status = 'Uploaded'
        and f.deletedAt is null
        and op.status in ('Processing')
        )
        update f
        set f.status = 'submitted', f.statusDescription = 'File submitted for approval', f.updatedAt = CURRENT_TIMESTAMP 
        from onboarding.Files f
        where f.status = 'Uploaded'
        and f.deletedAt is null
        and exists(select * from cte where id = f.id)
        and not exists(select * from cte2 where id = f.id);"""
        utils.orm_query(conn, qry)


main()
# will check every minute for new files
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
