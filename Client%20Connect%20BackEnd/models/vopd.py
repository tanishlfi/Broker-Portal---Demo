from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func


Base = declarative_base()


# Define your model
class AstuteResponse(Base):
    __tablename__ = "AstuteResponses"
    __table_args__ = {"schema": "vopd"}

    idNumber = Column(Integer, primary_key=True, autoincrement=False)
    status = Column(String)
    fullResponse = Column(String)
    firstName = Column(String)
    surname = Column(String)
    dateOfDeath = Column(Date)
    dateOfBirth = Column(Date)
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    createdAt = Column(DateTime, default=func.now())
    deceasedStatus = Column(String(50))
    maritalStatus = Column(String)
    queueTransfer = Column(Boolean, default=False)
    gender = Column(String)
    groupNumber = Column(Integer)
