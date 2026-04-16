import os
import logging
import http.client
import requests
import json
import datetime
from urllib.parse import urlencode

auth0_jwt = None


# get auth0 backend token
def get_auth0_token():
    global auth0_jwt
    if auth0_jwt:
        if datetime.datetime.now() >= auth0_jwt["expiry"]:
            auth0_jwt = None
        else:
            return auth0_jwt
    if not auth0_jwt:
        conn = http.client.HTTPSConnection(os.getenv("AUTH0_DOMAIN"))

        payload = {
            "client_id": os.getenv("AUTH0_CLIENT_ID"),
            "client_secret": os.getenv("AUTH0_CLIENT_SECRET"),
            "audience": os.getenv("AUTH0_AUDIENCE"),
            "grant_type": "client_credentials",
        }

        headers = {"content-type": "application/x-www-form-urlencoded"}

        conn.request(
            "POST",
            f"/{os.getenv('AUTH0_DOMAIN')}/oauth/token",
            urlencode(payload),
            headers,
        )

        res = conn.getresponse()
        data = res.read()

        if res.status == 200:
            return_data = json.loads(data)
            sec = (
                int(return_data["expires_in"] * 0.85)
                if return_data["expires_in"]
                else 60
            )
            exp = datetime.datetime.now() + datetime.timedelta(seconds=sec)
            return_data["expiry"] = exp
            auth0_jwt = return_data
            return return_data

    return None


def get_auth0_GET(endpoint):
    access_token = get_auth0_token()
    if access_token:
        url = f"https://{os.getenv('AUTH0_DOMAIN')}/api/v2{endpoint}"
        headers = {
            "content-type": "application/json",
            "authorization": f"Bearer {auth0_jwt['access_token']}",
        }
        response = requests.request("GET", url, headers=headers)
        if response.status_code == 200:
            return json.loads(response.text)
        else:
            logging.error(f"Error: {response.text}")
    return None


def get_auth0_DEL(endpoint):
    access_token = get_auth0_token()
    if access_token:
        url = f"https://{os.getenv('AUTH0_DOMAIN')}/api/v2{endpoint}"
        headers = {
            "content-type": "application/json",
            "authorization": f"Bearer {auth0_jwt['access_token']}",
        }
        response = requests.request("DELETE", url, headers=headers)
        if response.status_code == 204:
            logging.debug(f"Deleted: {endpoint}")
        else:
            logging.error(f"Error: {response.text}")
    return None


"""
PATCH /api/v2/users/{id}
{
    "blocked": true
}
"""


def auth0_PATCH(endpoint, payload):
    access_token = get_auth0_token()
    if access_token:
        url = f"https://{os.getenv('AUTH0_DOMAIN')}/api/v2{endpoint}"
        headers = {
            "content-type": "application/json",
            "authorization": f"Bearer {auth0_jwt['access_token']}",
        }
        response = requests.request("PATCH", url, headers=headers, json=payload)
        if response.status_code == 200:
            return json.loads(response.text)
        else:
            logging.error(f"Error: {response.text}")
    return None
