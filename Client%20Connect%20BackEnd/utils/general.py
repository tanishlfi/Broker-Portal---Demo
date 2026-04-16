import time
import logging
import sqlite3
import os
from datetime import datetime
import re
from dateutil.relativedelta import *


class SQLiteHandler(logging.Handler):
    """
    Custom logging handler that writes logs to SQLite database with daily rotation
    """

    def __init__(self, db_path):
        logging.Handler.__init__(self)
        self.db_path = db_path
        self._current_date = datetime.now().strftime("%Y%m%d")

    def _should_rotate(self):
        """Check if we should rotate the file"""
        current_date = datetime.now().strftime("%Y%m%d")
        return current_date != self._current_date

    def _rotate(self):
        """Rotate to a new file"""
        self._current_date = datetime.now().strftime("%Y%m%d")
        logs_dir = os.path.dirname(self.db_path)
        new_db_path = os.path.join(logs_dir, f"logs_{self._current_date}.db")
        self.db_path = new_db_path

        # Create new database with table
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS logs (
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                level VARCHAR(10),
                message TEXT
            )
        """
        )
        conn.commit()
        conn.close()

    def emit(self, record):
        # Check if we need to rotate
        if self._should_rotate():
            self._rotate()

        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO logs (level, message)
                VALUES (?, ?)
                """,
                (record.levelname, self.format(record)),
            )
            conn.commit()
        except Exception as e:
            print(f"Error writing to SQLite database: {e}")
        finally:
            if conn:
                conn.close()


def setup_sqlite_logger(db_path="logs.db"):
    """
    Setup SQLite logging handler with date-based filename
    """
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
    os.makedirs(logs_dir, exist_ok=True)

    # Generate date-based filename
    date_str = datetime.now().strftime("%Y%m%d")
    db_filename = f"logs_{date_str}.db"

    if db_path == "logs.db":  # Only modify default filename
        db_path = db_filename

    # Full path for the database
    db_full_path = os.path.join(logs_dir, db_path)

    # Create the table if it doesn't exist
    conn = sqlite3.connect(db_full_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS logs (
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            level VARCHAR(10),
            message TEXT
        )
    """
    )
    conn.commit()
    conn.close()

    return db_full_path


def set_log_lvl(level="INFO", use_sqlite=True):
    """
    Set the logging level for the logger with optional SQLite support.
    """
    if not level:
        level = "INFO"
    level = level.upper()
    # set the logging level based on text input
    if level == "DEBUG":
        level = logging.DEBUG
    elif level == "INFO":
        level = logging.INFO
    elif level == "WARNING":
        level = logging.WARNING
    elif level == "ERROR":
        level = logging.ERROR
    elif level == "CRITICAL":
        level = logging.CRITICAL
    else:
        raise ValueError(f"Invalid log level: {level}")

    # Clear any existing handlers
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    if use_sqlite:
        # Setup SQLite logging
        db_path = setup_sqlite_logger()

        # Create a format for the logs
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

        # Create SQLite handler
        sqlite_handler = SQLiteHandler(db_path)
        sqlite_handler.setFormatter(formatter)

        # Configure the root logger
        logging.root.setLevel(level)
        logging.root.addHandler(sqlite_handler)
    else:
        # Use default logging configuration
        logging.basicConfig(level=level)

    logging.info(f"Logging level set to {logging.getLevelName(level)}")


def timer(func):
    """
    Decorator to time a function's execution.
    """

    def wrapper(*args, **kwargs):
        start_time = time.time()
        func(*args, **kwargs)
        end_time = time.time()
        logging.debug(
            f"Function '{func.__name__}' took {end_time - start_time:.4f} seconds to execute"
        )

    return wrapper


def addExceptionsExistingValues(exceptions, field, error):
    if not exceptions:
        exceptions = []
        exceptions.append(
            {
                "field": field,
                "message": error,
            }
        )
        return exceptions
    i = 0
    for exception in exceptions:
        if exception["field"] == field:
            exceptions[i]["message"] = error
        else:
            exceptions.append(
                {
                    "field": field,
                    "message": error,
                }
            )

        i += 1
    return exceptions


def contains_number(val):
    return any(i.isdigit() for i in val)


# idnumber validation
def validate_idno(val):
    # strip any leading and trailing spaces
    val = str(val).strip() if val else None
    # check for blank entry
    if val == None:
        return False
    # check length invalid for less than 13 digits
    if len(val) != 13:
        return False
    # check if non numeric characters are included
    if not (val.isnumeric()):
        return False
    # check if first six digits can be converted to date
    try:
        check_date = datetime.strptime(val[:6], "%y%m%d")
    except:
        return False

    # algorithm check
    # sum all digits in non equal postions in string
    test1 = (
        int(val[0])
        + int(val[2])
        + int(val[4])
        + int(val[6])
        + int(val[8])
        + int(val[10])
    )

    # concatenate all digits in equal position in string and then multiply the number by 2
    test2 = int(val[1] + val[3] + val[5] + val[7] + val[9] + val[11]) * 2

    # convert result from test2 to string
    str_test2 = str(test2)

    # sum each digit of the result of test2
    test3 = 0
    for it in range(0, len(str_test2)):
        test3 = test3 + int(str_test2[it])

    # add test3 to test1
    test1 = test1 + test3

    # get the comparison digit
    comp_digit = 0 if int(str(test1)[-1]) == 0 else (10 - int(str(test1)[-1]))

    # compare comparison digit to final digit of id, if a match ID is valid
    if comp_digit == int(val[12]):
        # check if last 7 characters are 0000000 then false positive
        if val[6:] == "0000000":
            return False
        return True
    # return false as default
    return False


# returns valid dob from SA ID
def return_dob(val):
    # requires function validate_idno
    if validate_idno(val):
        try:
            check_date = datetime.strptime(val[:6], "%y%m%d")
            if check_date > datetime.now():
                check_date = check_date - relativedelta(years=100)
            return check_date.strftime("%Y-%m-%d")
        except:
            return None

    return None


# return date
def return_date(val, fmt="%Y-%m-%d"):
    try:
        # if not (isinstance(val, datetime.date)):
        #     check_date = datetime.strptime(val, fmt)
        #     return check_date.strftime("%Y-%m-%d")
        return val.strftime(fmt)

    except:
        return None


# return age
def return_age(dob, endDate):
    try:
        if not dob or not endDate:
            return None

        # Ensure dob and endDate are datetime objects
        # if isinstance(dob, str):
        #     dob = datetime.strptime(dob, "%Y-%m-%d")
        # if isinstance(endDate, str):
        #     endDate = datetime.strptime(endDate, "%Y-%m-%d")
        # if dob and endDate is less than 1 year apart return 0
        if relativedelta(endDate, dob).years == 0:
            return 0
        return relativedelta(endDate, dob).years
    except Exception as e:
        print(e)
        return None


def valid_email(email):

    regex = re.compile(
        r"([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*])"
    )

    if re.search(regex, email):
        return True
    return False


def valid_phone(phone, isMobile=False):
    if isinstance(phone, str) and re.match(r"^0[6-8][0-9]{8}$", phone):
        return True

    return False
