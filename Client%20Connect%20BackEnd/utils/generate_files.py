import os
from openpyxl import Workbook
import utils
import datetime
import logging


def excelFile(keys, data, new_filename):
    # remove
    logging.debug(new_filename)
    # Create a new workbook and select the active worksheet
    wb = Workbook()
    ws = wb.active
    ws.title = "data"

    # Add dictionary keys as headers in the first row
    headers = list(keys)
    ws.append(headers)

    # Add dictionary values to the worksheet, based on the keys position
    for row in data:
        ws.append(row)

    # Save the workbook
    wb.save("temp\\" + new_filename)
    wb.close()
    az_conn = utils.connectAzStorage(os.getenv("AZSAS"))
    utils.uploadFileAzStorage(
        az_conn, os.getenv("AZ_BLOB"), new_filename, "temp\\" + new_filename
    )

    return new_filename


def excelFileOnly(keys, data, new_filename):
    # remove
    logging.debug(new_filename)
    # Create a new workbook and select the active worksheet
    wb = Workbook()
    ws = wb.active
    ws.title = "data"

    # Add dictionary keys as headers in the first row
    headers = list(keys)
    ws.append(headers)

    # Add dictionary values to the worksheet, based on the keys position
    for row in data:
        ws.append(row)

    # Save the workbook
    wb.save("temp\\" + new_filename)
    wb.close()
    # az_conn = utils.connectAzStorage(os.getenv("AZSAS"))
    # utils.uploadFileAzStorage(
    #     az_conn, os.getenv("AZ_BLOB"), new_filename, "temp\\" + new_filename
    # )

    return new_filename
