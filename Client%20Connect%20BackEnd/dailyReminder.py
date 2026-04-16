import schedule
import time
import os
import utils
import logging
import utils
import controllers
import json
import dotenv

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))


def alertEmail(bypass=False):
    # don't run on weekends
    if not bypass and time.strftime("%A") in ["Saturday", "Sunday"]:
        return

    with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
        if controllers.checkBypass(conn, "dailyReminder"):
            logging.debug("Bypass enabled")
            return

        summaryQry = """with cte as (
SELECT DISTINCT 
    CASE 
        WHEN op.createdBy LIKE '%randmutual.co.za' THEN op.createdBy
        ELSE 'Non-RMA/Brokers' 
    END AS user_type, 
        op.ProviderName,
    COALESCE(f.orgFileName, 'Manual') as [file],
    cast(max(op.updatedAt) as date) as lastUpdate,
    COUNT(op.id) AS policies,
    SUM(CASE WHEN op.status = 'Complete' THEN 1 ELSE 0 END) AS Complete,
    SUM(CASE WHEN op.status = 'Approved' THEN 1 ELSE 0 END) AS Approved,
    SUM(CASE WHEN op.status = 'Error' THEN 1 ELSE 0 END) AS Error,
    SUM(CASE WHEN op.status = 'Submitted' THEN 1 ELSE 0 END) AS Submitted,
    SUM(CASE WHEN op.status = 'Draft' THEN 1 ELSE 0 END) AS Draft,
    SUM(CASE WHEN op.status = 'Rejected' THEN 1 ELSE 0 END) AS Rejected,
    SUM(CASE WHEN op.status = 'Processing' THEN 1 ELSE 0 END) AS Processing,
    SUM(CASE WHEN op.status = 'Duplicate' THEN 1 ELSE 0 END) AS Duplicate
FROM onboarding.onboardingPolicies op (NOLOCK)
LEFT JOIN onboarding.Files f (nolock) on op.fileId = f.id 
WHERE op.deletedAt IS NULL
AND cast(op.updatedAt as date) < CAST(GETDATE() - 0 AS DATE)
GROUP BY 
    CASE 
        WHEN op.createdBy LIKE '%randmutual.co.za' THEN op.createdBy
        ELSE 'Non-RMA/Brokers' 
    END,
     COALESCE(f.orgFileName, 'Manual'),
     op.ProviderName
    )
    select *
    from cte 
    where Approved > 0
     or Processing > 0
    order by 1,2, 4 desc"""

        getSummary = utils.orm_select(conn, summaryQry)

        if not getSummary:
            logging.debug("No policies to alert")
            return

        # get list of user in summary
        users = []
        for summary in getSummary:
            if summary["user_type"] in users:
                continue
            logging.debug(summary)
            users.append(summary["user_type"])

        emailBody = f"There are policies that are stuck on Client Connect."

        for user in users:
            logging.debug(f"User: {user}")

            bodyTable = "<tr><th style='border: 1px solid black;  padding: 8px;'>Scheme</th><th style='border: 1px solid black;  padding: 8px;'>Filename</th><th style='border: 1px solid black;  padding: 8px;'>Total Policies</th><th style='border: 1px solid black;  padding: 8px;'>Processing</th><th style='border: 1px solid black;  padding: 8px;'>Approved</th><th style='border: 1px solid black;  padding: 8px;'>Last Updated</th></tr>"

            for summary in getSummary:
                if summary["user_type"] == user:
                    bodyTable += f"<tr><td style='border: 1px solid black;  padding: 8px;'>{summary['ProviderName']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['file']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['policies']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Processing']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Approved']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['lastUpdate']}</td></tr>"

            emailBody += f"<br><br><b>USER: {user}</b><br><table style='border: 1px solid black; border-collapse: collapse;'>{bodyTable}</table>"

            userPolicies = []

            logging.debug(userPolicies)

        utils.sendEmailNotification(
            os.getenv("EMAIL_ALERTS"),
            "Client Connect Alert - Policies Stuck",
            emailBody,
            contentType="HTML",
        )

        bodyTable = None
        getSummary = None
        summaryQry = None


def dailyReminder(bypass=False, testing=None):
    # don't run on weekends
    if not bypass and time.strftime("%A") in ["Saturday", "Sunday"]:
        return

    with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
        if controllers.checkBypass(conn, "dailyReminder"):
            logging.debug("Bypass enabled")
            return

        summaryQry = """with cte as (
SELECT DISTINCT 
    op.createdBy AS user_type, 
    op.ProviderName,
    COALESCE(f.orgFileName, 'Manual') as [file],
    op.fileId,
    cast(max(op.updatedAt) as date) as lastUpdate,
    COUNT(op.id) AS policies,
    SUM(CASE WHEN op.status = 'Complete' THEN 1 ELSE 0 END) AS Complete,
    SUM(CASE WHEN op.status = 'Approved' THEN 1 ELSE 0 END) AS Approved,
    SUM(CASE WHEN op.status = 'Error' THEN 1 ELSE 0 END) AS Error,
    SUM(CASE WHEN op.status = 'Submitted' THEN 1 ELSE 0 END) AS Submitted,
    SUM(CASE WHEN op.status = 'Draft' THEN 1 ELSE 0 END) AS Draft,
    SUM(CASE WHEN op.status = 'Rejected' THEN 1 ELSE 0 END) AS Rejected,
    SUM(CASE WHEN op.status = 'Processing' THEN 1 ELSE 0 END) AS Processing,
    SUM(CASE WHEN op.status = 'Duplicate' THEN 1 ELSE 0 END) AS Duplicate
FROM onboarding.onboardingPolicies op (NOLOCK)
LEFT JOIN onboarding.Files f (nolock) on op.fileId = f.id 
WHERE op.deletedAt IS NULL
AND cast(op.updatedAt as date) < CAST(GETDATE() - 1 AS DATE)
GROUP BY 
    op.createdBy,
     COALESCE(f.orgFileName, 'Manual'),
     op.ProviderName,
     op.fileId
    )
    select *
    from cte 
    where (Error > 0
     or Draft > 0
     or Rejected > 0
     or Duplicate > 0)
    and Processing = 0
    order by 1,2, 4 desc"""

        # get list of policies status by user
        getSummary = utils.orm_select(conn, summaryQry)

        # get list of user in summary
        users = []
        for summary in getSummary:
            if summary["user_type"] in users:
                continue
            logging.debug(summary)
            users.append(summary["user_type"])

        for user in users:
            emailBody = f"There are policies that you need to clear on Client Connect."
            bodyTable = "<tr><th style='border: 1px solid black;  padding: 8px;'>Scheme</th><th style='border: 1px solid black;  padding: 8px;'>Filename</th><th style='border: 1px solid black;  padding: 8px;'>Total Policies</th><th style='border: 1px solid black;  padding: 8px;'>Draft</th><th style='border: 1px solid black;  padding: 8px;'>Error</th><th style='border: 1px solid black;  padding: 8px;'>Duplicate</th><th style='border: 1px solid black;  padding: 8px;'>Rejected</th><th style='border: 1px solid black;  padding: 8px;'>Last Updated</th></tr>"

            for summary in getSummary:
                if summary["user_type"] == user:
                    fileLink = (
                        f"https://clientconnect.randmutual.co.za/Onboarding/MyPolicies"
                        if summary["file"] == "Manual"
                        else f"https://clientconnect.randmutual.co.za/Onboarding/MyFiles/{summary['fileId']}"
                    )

                    bodyTable += f"<tr><td style='border: 1px solid black;  padding: 8px;'>{summary['ProviderName']}</td><td style='border: 1px solid black;  padding: 8px;'><a href='{fileLink}'>{summary['file']}</a></td><td style='border: 1px solid black;  padding: 8px;'>{summary['policies']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Draft']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Error']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Duplicate']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Rejected']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['lastUpdate']}</td></tr>"

            emailBody += f"<br><br><table style='border: 1px solid black; border-collapse: collapse;'>{bodyTable}</table>"

            utils.sendEmailNotification(
                testing if testing else user,
                "Client Connect Reminder - Outstanding Onboarding of Policies ",
                emailBody,
                contentType="HTML",
            )


def dailyReminderAllocation(bypass=False, testing=None):
    # don't run on weekends
    if not bypass and time.strftime("%A") in ["Saturday", "Sunday"]:
        return

    with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
        if controllers.checkBypass(conn, "dailyReminder"):
            logging.debug("Bypass enabled")
            return

        summaryQry = """with cte as (
SELECT DISTINCT 
    op.createdBy AS user_type, 
    op.ProviderName,
    COALESCE(f.orgFileName, 'Manual') as [file],
    op.fileId,
    cast(max(op.updatedAt) as date) as lastUpdate,
    COUNT(op.id) AS policies,
    SUM(CASE WHEN op.status = 'Complete' THEN 1 ELSE 0 END) AS Complete,
    SUM(CASE WHEN op.status = 'Approved' THEN 1 ELSE 0 END) AS Approved,
    SUM(CASE WHEN op.status = 'Error' THEN 1 ELSE 0 END) AS Error,
    SUM(CASE WHEN op.status = 'Submitted' THEN 1 ELSE 0 END) AS Submitted,
    SUM(CASE WHEN op.status = 'Draft' THEN 1 ELSE 0 END) AS Draft,
    SUM(CASE WHEN op.status = 'Rejected' THEN 1 ELSE 0 END) AS Rejected,
    SUM(CASE WHEN op.status = 'Processing' THEN 1 ELSE 0 END) AS Processing,
    SUM(CASE WHEN op.status = 'Duplicate' THEN 1 ELSE 0 END) AS Duplicate
FROM onboarding.onboardingPolicies op (NOLOCK)
LEFT JOIN onboarding.Files f (nolock) on op.fileId = f.id 
WHERE op.deletedAt IS NULL
AND cast(op.updatedAt as date) < CAST(GETDATE() - 1 AS DATE)
GROUP BY 
    op.createdBy,
     COALESCE(f.orgFileName, 'Manual'),
     op.ProviderName,
     op.fileId
    )
    select *
    from cte 
    where (Error > 0
     or Draft > 0
     or Rejected > 0
     or Duplicate > 0)
    and Processing = 0
    order by 1,2, 4 desc"""

        # get list of policies status by user
        getSummary = utils.orm_select(conn, summaryQry)

        # get list of user in summary
        users = []
        for summary in getSummary:
            if summary["user_type"] in users:
                continue
            logging.debug(summary)
            users.append(summary["user_type"])

        for user in users:
            emailBody = f"There are policies that you need to clear on Client Connect."
            bodyTable = "<tr><th style='border: 1px solid black;  padding: 8px;'>Scheme</th><th style='border: 1px solid black;  padding: 8px;'>Filename</th><th style='border: 1px solid black;  padding: 8px;'>Total Policies</th><th style='border: 1px solid black;  padding: 8px;'>Draft</th><th style='border: 1px solid black;  padding: 8px;'>Error</th><th style='border: 1px solid black;  padding: 8px;'>Duplicate</th><th style='border: 1px solid black;  padding: 8px;'>Rejected</th><th style='border: 1px solid black;  padding: 8px;'>Last Updated</th></tr>"

            for summary in getSummary:
                if summary["user_type"] == user:
                    fileLink = (
                        f"https://clientconnect.randmutual.co.za/Onboarding/MyPolicies"
                        if summary["file"] == "Manual"
                        else f"https://clientconnect.randmutual.co.za/Onboarding/MyFiles/{summary['fileId']}"
                    )

                    bodyTable += f"<tr><td style='border: 1px solid black;  padding: 8px;'>{summary['ProviderName']}</td><td style='border: 1px solid black;  padding: 8px;'><a href='{fileLink}'>{summary['file']}</a></td><td style='border: 1px solid black;  padding: 8px;'>{summary['policies']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Draft']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Error']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Duplicate']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Rejected']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['lastUpdate']}</td></tr>"

            emailBody += f"<br><br><table style='border: 1px solid black; border-collapse: collapse;'>{bodyTable}</table>"

            utils.sendEmailNotification(
                testing if testing else user,
                "Client Connect Reminder - Outstanding Onboarding of Policies ",
                emailBody,
                contentType="HTML",
            )


def dailyReminderManagement(bypass=False, testing=None):
    # don't run on weekends
    if not bypass and time.strftime("%A") in ["Saturday", "Sunday"]:
        return

    with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
        if controllers.checkBypass(conn, "dailyReminder"):
            logging.debug("Bypass enabled")
            return

        summaryQry = """with cte as (
SELECT DISTINCT 
   CASE 
        WHEN op.createdBy LIKE '%randmutual.co.za' THEN op.createdBy
        ELSE 'Non-RMA/Brokers' 
    END AS user_type, 
    op.ProviderName,
    cast(max(op.updatedAt) as date) as lastUpdate,
    COUNT(op.id) AS policies,
    SUM(CASE WHEN op.status = 'Complete' THEN 1 ELSE 0 END) AS Complete,
    SUM(CASE WHEN op.status = 'Approved' THEN 1 ELSE 0 END) AS Approved,
    SUM(CASE WHEN op.status = 'Error' THEN 1 ELSE 0 END) AS Error,
    SUM(CASE WHEN op.status = 'Submitted' THEN 1 ELSE 0 END) AS Submitted,
    SUM(CASE WHEN op.status = 'Draft' THEN 1 ELSE 0 END) AS Draft,
    SUM(CASE WHEN op.status = 'Rejected' THEN 1 ELSE 0 END) AS Rejected,
    SUM(CASE WHEN op.status = 'Processing' THEN 1 ELSE 0 END) AS Processing,
    SUM(CASE WHEN op.status = 'Duplicate' THEN 1 ELSE 0 END) AS Duplicate
FROM onboarding.onboardingPolicies op (NOLOCK)
LEFT JOIN onboarding.Files f (nolock) on op.fileId = f.id 
WHERE op.deletedAt IS NULL
AND cast(op.updatedAt as date) < CAST(GETDATE() - 1 AS DATE)
GROUP BY 
    CASE 
        WHEN op.createdBy LIKE '%randmutual.co.za' THEN op.createdBy
        ELSE 'Non-RMA/Brokers' 
    END, 
     op.ProviderName
    )
    select *
    from cte 
    where (Error > 0
     or Draft > 0
     or Rejected > 0
     or Duplicate > 0)
    and Processing = 0
    order by 1,2, 4 desc"""

        # get list of policies status by user
        getSummary = utils.orm_select(conn, summaryQry)

        # get list of user in summary
        users = []

        for summary in getSummary:
            if summary["user_type"] in users:
                continue
            logging.debug(summary)
            users.append(summary["user_type"])

        emailBody = f"There are policies that are outstanding on Client Connect."

        for user in users:
            emailBody += f"<br><br>User: {user}"

            bodyTable = "<tr><th style='border: 1px solid black;  padding: 8px;'>Scheme</th><th style='border: 1px solid black;  padding: 8px;'>Total Policies</th><th style='border: 1px solid black;  padding: 8px;'>Draft</th><th style='border: 1px solid black;  padding: 8px;'>Error</th><th style='border: 1px solid black;  padding: 8px;'>Duplicate</th><th style='border: 1px solid black;  padding: 8px;'>Rejected</th><th style='border: 1px solid black;  padding: 8px;'>Last Updated</th></tr>"

            for summary in getSummary:
                if summary["user_type"] == user:
                    bodyTable += f"<tr><td style='border: 1px solid black;  padding: 8px;'>{summary['ProviderName']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['policies']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Draft']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Error']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Duplicate']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['Rejected']}</td><td style='border: 1px solid black;  padding: 8px;'>{summary['lastUpdate']}</td></tr>"

            emailBody += f"<br><br><table style='border: 1px solid black; border-collapse: collapse;'>{bodyTable}</table>"

        utils.sendEmailNotification(
            testing if testing else os.getenv("EMAIL_MANAGEMENT"),
            "Client Connect Summary - Outstanding Onboarding of Policies ",
            emailBody,
            contentType="HTML",
        )


schedule.every().day.at("09:00").do(alertEmail)
schedule.every().day.at("08:00").do(dailyReminder)
schedule.every().day.at("09:00").do(dailyReminderManagement)
# schedule.every().day.at("08:00").do(dailyReminderAllocation)
# dailyReminderManagement()
# bypassEnabled = True
# alertEmail(bypassEnabled)
# dailyReminder(bypassEnabled, "lourens@cdasolutions.co.za")
# dailyReminderManagement(bypassEnabled, "lourens@cdasolutions.co.za")
# dailyReminderAllocation(bypassEnabled, "lourens@cdasolutions.co.za")


while True:
    n = schedule.idle_seconds()
    logging.debug(f"Sleeping for {n} seconds")
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
        # print("ready to run")
    schedule.run_pending()
