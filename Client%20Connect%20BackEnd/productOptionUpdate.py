# @description: adds the checks to be completed to a policy
import time
import os
import utils
import logging
import json
import datetime
from sqlalchemy import insert, select, delete
from models import benefit, productOption
import schedule
import dotenv
import controllers

dotenv.load_dotenv(verbose=True)
# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"), False)


def updateProductOptions():

    # get  rma endpoint benefits
    getBenefits = utils.get_rma_api(f"/clc/api/Product/ProductOption")

    if getBenefits:
        with utils.orm_conn(os.getenv("DATABASE_URL"), False) as conn:
            if controllers.checkBypass(conn, "productOptionUpdate"):
                logging.debug("Bypass enabled")
                return
            try:
                # s = (delete(productOption))
                # conn.execute(s)

                for benefit in getBenefits:
                    # if benefit["id"] not in [439]:
                    #     continue
                    logging.debug(f"Processing option {benefit["id"]}")

                    getOption = utils.get_rma_api(
                        f"/clc/api/Product/ProductOption/{benefit["id"]}"
                    )

                    if getOption:

                        benefit_chunks = [
                            getOption["benefitsIds"][i : i + 20]
                            for i in range(0, len(getOption["benefitsIds"]), 20)
                        ]
                        foundOptions = []
                        for chunk in benefit_chunks:
                            logging.debug(f"Processing chunk of {len(chunk)} options")
                            # check if options already exist
                            s = (
                                select(productOption)
                                .with_hint(productOption, "WITH (NOLOCK)")
                                .where(
                                    productOption.productOptionId == benefit["id"],
                                    productOption.benefitId.in_(chunk),
                                )
                            )

                            result = conn.execute(s)
                            existingOptions = result.mappings().all()
                            if existingOptions:
                                logging.debug(
                                    f"Found existing options in current chunk"
                                )
                                foundOptions.extend(
                                    [b["benefitId"] for b in existingOptions]
                                )

                        options_to_insert = [
                            {"productOptionId": benefit["id"], "benefitId": opt}
                            for opt in getOption["benefitsIds"]
                            if opt not in foundOptions
                        ]

                        if options_to_insert:
                            ins = insert(productOption)
                            conn.execute(ins, options_to_insert)
                            logging.debug(
                                f"Bulk inserted {len(options_to_insert)} options"
                            )

                            conn.commit()

            except Exception as error:
                conn.rollback()
                logging.error(f"Error adding benefit {error}")


def get_cover_amount(name):
    # Convert name to string and make it lowercase for consistency
    name = str(name).lower()

    # Check if both '@' and 'k' exist in the string
    if "@" in name and "k" in name:
        try:
            # Find positions of '@' and 'k'
            at_pos = name.index("@")
            k_pos = name.rindex("k")

            # Extract the number between '@' and 'k'
            number_str = name[at_pos + 1 : k_pos].strip()

            # Convert to float and multiply by 1000
            return float(number_str) * 1000
            logging.debug(f"Cover amount: {number_str}")
        except (ValueError, IndexError):
            return 0
    return 0


def benefitUpdate():
    with utils.orm_conn(os.getenv("DATABASE_URL"), False) as conn:
        try:
            # s = (delete(benefit))
            # conn.execute(s)

            # logging.debug(f"Deleted all benefits")

            s = (
                select(productOption)
                .with_hint(productOption, "WITH (NOLOCK)")
                .with_only_columns(productOption.productOptionId)
                .distinct()
                .order_by(productOption.productOptionId.asc())
            )
            result = conn.execute(s)
            getProductOptions = result.mappings().all()

            for option in getProductOptions:
                # if option["productOptionId"] not in [439]:
                #     continue
                logging.debug(f"Processing productOption {option["productOptionId"]}")

                # get benefits corresponding to productOption
                s = (
                    select(benefit)
                    .with_hint(benefit, "WITH (NOLOCK)")
                    .join(productOption, productOption.benefitId == benefit.id)
                    .with_hint(productOption, "WITH (NOLOCK)")
                    .where(productOption.productOptionId == option["productOptionId"])
                    .with_only_columns(benefit.id)
                )

                result = conn.execute(s)
                currentBenefits = result.mappings().all()
                currentBenefitsIds = []
                currentBenefitsIds = [benefit["id"] for benefit in currentBenefits]

                ham = 0
                while ham < 5:
                    ham += 1
                    logging.debug(f"For covermembertype {ham}")
                    getBenefits = utils.get_rma_api(
                        f"/clc/api/Product/Benefit/GetProductBenefitRates/{option["productOptionId"]}/{ham}"
                    )
                    if getBenefits and getBenefits["benefits"]:
                        for ben in getBenefits["benefits"]:

                            # check if benefit already exists
                            if ben["id"] in currentBenefitsIds:
                                logging.debug(f"Benefit {ben['id']} already exists")
                                continue
                            s = (
                                select(benefit)
                                .with_hint(benefit, "WITH (NOLOCK)")
                                .where(benefit.id == ben["id"])
                            )
                            result = conn.execute(s)
                            getBenefit = result.mappings().all()

                            if getBenefit:
                                logging.debug(f"Benefit {ben['id']} already exists")
                                continue

                            # logging.debug(f"Processing benefit {ben}")

                            coverAmount = (
                                ben["benefitRates"][0]["benefitAmount"]
                                if len(ben["benefitRates"]) > 0
                                else 0
                            )
                            if ben["coverMemberType"] == 3:
                                # sql for coverAmount
                                """CASE
                                    WHEN CHARINDEX('@', br.name) > 0
                                         AND PATINDEX('%K%', REVERSE(br.name)) > 0
                                    THEN CAST(SUBSTRING(br.name, CHARINDEX('@', br.name) + 1,
                                                        LEN(br.name) - CHARINDEX('@', br.name) - PATINDEX('%K%', REVERSE(br.name))) AS FLOAT) * 1000
                                    ELSE NULL  -- Set to NULL if @ or K is missing
                                END"""
                                coverAmount = 0

                                # case statement that set coverAmount to 55000 if ben["name"] contains 55K
                                # if "100k" in str(ben["name"]).lower():
                                #     coverAmount = 100000
                                # if "95k" in str(ben["name"]).lower():
                                #     coverAmount = 95000

                                coverAmount = get_cover_amount(ben["name"])

                            minAge = None
                            maxAge = None
                            rules = None

                            getRules = utils.get_rma_api(
                                f"/clc/api/Product/BenefitRule/{ben['id']}"
                            )
                            if getRules:
                                for rule in getRules:
                                    if rule and rule["ruleConfiguration"]:
                                        rules = json.loads(rule["ruleConfiguration"])
                                        if (
                                            rules
                                            and "Maximum Entry Age"
                                            in rules[0]["fieldName"]
                                        ):
                                            maxAge = int(rules[0]["fieldValue"])
                                        if (
                                            rules
                                            and "Minimum Entry Age"
                                            in rules[0]["fieldName"]
                                        ):
                                            minAge = int(rules[0]["fieldValue"])

                                        logging.debug(f"Processing rule {rule}")

                            ins = insert(benefit).values(
                                id=ben["id"],
                                name=ben["name"],
                                code=ben["code"],
                                productId=ben["productId"],
                                benefitTypeId=ben["benefitType"],
                                coverMemberTypeId=ben["coverMemberType"],
                                startDate=ben["startDate"],
                                endDate=ben["endDate"],
                                coverAmount=coverAmount,
                                baseRate=(
                                    ben["benefitRates"][0]["baseRate"]
                                    if len(ben["benefitRates"]) > 0
                                    else None
                                ),
                                benefitAmount=(
                                    ben["benefitRates"][0]["benefitAmount"]
                                    if len(ben["benefitRates"]) > 0
                                    else None
                                ),
                                minAge=minAge,
                                maxAge=maxAge,
                            )
                            conn.execute(ins)

                conn.commit()

        except Exception as error:
            conn.rollback()
            logging.error(f"Error adding benefit {error}")
            exit()


def main():
    echoOpt = True if os.getenv("SQL_LOG") == "True" else False
    with utils.orm_session(os.getenv("DATABASE_URL"), echoOpt) as conn:
        if controllers.checkBypass(conn, "productOptionUpdate"):
            logging.debug("Bypass enabled")
            return
    updateProductOptions()
    logging.debug("product option update complete")
    benefitUpdate()
    logging.debug("benefit update complete")


main()
schedule.every(1).days.at("18:00").do(main)

while True:
    n = schedule.idle_seconds()
    if n is None:
        # no more jobs
        break
    elif n > 0:
        # sleep exactly the right amount of time
        time.sleep(n)
    schedule.run_pending()


# sql to get benefits
# insert into onboarding_portal.rules.BenefitDependantBenefitRules(mainBenefitId, dependantBenefitId)
# select distinct a.benefitId, d.id
# from onboarding_portal.rules.BenefitRules as a
# inner join onboarding_portal.rules.productOptions as b on a.benefitId = b.benefitId
# inner join onboarding_portal.rules.productOptions as c on b.productOptionId = c.productOptionId
# inner join onboarding_portal.rules.DependantBenefitRules as d on c.benefitId = d.id and d.benefitAmount <= a.benefitAmount and d.covermemberType = 'Extended Family' and d.subGroup is null
# where not exists(select * from onboarding_portal.rules.BenefitDependantBenefitRules where mainBenefitId = a.benefitId and dependantBenefitId = d.id)
