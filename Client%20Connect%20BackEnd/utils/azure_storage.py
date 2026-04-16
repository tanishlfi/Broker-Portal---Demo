import logging
from azure.storage.blob import BlobClient, ContainerClient, BlobServiceClient
from azure.storage.queue import (
    QueueServiceClient,
    QueueClient,
    QueueMessage,
)

from azure.core.exceptions import ResourceExistsError

# Set the logging level for all azure-storage-* libraries
logger = logging.getLogger("azure.storage")
logger.setLevel(logging.INFO)

# Set the logging level for all azure-* libraries
logger = logging.getLogger("azure")
logger.setLevel(logging.ERROR)


# @description: connect to Azure Storage
def connectAzStorage(
    sas_url,
):
    try:
        logging.debug("Connecting to Azure Storage")
        blob_service_client = BlobServiceClient(account_url=sas_url, logger=logger)

        return blob_service_client
    except Exception as e:
        logging.error(f"This is the error: {e}")
        return False


# @description: get list of containers from Azure Storage
def listContainersAzStorage(
    blob_service_client,
):
    try:
        logging.debug("Listing containers")
        containers = blob_service_client.list_containers()
        return containers
    except Exception as e:
        logging.error(f"This is the error: {e}")
        return False


# @description: get list of blobs from Azure Storage
def listBlobsAzStorage(
    blob_service_client,
    container_name,
):
    try:
        logging.debug("Listing blobs")
        container_client = blob_service_client.get_container_client(container_name)
        blobs = container_client.list_blobs()
        return blobs
    except Exception as e:
        logging.error(f"This is the error: {e}")
        return False


# @description: download file from Azure Storage
def downloadFileAzStorage(
    blob_service_client,
    container_name,
    blob_name,
    file_path,
):
    try:
        logging.debug("Downloading file")
        blob_client = blob_service_client.get_blob_client(
            container=container_name, blob=blob_name
        )
        with open(file_path, "wb") as download_file:
            download_file.write(blob_client.download_blob().readall())
        return True
    except Exception as e:
        logging.error(f"This is the error: {e}")
        return False


# @description: upload file to Azure Storage
def uploadFileAzStorage(
    blob_service_client,
    container_name,
    blob_name,
    file_path,
):
    try:
        logging.debug("Uploading file")
        blob_client = blob_service_client.get_blob_client(
            container=container_name, blob=blob_name
        )
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        return True
    except Exception as e:
        logging.error(f"This is the error: {e}")
        return False


def uploadFileAzBlob(
    blob_service_client: str,
    container_name: str,
    blob_name: str,
    file_bytes: bytes,
) -> bool:
    try:
        logging.debug("Uploading file")
        blob_client = blob_service_client.get_blob_client(
            container=container_name, blob=blob_name
        )
        blob_client.upload_blob(name=blob_name, data=file_bytes, overwrite=True)
        return True
    except Exception as e:
        logging.error(f"This is the error: {e}")
        return False


# send message to Azure Storage Queue
def sendQMsgStorage(connstr, queueName, msg):
    try:
        # Create a QueueServiceClient from a connection string
        queue_client = QueueClient.from_connection_string(
            conn_str=connstr,
            queue_name=queueName,
        )

        # create queue if not exists
        try:
            queue_client.create_queue()
        except ResourceExistsError:
            # Resource exists
            logging.debug(f"Queue exists")
            pass

        logging.debug(queue_client.get_queue_properties())

        # Send messages to the queue
        queue_client.send_message(msg)
        return True
    except Exception as e:
        logging.error(f"Sending error: {e}")
        return False


# get messages from Azure Storage Queue
def getQMsgStorage(connstr, queueName, maxMessages=5):
    try:
        # Create a QueueServiceClient from a connection string
        queue_client = QueueClient.from_connection_string(
            conn_str=connstr,
            queue_name=queueName,
        )

        # Peek at messages in the queue
        peeked_messages = None
        # peeked_messages = queue_client.peek_messages(max_messages=5)
        peeked_messages = queue_client.receive_messages(max_messages=maxMessages)

        if peeked_messages:
            # print(str(peeked_messages))
            content = []
            for peeked_message in peeked_messages:
                # Display the message
                logging.debug("Message: " + peeked_message.content)
                content.append(peeked_message)
                # complete message
                queue_client.delete_message(peeked_message)

            return content
    except Exception as e:
        print(f"Sending error: {e}")
    return None
