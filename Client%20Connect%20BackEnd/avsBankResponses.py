import os
import schedule
import time
import json
import utils
import logging
from sqlalchemy.sql.functions import coalesce
import utils
import controllers
from azure.servicebus import ServiceBusClient, TransportType
import dotenv
from models import policyData
from sqlalchemy.sql import select, update

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))


def updateBankinDetails(conn, accountNumber, avsResponse):
    qry = (
        select(policyData)
        .with_hint(policyData, "WITH (NOLOCK)")
        .where(
            policyData.BankingDetails != None,
            policyData.BankingDetails.contains(f'"{accountNumber}"'),
        )
        .with_only_columns(
            policyData.BankingDetails,
            policyData.PolicyId,
            policyData.requestId,
            policyData.createdBy,
            policyData.PolicyNumber,
        )
    )
    res = conn.execute(qry).fetchall()

    # if no results found, return
    if not res:
        return

    # set hyphen status to Not Verified if not present
    if "hyphenStatus" not in avsResponse:
        avsResponse["hyphenStatus"] = "Not Verified"

    # if accountExists != "00" or accountIdMatch != "00" or accountOpen != "00" or accountAcceptsCredits != "00" or accountAcceptsDebits != "00" or accountExists != "00" then set hyphenStatus to Fail

    if (
        avsResponse["accountExists"] != "00"
        or avsResponse["accountIdMatch"] != "00"
        or avsResponse["accountOpen"] != "00"
        or avsResponse["accountAcceptsCredits"] != "00"
        or avsResponse["accountAcceptsDebits"] != "00"
    ):
        avsResponse["hyphenStatus"] = "Fail"

    for row in res:
        # convert row.BankingDetails to dict
        bankingDetails = json.loads(row.BankingDetails)
        # check hyphenStatus key is present in  bankingDetails and if it is set to Verified
        if (
            "hyphenStatus" in bankingDetails
            and bankingDetails["hyphenStatus"] == "Verified"
        ):
            next

        # update bankingDetails with avsResponse
        bankingDetails["hyphenStatus"] = avsResponse["hyphenStatus"]
        bankingDetails["hyphenResponse"] = avsResponse

        updqry = (
            update(policyData)
            .where(
                policyData.PolicyId == row.PolicyId,
                policyData.requestId == row.requestId,
            )
            .values(BankingDetails=json.dumps(bankingDetails))
        )

        conn.execute(updqry)

        utils.sendEmailNotification(
            row["createdBy"],
            # "lourens@cdasolutions.co.za",
            "RMA Client Connect - Hyphen check complete",
            f"The banking check on policy {row['PolicyNumber']} has been completed. The status is {avsResponse['hyphenStatus']}",
            contentType="HTML",
        )

        # print(bankingDetails)
        # print(avsResponse)

    conn.commit()
    # exit()


def retrieveResponse():
    with utils.orm_conn(os.getenv("DATABASE_URL"), False) as conn:
        if controllers.checkBypass(conn, "avsResponses"):
            logging.debug("Bypass enabled")
            return
        try:
            NAMESPACE_CONNECTION_STR = os.getenv("AVS_CONNECTION_STRING")
            SUBSCRIPTION_NAME = os.getenv("AVS_SUBSCRIPTION_NAME")
            TOPIC_NAME = os.getenv("AVS_TOPIC_NAME")
            with ServiceBusClient.from_connection_string(
                NAMESPACE_CONNECTION_STR,
                logging_enable=True,
                transport_type=TransportType.AmqpOverWebsocket,
            ) as client:
                logging.debug("Connected to service bus")
                # If session_id is null here, will receive from the first available session. , ServiceBusReceiveMode.RECEIVE_AND_DELETE
                with client.get_subscription_receiver(
                    topic_name=TOPIC_NAME,
                    subscription_name=SUBSCRIPTION_NAME,
                    logging=True,
                    max_wait_time=60,
                ) as receiver:
                    # receiver.clear()
                    received_msgs = receiver.receive_messages(
                        max_message_count=20,
                    )

                    logging.debug(f"Received {len(received_msgs)} messages")
                    if not received_msgs:
                        logging.debug("No messages received")

                    while received_msgs:
                        logging.debug("Received {} messages".format(len(received_msgs)))

                        # with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
                        for msg in received_msgs:
                            # logging.debug("Received: " + str(msg))
                            TransformedMessage = json.loads(str(msg))
                            # print(TransformedMessage)
                            updateBankinDetails(
                                conn,
                                TransformedMessage["Response"]["accountNumber"],
                                TransformedMessage["Response"],
                            )
                            receiver.complete_message(msg)

                        received_msgs = receiver.receive_messages(
                            max_message_count=20,
                        )
                        # received_msgs = []

        except Exception as e:
            logging.error(e)
            # wait 30 minutes
            time.sleep(1800)


retrieveResponse()
schedule.every(10).minutes.do(retrieveResponse)
# updateBankinDetails("6005")

while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
    schedule.run_pending()
