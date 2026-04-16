import logging
import pyodbc
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# from models.vopd import AstuteResponse


def object_as_dict(obj):
    dict = []
    for o in obj:
        dict.append({c.key: getattr(o, c.key) for c in inspect(o).mapper.column_attrs})
    return dict


def db_conn(conn, echo=False):
    try:
        engine = create_engine(conn, echo=echo, poolclass=NullPool)

        return engine.connect()
    except Exception as error:
        logging.error(error)
        exit()


def db_session(conn, echo=False):
    try:
        engine = create_engine(conn, echo=echo, poolclass=NullPool)
        Session = sessionmaker(bind=engine)

        return Session()
    except Exception as error:
        logging.error(error)
        exit()


# run raw query
def db_query(conn, query, args=None):
    try:
        # format args

        conn.execute(text(query), args)
        conn.commit()
        logging.debug("Query executed successfully")
        return True
    except Exception as error:
        conn.rollback()
        logging.error(f"Query error: {error}")
        return False


# run raw select query
def db_select(conn, query):
    try:
        # Execute the raw query
        result = conn.execute(text(query))

        # Fetch all results
        rows = result.fetchall()

        # Get column names
        keys = result.keys()

        # Convert each row to a dictionary with column names as keys
        results = [dict(zip(keys, row)) for row in rows]
        return results
    except Exception as error:
        logging.error(f"Query error: {error}")
        return False
