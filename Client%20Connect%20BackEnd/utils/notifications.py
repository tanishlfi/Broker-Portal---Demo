import os
import msal
import requests
import time
import logging


emailToken = None
emailTokenExpiry = None


def acquire_token():
    global emailToken
    global emailTokenExpiry

    # get current epoch time
    current_time = int(time.time())

    if emailTokenExpiry:
        # check if token has expired
        if emailTokenExpiry <= current_time:
            emailToken = None
            emailTokenExpiry = None

    if emailToken:
        return emailToken

    authority_url = f"https://login.microsoftonline.com/{os.getenv('TENANT_ID')}"
    app = msal.ConfidentialClientApplication(
        authority=authority_url,
        client_id=os.getenv("CLIENT_ID"),
        client_credential=os.getenv("SECRET"),
    )
    token = app.acquire_token_for_client(
        scopes=["https://graph.microsoft.com/.default"]
    )

    if token:
        emailToken = token
        # set expiry time
        emailTokenExpiry = current_time + int(token["expires_in"] * 0.90)
        return token

    return None


def sendEmailNotification(
    email_to,
    email_subj,
    email_msg,
    email_cc=None,
    fromEmail="noreply@randmutual.co.za",
    contentType="Text",
    replyTo="clientconnect@cdasolutions.co.za",
):
    result = acquire_token()

    emailAddresses = []

    for eml in email_to.split(","):
        emailAddresses.append({"EmailAddress": {"Address": eml}})

    if "access_token" in result:
        endpoint = f"https://graph.microsoft.com/v1.0/users/{fromEmail}/sendMail"
        email_msg = {
            "Message": {
                "Subject": email_subj,
                "Body": {
                    "ContentType": contentType,
                    "Content": email_msg,
                },
                "ToRecipients": emailAddresses,
            },
            "SaveToSentItems": "false",
        }

        if email_cc:
            email_msg["Message"]["ccRecipients"] = [
                {"EmailAddress": {"Address": email_cc}}
            ]

        if replyTo:
            email_msg["Message"]["ReplyTo"] = [{"EmailAddress": {"Address": replyTo}}]

        r = requests.post(
            endpoint,
            headers={"Authorization": "Bearer " + result["access_token"]},
            json=email_msg,
        )
        if r.ok:
            logging.debug("Email sent")
        else:
            logging.error(f"Error sending email: {r.text}")


def sendEmailGet(
    fromEmail,
):
    result = acquire_token()

    if "access_token" in result:
        endpoint = f"https://graph.microsoft.com/v1.0/users/{fromEmail}/mailFolders"

        r = requests.get(
            endpoint,
            headers={"Authorization": "Bearer " + result["access_token"]},
        )
        if r.ok:
            logging.debug("Email sent")
            print(r.text)
        else:
            logging.error(f"Error sending email: {r.text}")
