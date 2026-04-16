# @description: adds the checks to be completed to a policy
import schedule
import time
import os
import utils
import logging
import dotenv
from sqlalchemy import text
import concurrent.futures

dotenv.load_dotenv(verbose=True)

# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), os.getenv("SQLITE"))


def process_broker_schemes(broker, conn):
    getSchemes = utils.get_rma_api(
        f"/clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId/{broker['id']}"
    )
    if getSchemes:
        for scheme in getSchemes:
            if scheme["policyStatusId"] not in [1, 8, 15]:
                continue
            getScheme = utils.get_rma_api(
                f"/clc/api/Policy/Policy/{scheme['policyId']}"
            )
            logging.debug(f"Processing scheme: {scheme['displayName']}")
            sql = text(
                """
                MERGE app_data.brokerSchemes AS target
                USING (SELECT :id AS id, :name AS schemeName, :brokerId AS brokerId, :productOptionId AS productOptionId) AS source
                ON target.id = source.id
                WHEN MATCHED THEN 
                    UPDATE SET schemeName = source.schemeName, brokerId = source.brokerId, productOptionId = source.productOptionId
                WHEN NOT MATCHED THEN
                    INSERT (id, schemeName, brokerId, productOptionId) VALUES (source.id, source.schemeName, source.brokerId, source.productOptionId);
                """
            )
            conn.execute(
                sql,
                {
                    "id": scheme["policyId"],
                    "name": scheme["displayName"],
                    "brokerId": broker["id"],
                    "productOptionId": getScheme["productOptionId"],
                },
            )


def main():
    getBrokers = utils.get_rma_api("/clc/api/Broker/Brokerage")

    if getBrokers:
        with utils.orm_session(os.getenv("DATABASE_URL")) as conn:
            # delete all schemes
            conn.execute(text("DELETE FROM app_data.brokerSchemes;"))
            # delete all brokers
            conn.execute(text("DELETE FROM app_data.brokers;"))

            for broker in getBrokers:
                logging.debug(f"Processing broker: {broker['name']}")
                sql = text(
                    """
              MERGE app_data.brokers AS target
              USING (SELECT :id AS id, :name AS brokerName) AS source
              ON target.id = source.id
              WHEN MATCHED THEN 
                  UPDATE SET brokerName = source.brokerName
              WHEN NOT MATCHED THEN
                  INSERT (id, brokerName) VALUES (source.id, source.brokerName);
              """
                )

                conn.execute(sql, {"id": broker["id"], "name": broker["name"]})

            conn.commit()

            # Parallelize scheme fetching
            with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                futures = [
                    executor.submit(process_broker_schemes, broker, conn)
                    for broker in getBrokers
                ]
                concurrent.futures.wait(futures)

            conn.commit()


main()

schedule.every().day.at("05:00").do(main)

while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
    schedule.run_pending()
