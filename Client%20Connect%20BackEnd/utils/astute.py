import os
from wsgiref import headers
import requests
import json
import logging
import datetime
import uuid

# cache token in memory
astute_token = None
astute_token_expiry = None


def getToken():
    global astute_token
    global astute_token_expiry

    if (
        astute_token
        and astute_token_expiry
        and astute_token_expiry > datetime.datetime.now()
    ):
        return astute_token
    try:
        url = "https://login.microsoftonline.com/astuteonlinev2.onmicrosoft.com/oauth2/v2.0/token"

        payload = {
            "grant_type": "client_credentials",
            "scope": f"https://astuteonlinev2.onmicrosoft.com/{os.getenv('ASTUTE_CLIENT_ID')}/.default",
            "client_id": os.getenv("ASTUTE_CLIENT_ID"),
            "client_secret": os.getenv("ASTUTE_SECRET"),
        }

        response = requests.request("POST", url, data=payload)

        if response.status_code == 200:
            resp_json = response.json()
            astute_token = resp_json["access_token"]
            expires_in = resp_json["expires_in"]
            astute_token_expiry = datetime.datetime.now() + datetime.timedelta(
                seconds=expires_in - 300
            )  # refresh 5 minutes before expiry
            return astute_token
        else:
            logging.error(
                f"Failed to get token: {response.status_code} - {response.text}"
            )
    except Exception as e:
        logging.error(f"Error getting token: {e}")
    return None


def validateIdNo(id_no: str):
    token = getToken()
    # print(f"Token: {token}")
    if not token:
        return None

    url = "https://intgateway.astutefse.com/external/vopd-prod/RequestVerification"

    payload = json.dumps(
        {
            "TransRefGuid": str(uuid.uuid4()),
            "TrackingReference": "VOPD API UAT Testing",
            "VopdRequestDetails": [
                {
                    "VopdVerificationType": 2,
                    "MessageId": "VOPD API",
                    "VopdIdType": 4,
                    "IdReferenceNo": id_no,
                }
            ],
        }
    )
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Ocp-Apim-Subscription-Key": os.getenv("ASTUTE_SUBSCRIPTION_KEY"),
        "Basic-Authorization": os.getenv("ASTUTE_BASIC_AUTH"),
    }

    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        # print(response)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 500:
            return {
                "IdNumber": id_no,
                "status_code": response.status_code,
                "text": response.text,
                "status": "fail",
            }
        else:
            logging.error(
                f"Failed to validate ID No {id_no}: {response.status_code} - {response.text}"
            )
    except Exception as e:
        logging.error(f"Error validating ID No: {e}")
    return None
