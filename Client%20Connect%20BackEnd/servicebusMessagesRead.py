import schedule
import time
import os
import dotenv
import utils
import logging
import utils
import controllers

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))

# if utils.sendQMsg(
#                             os.getenv("RMA_SERVICE_QUEUE"),
#                             os.getenv("RMA_Q_POLICY_CREATE"),
#                             resultDict,
#                         ):
#                             logging.debug("Sent to queue")
#                             # if controllers.set_policy_complete(
#                             #     conn, row["PolicyDataId"]
#                             # ):
#                             #     logging.debug("Policy updated")

#                         else:
#                             logging.error("Error sending to queue")

try:

    # for res in result:
    #     logging.debug(res)

    # exit()
    # utils.sendQMsg(os.getenv("RMA_Q_VOOPDUPDATE"), res)
    # controllers.updateVOPDQueue(conn, res["idNumber"])
    # resultDict = {"ReferenceNumber": "CDA-20240419-002"}
    utils.getQMsg(os.getenv("RMA_SERVICE_QUEUE"), os.getenv("RMA_Q_POLICY_CREATE"))


except Exception as e:
    logging.error(e)
    raise e
