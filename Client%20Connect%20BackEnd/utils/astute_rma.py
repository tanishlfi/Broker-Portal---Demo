import os
import requests
import json
import logging


# @description: submit to RMA quick transact runs astute and transunion
# Astute VOPD validation for SA ID
#
# VopdVerificationType
# 1 Identity
# 2 Death
# 3 Status
# 4 BirthRMAQuickTransact
# 5 Lineage
# 6 Marriage
# 8 Comprehensive
def RMAQuickTransact(idNumber, requestType="death-verification"):
    try:
        url = f"https://api.randmutual.co.za/home-affairs/quick/{requestType}"

        payLoad = (
            json.dumps(
                {
                    "homeAffairsDeathVerification": {
                        "idReferenceNo": idNumber,
                    },
                }
            ).encode("utf-8")
            if requestType == "death-verification"
            else json.dumps(
                {
                    "homeAffairsStatusVerification": {
                        "idReferenceNo": idNumber,
                    },
                }
            ).encode("utf-8")
        )
        headers = {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": os.getenv("RMA_VOPD_KEY"),
            "Content-Length": str(len(payLoad)),
        }

        v3API = requests.request("POST", url, headers=headers, data=payLoad)
        # print(v3API.text)
        if v3API.status_code == 200:
            return json.loads(v3API.text)
        else:
            logging.error(
                f"Failed to validate ID No 2 {idNumber}: {v3API.status_code} - {v3API.text}"
            )
    except Exception as e:
        logging.error(f"Error TransUnion: {e}")
    return None
