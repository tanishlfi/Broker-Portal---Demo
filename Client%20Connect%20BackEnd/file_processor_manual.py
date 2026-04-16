import os
import utils
import controllers


# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))


controllers.manualFile("447e4933-8acc-4a12-a73d-806c3c0924cf.xlsx")
controllers.manualFile("9038b61b-e3d6-4513-bad2-174e1f1c82f1.xlsx")
