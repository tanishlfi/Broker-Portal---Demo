import os
import requests
import urllib
import json
import datetime
import logging
import http.client
import sqlite3
from datetime import datetime, timedelta

# set jwt token
rma_jwt = None


# endpoints to cache
cache_endpoints = ["clc/api/Product/Benefit/GetProductBenefitRates"]


def should_cache_endpoint(endpoint):
    """Check if endpoint should be cached by matching against cache_endpoints patterns"""
    return any(cache_endpoint in endpoint for cache_endpoint in cache_endpoints)


def init_cache_db():
    """Initialize SQLite cache database"""
    conn = sqlite3.connect("rma_cache.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS api_cache (
            endpoint TEXT,
            params TEXT,
            response TEXT,
            expiry TIMESTAMP,
            PRIMARY KEY (endpoint, params)
        )
    """
    )

    # clear cache on startup
    cursor.execute("DELETE FROM api_cache")
    conn.commit()
    conn.close()


def clear_cache(endpoint=None):
    """Clear all cached responses"""
    conn = sqlite3.connect("rma_cache.db")
    cursor = conn.cursor()
    cursor.execute(
        f"DELETE FROM api_cache {'WHERE endpoint = ?' if endpoint else ''}", (endpoint,)
    )
    conn.commit()
    conn.close()


def get_cached_response(endpoint, params=None):
    """Get cached response if exists and not expired"""
    conn = sqlite3.connect("rma_cache.db")
    cursor = conn.cursor()
    params_str = json.dumps(params) if params else ""

    cursor.execute(
        """
        SELECT response, expiry FROM api_cache 
        WHERE endpoint = ? AND params = ?
    """,
        (endpoint, params_str),
    )

    result = cursor.fetchone()
    conn.close()

    if result and datetime.fromisoformat(result[1]) > datetime.now():
        return json.loads(result[0])

    clear_cache(endpoint)
    return None


def cache_response(endpoint, params, response, cache_duration=3600):
    """Cache API response in SQLite"""
    conn = sqlite3.connect("rma_cache.db")
    cursor = conn.cursor()
    params_str = json.dumps(params) if params else ""
    expiry = (datetime.now() + timedelta(seconds=cache_duration)).isoformat()

    cursor.execute(
        """
        INSERT OR REPLACE INTO api_cache (endpoint, params, response, expiry)
        VALUES (?, ?, ?, ?)
    """,
        (endpoint, params_str, json.dumps(response), expiry),
    )

    conn.commit()
    conn.close()


# get rma backend token
def get_rma_token():
    global rma_jwt
    if rma_jwt:
        if datetime.now() >= rma_jwt["expiry"]:
            rma_jwt = None
        else:
            return rma_jwt
    if not rma_jwt:

        conn = http.client.HTTPSConnection(os.getenv("RMA_URL").replace("https://", ""))
        payLoad = urllib.parse.urlencode(
            {
                "client_id": os.getenv("RMA_CLIENT_ID"),
                "client_secret": os.getenv("RMA_CLIENT_SECRET"),
                "grant_type": "client_credentials",
            }
        ).encode("utf-8")
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        conn.request("POST", "/auth/connect/token", payLoad, headers)
        res = conn.getresponse()
        data = res.read()

        if res.status == 200:
            return_data = json.loads(data)
            sec = (
                int(return_data["expires_in"] * 0.85)
                if return_data["expires_in"]
                else 60
            )
            exp = datetime.now() + timedelta(seconds=sec)
            return_data["expiry"] = exp
            return return_data

    return None


# get from rma api
def get_rma_api(
    endpoint, params=None, timeout=300, manualCache=False, cache_duration=300
):
    global rma_jwt
    try:
        if not rma_jwt:
            rma_jwt = get_rma_token()
        if rma_jwt:
            cached_response = get_cached_response(endpoint, params)
            if cached_response:
                return cached_response
            url = f"{os.getenv('RMA_URL')}{endpoint}"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {rma_jwt['access_token']}",
            }
            API = requests.request(
                "GET", url, headers=headers, params=params, timeout=timeout
            )

            # print(API.text)
            # exit

            if API.status_code == 200:
                response_data = json.loads(API.text)
                # Cache if manualCache is True
                if manualCache:
                    cache_response(endpoint, params, response_data, cache_duration)
                # Cache if endpoint contains any of the cache patterns
                if should_cache_endpoint(endpoint):
                    cache_response(endpoint, params, response_data)
                return response_data
            elif API.status_code == 401:
                rma_jwt = get_rma_token()
                return get_rma_api(url, params)
            else:
                return None
    except Exception as e:
        logging.error(f"error connecting to rma api {e}")

        return None
    return None


# Add this after the imports
init_cache_db()
