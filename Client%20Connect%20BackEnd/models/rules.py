from sqlalchemy import Column, Integer, String, Date, DateTime, Uuid, Float, Boolean
from .orm_base import Base
from sqlalchemy.sql import func


class BenefitRule(Base):
    __tablename__ = "BenefitRules"
    __table_args__ = {"schema": "rules"}

    benefitId = Column(Integer, primary_key=True)
    benefitAmount = Column(Float, default=10000)
    benefit = Column(String, nullable=False)
    coverMemberTypeId = Column(Integer, nullable=False)
    minAge = Column(Integer, default=0)
    maxAge = Column(Integer, default=0)
    spouse = Column(Integer, default=0)
    children = Column(Integer, default=0)
    childMinAge = Column(Integer, default=0)
    childMaxAge = Column(Integer, default=0)
    studentChildMinAge = Column(Integer, default=0)
    studentChildMaxAge = Column(Integer, default=0)
    disabledChildMinAge = Column(Integer, default=0)
    disabledChildMaxAge = Column(Integer, default=0)
    familyMembers = Column(Integer, default=0)
    familyMemberMinAge = Column(Integer, default=0)
    familyMemberMaxAge = Column(Integer, default=0)
    familyMembersOver64 = Column(Integer, default=0)
    extended = Column(Integer, default=0)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    otherBenefit = Column(Integer, default=0)
    parentBenefit = Column(Integer, default=0)
    baseRate = Column(Float, default=0)


class ProductOptionBenefit(Base):
    __tablename__ = "ProductOptionBenefits"
    __table_args__ = {"schema": "rules"}

    productOptionId = Column(Integer, primary_key=True)
    benefitId = Column(Integer, primary_key=True)
    # TODO
    # familyMembersAllowed = Column(Boolean, default=False)


class DependantBenefitRule(Base):
    __tablename__ = "DependantBenefitRules"
    __table_args__ = {"schema": "rules"}

    id = Column(Integer, primary_key=True)
    benefit = Column(String)
    maxAge = Column(Integer)
    minAge = Column(Integer)
    benefitAmount = Column(Float)
    coverMemberType = Column(String)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    subGroup = Column(String)
    baseRate = Column(Float, default=0)


class BenefitDependantBenefitRule(Base):
    __tablename__ = "BenefitDependantBenefitRules"
    __table_args__ = {"schema": "rules"}

    mainBenefitId = Column(Integer, primary_key=True)
    dependantBenefitId = Column(Integer, primary_key=True)
    default = Column(Boolean, default=False)


class productOption(Base):
    __tablename__ = "productOptions"
    __table_args__ = {"schema": "rules"}

    productOptionId = Column(Integer, primary_key=True, autoincrement=False)
    benefitId = Column(Integer, primary_key=True, autoincrement=False)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())


class benefit(Base):
    __tablename__ = "benefits"
    __table_args__ = {"schema": "rules"}

    id = Column(Integer, primary_key=True, autoincrement=False)
    name = Column(String)
    code = Column(String)
    startDate = Column(Date)
    endDate = Column(Date)
    productId = Column(Integer)
    benefitTypeId = Column(Integer)
    coverMemberTypeId = Column(Integer)
    coverAmount = Column(Float)
    baseRate = Column(Float, default=0)
    benefitAmount = Column(Float)
    minAge = Column(Integer)
    maxAge = Column(Integer)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
