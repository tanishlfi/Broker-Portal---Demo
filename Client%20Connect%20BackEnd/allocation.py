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


def roundRobinManual():
    try:
        logging.debug("Starting allocation")

        with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
            # get list of approvers
            approversData = controllers.getApprovers(conn)
            approvers = [x["approverId"].lower() for x in approversData]
            # get list of users
            allocated = controllers.countPoliciesPerApprover(conn)
            # only included specific users from allocated
            allocated = [x for x in allocated if x["approverId"].lower() in approvers]

            # create allocatedDefault list
            allocatedDefault = []
            for approver in approvers:
                allocatedDefault.append({"approverId": approver, "policies": 0})

            # add default approvers to allocated where approver not in allocated
            for approver in allocatedDefault:
                approverFound = False
                for user in allocated:
                    if approver["approverId"] == user["approverId"]:
                        approverFound = True
                if not approverFound:
                    allocated.append(approver)

            # order allocated by number of policies and then by email
            allocated = sorted(
                allocated, key=lambda k: (k["policies"], k["approverId"])
            )

            logging.debug(f"Allocated {allocated}")

            # get list of files no allocation
            getPoliciciesNoApprover = controllers.getPoliciesNoApprover(conn)

            i = 0

            newApprovals = []

            for policy in getPoliciciesNoApprover:
                logging.debug(f"Allocating file {policy}")
                currentApprover = None

                if "lourens" in policy["createdBy"].lower():
                    continue

                # if approver is last in list, start at beginning
                if i == len(allocated):
                    i = 0

                allocate_check = True
                while allocate_check:
                    if (
                        allocated
                        and policy["createdBy"].lower()
                        == allocated[i]["approverId"].lower()
                    ):
                        # increment counter
                        i += 1
                    else:
                        allocate_check = False

                logging.debug(
                    f"Allocating file {policy} to {allocated[i]['approverId']}"
                )

                currentApprover = allocated[i]["approverId"]

                # update policy approver
                controllers.setApproverPolicy(conn, policy["id"], currentApprover)
                # newApprovals.append(currentApprover)

                # remove duplicates from newApprovals
                # newApprovals = list(dict.fromkeys(newApprovals))

                # for user in newApprovals:
                #     logging.debug(f"User {user} has new approvals")

                # loop through user_notification list and insert notification for each user
                # for user in user_notification:
                # controllers.insertNotification(
                #     conn,
                #     user,
                #     "Policies submited for approval",
                #     f"You have new policies waiting for approval.",
                #     link="https://clientconnect.randmutual.co.za/AllocatedPolicies",
                # )

                i += 1

            conn.commit()
            logging.debug("Manual Allocation complete")

    except Exception as e:
        logging.error(f"Error in manual allocation: {e}")
        conn.rollback()


def roundRobin():
    with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
        # if controllers.checkBypass(conn, "allocation"):
        #     logging.debug("Bypass enabled")
        #     return
        logging.debug("Starting allocation")

        # get list of approvers
        approversData = controllers.getApprovers(conn)
        approvers = [x["approverId"].lower() for x in approversData]

        # get list of users
        allocated = controllers.countPoliciesPerApprover(conn)
        # only included specific users from allocated
        allocated = [x for x in allocated if x["approverId"].lower() in approvers]

        # create allocatedDefault list
        allocatedDefault = []
        for approver in approvers:
            allocatedDefault.append({"approverId": approver, "policies": 0})

        # add default approvers to allocated where approver not in allocated
        for approver in allocatedDefault:
            approverFound = False
            for user in allocated:
                if approver["approverId"] == user["approverId"]:
                    approverFound = True
            if not approverFound:
                allocated.append(approver)

        # order allocated by number of policies and then by email
        allocated = sorted(allocated, key=lambda k: (k["policies"], k["approverId"]))

        logging.debug(f"Allocated {allocated}")

        # get list of files no allocation
        getFilesNoApprover = controllers.getFilesNoApprover(conn)

        i = 0

        newApprovals = []

        for file in getFilesNoApprover:
            logging.debug(f"Allocating file {file}")
            currentApprover = None

            if "lourens" in file["createdBy"].lower():
                continue

            # if approver is last in list, start at beginning
            if i == len(allocated):
                i = 0

            allocate_check = True
            while allocate_check:
                if i == len(allocated):
                    i = 0
                if (
                    allocated
                    and file["createdBy"].lower() == allocated[i]["approverId"].lower()
                ):
                    # increment counter
                    i += 1
                else:
                    allocate_check = False

            logging.debug(f"Allocating file {file} to {allocated[i]['approverId']}")

            currentApprover = allocated[i]["approverId"]

            # update policy approver
            controllers.setApprover(conn, file["id"], currentApprover)
            # newApprovals.append(currentApprover)

            # remove duplicates from newApprovals
            # newApprovals = list(dict.fromkeys(newApprovals))

            # for user in newApprovals:
            #     logging.debug(f"User {user} has new approvals")

            # loop through user_notification list and insert notification for each user
            # for user in user_notification:
            # controllers.insertNotification(
            #     conn,
            #     user,
            #     "Policies submited for approval",
            #     f"You have new policies waiting for approval.",
            #     link="https://clientconnect.randmutual.co.za/AllocatedPolicies",
            # )

            i += 1

        conn.commit()
        logging.debug("Allocation complete")

    roundRobinManual()


roundRobin()
schedule.every(10).minutes.do(roundRobin)

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
