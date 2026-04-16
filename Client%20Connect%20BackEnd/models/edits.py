from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Uuid,
    Boolean,
    Float,
    Text,
    event,
    inspect,
)

from .orm_base import Base
from sqlalchemy.sql import func
from models.public import History
from sqlalchemy.orm import sessionmaker


class policyData(Base):
    __tablename__ = "policyData"
    __table_args__ = {"schema": "edit"}

    PolicyId = Column(Integer, primary_key=True)
    requestId = Column(String(36), primary_key=True)
    BrokerageId = Column(Integer)
    ParentPolicyNumber = Column(Integer)
    PolicyNumber = Column(String(255))
    PolicyStatus = Column(String(255))
    EffectiveFrom = Column(DateTime)
    policyCancelReasonEnum = Column(String(255))
    brokerage = Column(String(255))
    scheme = Column(String(255))
    FSPNumber = Column(String(255))
    RepresentativeIdNumber = Column(String(255))
    ProductOptionCode = Column(String(255))
    ProductOptionId = Column(Integer)
    InstallmentPremium = Column(Float)
    coverAmount = Column(Float)
    AdminPercentage = Column(Float)
    CommissionPercentage = Column(Float)
    BinderFeePercentage = Column(Float)
    mainMember = Column(Text)
    mainMemberId = Column(String(255))
    PolicyMembers = Column(Text)
    PolicyMembersOrg = Column(Text)
    createdBy = Column(Text)
    updatedBy = Column(Text)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    BankingDetails = Column(Text)
    BankingDetailsOrg = Column(Text)
    PolicyDetailsOrg = Column(Text)
    paymentMethodId = Column(Integer)
    regularInstallmentDayOfMonth = Column(Integer)
    decemberInstallmentDayOfMonth = Column(Integer)
