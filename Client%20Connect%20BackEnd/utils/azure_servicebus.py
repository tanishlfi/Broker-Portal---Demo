import os
import json
import logging
from azure.servicebus import (
    ServiceBusClient,
    ServiceBusMessage,
    TransportType,
)


# send message to Azure Service Bus Queue
def sendQMsg(connstr, queueName, msg):
    try:

        with ServiceBusClient.from_connection_string(
            conn_str=connstr,
            logging_enable=False,
            transport_type=TransportType.AmqpOverWebsocket,
        ) as servicebus_client:
            with servicebus_client.get_queue_sender(queue_name=queueName) as sender:
                # logging.debug(f"Sending message to queue {json.dumps(msg)}")
                message = ServiceBusMessage(
                    body=json.dumps(msg), content="application/json"
                )
                sender.send_messages(message)
                logging.debug("Sent message to queue")
            return True
    except Exception as e:
        logging.error(f"Sending error: {e}")
        return False


# return queue message
def getQMsg(connstr, queueName):
    try:
        with ServiceBusClient.from_connection_string(
            conn_str=connstr, logging_enable=False
        ) as servicebus_client:
            with servicebus_client.get_queue_receiver(queue_name=queueName) as receiver:
                messages = receiver.receive_messages(
                    max_message_count=1, max_wait_time=5
                )
                print(f"messages {messages}")
                for message in messages:
                    logging.debug(f"Received message: {message}")
                    return message
    except Exception as e:
        logging.error(f"Receiving error: {e}")
        return None
