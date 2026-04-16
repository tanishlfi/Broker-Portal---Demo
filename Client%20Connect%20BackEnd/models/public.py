from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, event, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm.attributes import get_history
import json
import datetime
import uuid


def custom_serializer(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    if isinstance(obj, uuid.UUID):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable value {obj}")


Base = declarative_base()


# Define your model
class History(Base):
    __tablename__ = "tableHistory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    schemaName = Column(String)
    tableName = Column(String)
    tableId = Column(Integer)
    changeType = Column(String)
    _changedValue = Column("changedValue", String)
    updatedBy = Column(String)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now())
    _before = Column("before", String)
    _after = Column("after", String)

    @property
    def before(self):
        return self._before

    @before.setter
    def before(self, value):
        if isinstance(value, dict):
            self._before = json.dumps(value, default=custom_serializer)
        else:
            self._before = value

    @property
    def after(self):
        return self._after

    @after.setter
    def after(self, value):
        if isinstance(value, dict):
            self._after = json.dumps(value, default=custom_serializer)
        else:
            self._after = value

    @property
    def changedValue(self):
        return self._changedValue

    @changedValue.setter
    def changedValue(self, value):
        if isinstance(value, dict):
            self._changedValue = json.dumps(value, default=custom_serializer)
        else:
            self._changedValue = value
