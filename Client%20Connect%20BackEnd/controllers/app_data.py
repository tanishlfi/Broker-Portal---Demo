import os
import utils
import logging
from models import Notification, ProcessBypass, Approver
from sqlalchemy import update, func, cast, Date, insert, exists, or_, select
import utils
import json
import uuid


# @desc: get all approvers
# @return: list of approvers
def getApprovers(db_conn):
    try:
        # get approvers
        approvers = db_conn.execute(
            select(Approver)
            .with_hint(Approver, "WITH (NOLOCK)")
            .where(Approver.Team == "onboarding")
            .order_by(Approver.approverId)
        )
        return approvers.mappings().all()
    except Exception as e:
        logging.error(f"Error: {e}")
    return None


# @desc: check if process is on bypass
# @return: True if on bypass, False if not
def checkBypass(db_conn, process_name):
    try:
        # check if process is on bypass
        bypass = db_conn.execute(
            select(ProcessBypass)
            .with_hint(ProcessBypass, "WITH (NOLOCK)")
            .where(ProcessBypass.processName == process_name)
        )
        result = bypass.fetchone()
        if result:
            return True
    except Exception as e:
        logging.error(f"Error: {e}")
        # exit()
    return False


# @desc: insert notification
# @return: True if successful, False if not
def insertNotification(
    db_conn,
    to_user_email,
    title,
    message,
    type="info",
    variant="app",
    from_user_email="System",
    link=None,
):
    try:
        logging.debug(f"Inserting notification: {title}")
        db_conn.execute(
            insert(Notification).values(
                id=uuid.uuid4(),
                from_user_email=from_user_email,
                to_user_email=to_user_email,
                variant=variant,
                title=title,
                message=message,
                type=type,
                link=link,
            )
        )
        db_conn.commit()
        return True
    except Exception as e:
        logging.error(f"Error: {e}")
        db_conn.rollback()
    return False
