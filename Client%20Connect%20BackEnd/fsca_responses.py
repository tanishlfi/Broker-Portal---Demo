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

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))


def retrieveResponse():
    try:
        NAMESPACE_CONNECTION_STR = os.getenv("NAMESPACE_CONNECTION_STR")
        SUBSCRIPTION_NAME = os.getenv("FSCA_SUBSCRIPTION_NAME")
        TOPIC_NAME = os.getenv("FSCA_TOPIC_NAME")
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
                    max_message_count=5,
                )

                logging.debug(f"Received {len(received_msgs)} messages")
                if not received_msgs:
                    logging.debug("No messages received")

                while received_msgs:
                    logging.debug("Received {} messages".format(len(received_msgs)))

                    received_msgs = receiver.receive_messages(
                        max_message_count=5,
                    )

                    logging.debug(f"Received {len(received_msgs)} messages")
                    if not received_msgs:
                        logging.debug("No messages received")
                        break

                    received_msgs = []
    except Exception as e:
        logging.error(e)
        # send notfication
        with utils.email_connect(password=os.getenv("EMAIL")) as email:
            utils.email_send(
                email,
                os.getenv("SUPPORT_EMAIL"),
                f"Error VOPD2 response process",
                f"Process paused due to {e}",
                os.getenv("FROM_EMAIL"),
                rcpt_opt=[],
            )
        # wait 30 minutes
        time.sleep(1800)


retrieveResponse()
# schedule.every(10).minutes.do(retrieveResponse)


while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
        print("ready to run")
    schedule.run_pending()
