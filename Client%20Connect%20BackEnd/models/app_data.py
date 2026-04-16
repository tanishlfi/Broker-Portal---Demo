from sqlalchemy import Column, Integer, String, Date, DateTime, Uuid, Boolean, Float

from .orm_base import Base
from sqlalchemy.sql import func


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"schema": "app_data"}

    id = Column("id", Uuid, primary_key=True)
    from_user_email = Column(String)
    to_user_email = Column(String)
    variant = Column(String)
    title = Column(String)
    message = Column(String)
    type = Column(String)
    read = Column(Boolean)
    link = Column(String)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())


class ProcessBypass(Base):
    __tablename__ = "ProcessBypass"
    __table_args__ = {"schema": "app_data"}

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    processName = Column(String)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())


class Approver(Base):
    __tablename__ = "approvers"
    __table_args__ = {"schema": "app_data"}

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    approverId = Column(String)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    Team = Column(String)


class Broker(Base):
    __tablename__ = "brokers"
    __table_args__ = {"schema": "app_data"}

    id = Column(Integer, primary_key=True)
    brokerName = Column(String, nullable=False)


class Scheme(Base):
    __tablename__ = "brokerSchemes"
    __table_args__ = {"schema": "app_data"}

    id = Column(Integer, primary_key=True)
    brokerId = Column(Integer)
    schemeName = Column(String)
