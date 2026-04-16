# @description: adds the checks to be completed to a policy
import time
import os
import utils
import logging
import json
import datetime
from sqlalchemy import insert, select, delete
from models import BenefitDependantBenefitRule, benefit
import schedule
import dotenv
import controllers


dotenv.load_dotenv(verbose=True)
# set logging level
utils.set_log_lvl(os.getenv("LOG_LEVEL"))
i = 0

conn2 = utils.orm_conn(os.getenv("DATABASE_URL2"))
with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
    result = utils.orm_select(
        conn,
        f"""
        select distinct top 1000 * from rules.benefits order by id;
        """,
    )

    utils.orm_query(
        conn2,
        """
        truncate table rules.benefits;
        """,
    )

    while result:
        print(f"Processing batch {i}")
        i += 1
        insert_stmt = insert(benefit)
        conn2.execute(insert_stmt, result)
        # for row in result:
        #     print(row)
        #     utils.orm_query(
        #         conn2,
        #         f"""
        #         insert into rules.benefits (id, name, description, familyMemberMaxAge, familyMembersOver64, extended, createdAt, updatedAt, otherBenefit, parentBenefit, baseRate)
        #         values ({row['id']}, '{row['name']}', '{row['description']}', {row['familyMemberMaxAge']}, {row['familyMembersOver64']}, {row['extended']}, '{row['createdAt']}', '{row['updatedAt']}', {row['otherBenefit']}, {row['parentBenefit']}, {row['baseRate']});
        #         """,
        #     )
        result = utils.orm_select(
            conn,
            f"""
            select distinct top 1000 * from rules.benefits where id > {result[-1]['id']} order by id;
            """,
        )

    conn2.commit()


exit()


conn2 = utils.orm_conn(os.getenv("DATABASE_URL2"))
with utils.orm_conn(os.getenv("DATABASE_URL")) as conn:
    #  mainBenefitId, dependantBenefitId, [default] FROM rules.BenefitDependantBenefitRules;
    result = utils.orm_select(
        conn,
        f"""
        select distinct mainBenefitId, dependantBenefitId from rules.BenefitDependantBenefitRules;
        """,
    )
    utils.orm_query(
        conn2,
        """
        truncate table rules.BenefitDependantBenefitRules;
        """,
    )

    for row in result:
        print(row)
        utils.orm_query(
            conn2,
            f"""
            insert into rules.BenefitDependantBenefitRules (mainBenefitId, dependantBenefitId, [default])
            values ({row['mainBenefitId']}, {row['dependantBenefitId']}, 0);
            """,
        )
    #     try:
    #         conn2.execute(
    #             insert(BenefitDependantBenefitRule),
    #             {
    #                 "mainBenefitId": row["mainBenefitId"],
    #                 "dependantBenefitId": row["dependantBenefitId"],
    #                 "default": row["default"],
    #             },
    #         )
    #     except Exception as e:
    #         logging.error(f"Error inserting row {row}: {e}")
    #         exit()
    # insert_stmt = insert(BenefitDependantBenefitRule)
    # conn2.execute(
    #     insert_stmt,
    #     result,
    #     # [
    #     #     {
    #     #         "mainBenefitId": row["mainBenefitId"],
    #     #         "dependantBenefitId": row["dependantBenefitId"],
    #     #         "default": row["default"],
    #     #     }
    #     #     for row in result
    #     # ],
    # )
    # i = result[-1]["mainBenefitId"]
    # depi = result[-1]["dependantBenefitId"]
    # print(i)
    # result = utils.orm_select(
    #     conn,
    #     f"""
    # SELECT TOP 1000 * FROM rules.BenefitDependantBenefitRules where mainBenefitId >= {i} and dependantBenefitId > {depi} order by mainBenefitId, dependantBenefitId;
    # """,
    # )
    conn2.commit()
