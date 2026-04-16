import schedule
import time
import os
import utils
import controllers
import dotenv
import logging

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), os.getenv("SQLITE_LOG") == "True")


def main():
    echoOpt = True if os.getenv("SQL_LOG") == "True" else False
    with utils.orm_session(os.getenv("DATABASE_URL"), echoOpt) as conn:
        if controllers.checkBypass(conn, "file_processor"):
            logging.debug("Bypass enabled")
            return
    controllers.update_file_brokerage_scheme()
    controllers.downloadFile()

    controllers.processFilesNewStructure()
    controllers.update_policy_brokerage_scheme()


main()
# will check every minute for new files
schedule.every(1).minutes.do(main)

while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
    schedule.run_pending()
