##
# NOT IN USE
##
import schedule
import time
import os
import utils
import logging
import utils
import controllers
import dotenv
import datetime

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), os.getenv("SQLITE_LOG") == "True")


def getUsers():
    i = 0
    response = utils.get_auth0_GET(
        f"/users?fields=user_id,email,blocked,last_login,app_metadata,user_metadata,created_at&page={i}&per_page=100"
    )
    users = []
    while response:

        # print(response)
        # exit()
        for user in response:
            user["roles"] = []
            # if "performance" in user["email"]:
            #     logging.debug(f"User: {user}")
            #     utils.get_auth0_DEL(f"/users/{user['user_id']}")
            #     continue

            response2 = utils.get_auth0_GET(f"/users/{user['user_id']}/roles")
            if response2:
                for role in response2:
                    user["roles"].append(role["name"])
                    # logging.debug(f"Role: {role}")

            users.append(
                {
                    "blocked": user["blocked"] if "blocked" in user else False,
                    "user_id": user["user_id"],
                    "email": user["email"],
                    "roles": user["roles"],
                    "last_login": user["last_login"] if "last_login" in user else None,
                    "created_at": user["created_at"] if "created_at" in user else None,
                    "app_metadata": (
                        user["app_metadata"] if "app_metadata" in user else None
                    ),
                    "user_metadata": (
                        user["user_metadata"] if "user_metadata" in user else None
                    ),
                }
            )
        i += 1
        response = utils.get_auth0_GET(
            f"/users?fields=user_id,email,blocked,app_metadata,user_metadata,last_login,created_at&page={i}&per_page=100"
        )

    logging.debug(f"Users: {users}")
    return users


def userCleanup():
    auth0Users = getUsers()

    for user in auth0Users:

        if user["blocked"]:
            logging.debug(f"Blocked User: {user}")

            # if user last login is more than 120 days ago, delete the user
            if user["last_login"]:
                last_login = datetime.datetime.fromisoformat(user["last_login"])
                if last_login.tzinfo is not None:
                    last_login = last_login.replace(tzinfo=None)
                now = datetime.datetime.now()
                if last_login < now - datetime.timedelta(days=120):
                    utils.get_auth0_DEL(f"/users/{user['user_id']}")
            continue

        logging.debug(user)

        # if user hasn't logged in for more than 90 days, block the user
        if user["last_login"]:
            last_login = datetime.datetime.fromisoformat(user["last_login"])
            if last_login.tzinfo is not None:
                last_login = last_login.replace(tzinfo=None)
            now = datetime.datetime.now()
            if last_login < now - datetime.timedelta(days=90):
                utils.auth0_PATCH(f"/users/{user['user_id']}", {"blocked": True})

        # if user hasn't logged in ever and created_at is more than 90 days ago, delete the user
        if not user["last_login"] and user["created_at"]:
            created_at = datetime.datetime.fromisoformat(user["created_at"])
            if created_at.tzinfo is not None:
                created_at = created_at.replace(tzinfo=None)
            now = datetime.datetime.now()
            if created_at < now - datetime.timedelta(days=90):
                utils.get_auth0_DEL(f"/users/{user['user_id']}")

        # if user has no roles, delete the user
        if not user["roles"]:
            logging.debug(f"Deleting User: {user}")
            utils.get_auth0_DEL(f"/users/{user['user_id']}")
            continue

        # if rma user but does not have the correct role, block the user
        if "randmutual.co.za" in user["email"]:
            for role in user["roles"]:
                if role != "CDA-RMA-Policy Admin":
                    utils.auth0_PATCH(f"/users/{user['user_id']}", {"blocked": True})

        # if user email does not contain "randmutual.co.za" or "cdasolutions.co.za" and has the role "CDA-RMA-Policy Admin", block the user
        if "CDA-RMA-Policy Admin" in user["roles"]:
            if not (
                "randmutual.co.za" in user["email"]
                or "cdasolutions.co.za" in user["email"]
            ):
                utils.auth0_PATCH(f"/users/{user['user_id']}", {"blocked": True})
                logging.debug(f"Blocked User: {user['email']} - {user['user_id']}")

        # if CDA-BROKERAGE-Broker Representative and brokerageIDs is empty in {'BrokerageIds': [], 'SchemeIds': []}} then send email notiifcation to clientconnect@cdasolutions.co.za
        # if "CDA-BROKERAGE-Broker Representative" in user["roles"]:
        #     if (
        #         "user_metadata" in user
        #         and user["user_metadata"]
        #         and (
        #             "BrokerageIds" not in user["user_metadata"]
        #             or not user["user_metadata"]["BrokerageIds"]
        #         )
        #     ):
        #         utils.sendEmailNotification(
        #             "clientconnect@cdasolutions.co.za",
        #             "CDA-BROKERAGE-Broker Representative without BrokerageIds",
        #             f"User have no BrokerageIds in user_metadata. Please check the user metadata.Emails: {user['email']}",
        #         )


userCleanup()


# auth0Users = getUsers()
# # user extract to text file user_id,email,blocked,app_metadata,user_metadata,last_login,created_at
# with open("auth0_users.txt", "w") as f:
#     f.write("email|blocked|roles|last_login|created_at\n")
#     for user in auth0Users:
#         f.write(
#             f"{user['email']}|{user['blocked']}|{user['roles'][0] if user['roles'] else ''}|{user['last_login']}|{user['created_at']}\n"
#         )

# schedule.every().friday.at("02:00").do(userCleanup)

while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
    schedule.run_pending()
