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
    for res in [
        "CDA20250619-057891",
        "CDA20250619-060743",
        "CDA20250619-060768",
        "CDA20250619-060829",
        "CDA20250619-061008",
        "CDA20250619-061052",
        "CDA20250619-061364",
        "CDA20250619-066179",
        "CDA20250619-067034",
        "CDA20250619-067065",
        "CDA20250619-067284",
        "CDA20250619-067485",
        "CDA20250619-067644",
        "CDA20250619-069806",
        "CDA20250619-070935",
        "CDA20250619-070964",
        "CDA20250619-071109",
        "CDA20250619-071116",
        "CDA20250619-071132",
        "CDA20250619-071327",
        "CDA20250619-072374",
        "CDA20250619-077003",
        "CDA20250619-077437",
        "CDA20250619-077669",
        "CDA20250619-077691",
        "CDA20250619-077739",
        "CDA20250619-077821",
        "CDA20250619-077852",
        "CDA20250619-077902",
        "CDA20250619-077947",
    ]:

        # utils.sendQMsg(os.getenv("RMA_Q_VOOPDUPDATE"), res)
        # controllers.updateVOPDQueue(conn, res["idNumber"])
        resultDict = {"ReferenceNumber": res}
        if utils.sendQMsg(
            os.getenv("RMA_SERVICE_QUEUE"), os.getenv("RMA_Q_POLICY_CREATE"), resultDict
        ):
            print(resultDict)
            logging.debug("Sent to queue")

# RMA_SERVICE_QUEUE=Endpoint=sb://azt-mcc-sbus-01.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=PJhD7ga94eHM0eoXW27C2v0TOw4QjF0u4qScfxeDdTI=
# RMA_Q_VOOPDUPDATE=stest.mcc.cda.vopdupdate
# RMA_Q_MEMBER_VALIDATE=stest.mcc.cda.idnumbervalidation
# RMA_Q_POLICY_CREATE=stest.mcc.cda.policyadd
except Exception as e:
    logging.error(e)
    raise e
