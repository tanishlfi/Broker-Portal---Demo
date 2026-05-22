import uuid
import json
from datetime import datetime
from sqlalchemy import text
import logging

def log_broker_audit(conn, event_type, outcome, user_id=None, metadata=None, ip_address=None):
    """
    Common function to log audit events for the Broker Portal.
    Follows the 5.16 Audit Data specification.
    """
    try:
        audit_id = str(uuid.uuid4())
        ins = text("""
            INSERT INTO broker.bp_audit 
            (audit_record_id, audit_event_type, action_outcome, action_date_time, user_id, metadata, ip_address)
            VALUES (:id, :event, :outcome, :now, :user, :meta, :ip)
        """)
        conn.execute(ins, {
            "id": audit_id,
            "event": event_type,
            "outcome": outcome,
            "now": datetime.now(),
            "user": user_id,
            "meta": json.dumps(metadata) if metadata else None,
            "ip": ip_address
        })
        # Note: Caller is responsible for committing the transaction
        return True
    except Exception as error:
        logging.error(f"Broker Audit logging failed: {error}")
        return False
