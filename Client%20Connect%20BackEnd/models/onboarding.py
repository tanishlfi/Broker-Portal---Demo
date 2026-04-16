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
from sqlalchemy.dialects.mssql import BIT
import logging


class BrokerageRepresentativeMap(Base):
    __tablename__ = "BrokerageRepresentativeMap"
    __table_args__ = {"schema": "onboarding"}

    BrokerageRepresentativeMapId = Column(Integer, primary_key=True, autoincrement=True)
    BrokerageId = Column(Integer)
    RepresentativeId = Column(Integer)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())


class PolicyMember(Base):
    __tablename__ = "PolicyMember"
    __table_args__ = {"schema": "onboarding"}

    PolicyMemberId = Column(Integer, primary_key=True, autoincrement=True)
    policyId = Column("PolicyDataId", Integer, primary_key=True)
    memberId = Column("InsuredMemberId", Integer, primary_key=True)
    PolicyHolderMemberId = Column(Integer)
    status = Column(String, default="New")
    StartDate = Column(Date)
    memberTypeId = Column("coverMemberTypeId", Integer, nullable=False)
    memberType = Column(String)
    isBeneficiary = Column(Boolean, default=False)
    roleplayerTypeId = Column("MemberTypeId", Integer)
    statedBenefitId = Column("StatedBenefitId", Integer)
    statedBenefit = Column(String)
    benefit = Column(String)
    benefitRate = Column(Float)
    CoverAmount = Column(Float)
    premium = Column(Float)
    # rolePlayerId = Column(Integer)
    fileRow = Column(Integer)
    exceptions = Column(String(4000))
    createdBy = Column(String)
    createdAt = Column(DateTime, default=func.now())
    updatedBy = Column(String)
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    deletedAt = Column(DateTime)
    PreviousInsurer = Column(String)
    PreviousInsurerPolicyNumber = Column(String(50))
    PreviousInsurerJoinDate = Column(Date)
    PreviousInsurerCancellationDate = Column(Date)
    PreviousInsurerCoverAmount = Column(Float)
    onboardingDataId = Column(Integer)


class Policy(Base):
    __tablename__ = "PolicyData"
    __table_args__ = {"schema": "onboarding"}

    id = Column("PolicyDataId", Integer, autoincrement=True, primary_key=True)
    actionType = Column(String, default="ADD")
    # productTypeId = Column(Uuid)
    parentPolicyId = Column(Integer)
    SchemeRolePlayerId = Column(Integer)
    BrokerageRepresentativeMapId = Column(Integer)
    providerInceptionDate = Column(DateTime)
    status = Column(String, default="Processing")
    StatusNote = Column(String)
    selectedCategory = Column(String)
    providerId = Column(Integer)
    productOptionId = Column("ProductOptionId", Integer)
    joinDate = Column("PolicyInceptionDate", Date)
    coverAmount = Column(Float)
    Premium = Column(Float)
    AdminPercentage = Column(Float)
    CommissionPercentage = Column(Float)
    BinderFeePercentage = Column(Float)
    ReferenceNumber = Column(String(50))
    fileId = Column(Uuid(as_uuid=False))
    approverId = Column(String)
    createdBy = Column(String)
    CreatedDate = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    updatedBy = Column(String)
    deletedAt = Column(DateTime)
    status = Column(String, default="processing")
    InstallmentDayOfMonth = Column(Integer)
    paymentFrequencyId = Column("PaymentFrequencyId", Integer)
    BrokerageName = Column(Text)
    ProviderName = Column(Text)
    PremiumAdjustmentPercentage = Column(Float)
    onboardingPoliciesId = Column(Integer)
    PolicyNumber = Column(String)


class Member(Base):
    __tablename__ = "Member"
    __table_args__ = {"schema": "onboarding"}

    id = Column("MemberId", Integer, primary_key=True, autoincrement=True)
    rolePlayerId = Column(Integer)
    idTypeId = Column("IdType", Integer)
    idNumber = Column("IdNumber", String)
    firstName = Column("FirstName", String)
    surname = Column("Surname", String)
    dateOfBirth = Column("DateOfBirth", Date)
    dateOfDeath = Column("DateOfDeath", Date)
    deathCertificateNumber = Column("DeathCertificateNumber", String)
    vopdVerified = Column("VopdVerified", Boolean, default=False)
    vopdVerificationDate = Column("VopdVerificationDate", DateTime)
    genderId = Column("GenderId", Integer)
    communicationPreferenceId = Column("CommunicationPreferenceId", Integer)
    telephoneNumber = Column("TelephoneNumber", String)
    mobileNumber = Column("MobileNumber", String)
    emailAddress = Column("EmailAddress", String)
    addressTypeId = Column("AddressTypeId", Integer)
    addressLine1 = Column("AddressLine1", String)
    addressLine2 = Column("AddressLine2", String)
    postalCode = Column("PostalCode", String(6))
    city = Column("City", String)
    province = Column("Province", String)
    countryId = Column("CountryId", Integer, default=1)
    createdBy = Column("CreatedBy", String)
    createdAt = Column("CreatedDate", DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    updatedBy = Column(String)
    deletedAt = Column(DateTime)
    notes = Column(Text)
    vopdResponse = Column(Text)
    supportDocument = Column(Text)


class File(Base):
    __tablename__ = "Files"
    __table_args__ = {"schema": "onboarding"}

    id = Column(Uuid, primary_key=True)
    # productTypeId = Column(Uuid)
    providerId = Column(Integer)
    productOptionId = Column(Integer)
    brokerageId = Column(Integer)
    parentPolicyId = Column(Integer)
    schemeRolePlayerId = Column(Integer)
    AdminPercentage = Column(Integer)
    CommissionPercentage = Column(Integer)
    BinderFeePercentage = Column(Integer)
    providerInceptionDate = Column(DateTime)
    joinDate = Column(Date)
    status = Column(String)
    statusDescription = Column(String)
    fileName = Column(String)
    orgFileName = Column(String(1000))
    createdBy = Column(String)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    totalRows = Column(Integer)
    blankRows = Column(Integer)
    processedRows = Column(Integer)
    documents = Column(Text)
    approverId = Column(Text)
    brokerageName = Column(Text)
    scheme = Column(Text)


class ServiceBusMessage(Base):
    __tablename__ = "ServiceBusMessages"
    __table_args__ = {"schema": "onboarding"}

    ServiceBusMessageId = Column(Integer, autoincrement=True, primary_key=True)
    RequestType = Column(String(30), default="PolicyAdd")
    RequestDate = Column(DateTime, default=func.now())
    RequestReferenceNumber = Column(String(50))
    ResponseDate = Column(DateTime)
    ResponseReferenceNumber = Column(String(50))
    ResponseMessage = Column(String(4000))
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())


class PolicyCheck(Base):
    __tablename__ = "policy_checks"
    __table_args__ = {"schema": "onboarding"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    policyId = Column(Integer)
    checkDescr = Column(String)
    status = Column(Boolean)
    createdAt = Column(DateTime(timezone=True), default=func.now())
    updatedAt = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())


class ClientUpdate(Base):
    __tablename__ = "client_updates"
    __table_args__ = {"schema": "onboarding"}

    idNumber = Column(String, primary_key=True)
    idTypeId = Column(Integer)
    batchId = Column(Integer)
    firstName = Column(String)
    surname = Column(String)
    numberOfPoliciesFound = Column(Integer)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    policyId = Column(Integer, primary_key=True)


class ClientUpdateData(Base):
    __tablename__ = "client_update_data"
    __table_args__ = {"schema": "onboarding"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    idNumber = Column(String)
    rolePlayerId = Column(Integer)
    memberId = Column(Integer)
    policyId = Column(Integer)
    statedBenefitId = Column(Integer)
    coverAmount = Column(Float)
    memberType = Column(Integer)
    insuredLifeStatus = Column(Integer)
    policyStatus = Column(Integer)
    parentPolicyId = Column(Integer)
    brokerId = Column(Integer)
    representativeId = Column(Integer)
    activeClaim = Column(Boolean)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())


class fileDataOrg(Base):
    __tablename__ = "fileDataOrg"
    __table_args__ = {"schema": "onboarding"}

    fileId = Column("fileId", Text, primary_key=True)
    fileRow = Column("fileRow", Integer, primary_key=True)
    idValid = Column(Boolean, default=False)
    clientType = Column("memberType", Text)
    firstName = Column(Text)
    surname = Column(Text)
    mainMemberLinkId = Column(Text)
    idNumber = Column(Text)
    passportNumber = Column(Text)
    dateOfBirth = Column(Date)
    benefitName = Column(Text)
    joinDate = Column(Date)
    previousInsurer = Column(Text)
    previousInsurerPolicyNumber = Column(Text)
    previousInsurerJoinDate = Column(Date)
    previousInsurerCancellationDate = Column(Date)
    address1 = Column(Text)
    address2 = Column(Text)
    city = Column(Text)
    province = Column(Text)
    country = Column(Text)
    areaCode = Column(Text)
    postalAddress1 = Column(Text)
    postalAddress2 = Column(Text)
    postalCity = Column(Text)
    postalProvince = Column(Text)
    postalCountry = Column(Text)
    postalCode = Column(Text)
    telephone = Column(Text)
    mobile = Column(Text)
    email = Column(Text)
    preferredMethodOfCommunication = Column(Text)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())


class onboardingPolicy(Base):
    __tablename__ = "onboardingPolicies"
    __table_args__ = {"schema": "onboarding"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    parentPolicyId = Column(Integer)
    ProductOptionId = Column(Integer)
    brokerageId = Column(Integer)
    providerInceptionDate = Column(Date)
    PolicyInceptionDate = Column(Date)
    OrgPolicyInceptionDate = Column(Date)
    coverAmount = Column(Float)
    status = Column(Text, default="Processing")
    statusNote = Column(Text)
    selectedCategory = Column(Text)
    fileId = Column(Uuid(as_uuid=False))
    approverId = Column(Text)
    createdBy = Column(Text)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    updatedBy = Column(Text)
    deletedAt = Column(DateTime)
    BrokerageName = Column(Text)
    ProviderName = Column(Text)
    allowDuplicate = Column(BIT, default=False)
    PolicyDataId = Column(Integer)


class onboardingData(Base):
    __tablename__ = "onboardingData"
    __table_args__ = {"schema": "onboarding"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    policyId = Column(Integer)
    fileId = Column(Uuid)
    fileRow = Column(Integer)
    idValid = Column(Boolean, default=False)
    dateOfDeath = Column("DateOfDeath", Date)
    vopdVerified = Column("VopdVerified", Boolean, default=False)
    vopdVerificationDate = Column("VopdVerificationDate", DateTime)
    vopdResponse = Column(Text)
    status = Column(Text, default="New")
    exceptions = Column(Text)
    memberType = Column(Text)
    memberTypeId = Column(Integer)
    firstName = Column(Text)
    surname = Column(Text)
    mainMemberLinkId = Column(Text)
    idTypeId = Column(Integer)
    idNumber = Column(Text)
    dateOfBirth = Column(Date)
    statedBenefitId = Column(Integer)
    statedBenefit = Column(Text)
    benefitName = Column(Text)
    joinDate = Column(Date)
    coverAmount = Column("CoverAmount", Float)
    premium = Column(Float)
    previousInsurer = Column(Text)
    previousInsurerPolicyNumber = Column(Text)
    previousInsurerJoinDate = Column(Date)
    previousInsurerCancellationDate = Column(Date)
    PreviousInsurerCoverAmount = Column(Float)
    address1 = Column(Text)
    address2 = Column(Text)
    city = Column(Text)
    province = Column(Text)
    country = Column(Text)
    areaCode = Column(Text)
    postalAddress1 = Column(Text)
    postalAddress2 = Column(Text)
    postalCity = Column(Text)
    postalProvince = Column(Text)
    postalCountry = Column(Text)
    postalCode = Column(Text)
    telephone = Column(Text)
    mobile = Column(Text)
    email = Column(Text)
    preferredMethodOfCommunication = Column(Text)
    gender = Column(Text)
    isStudent = Column(Boolean, default=False)
    isDisabled = Column(Boolean, default=False)
    supportDocument = Column(Text)
    notes = Column(Text)
    createdBy = Column(Text)
    updatedBy = Column(Text)
    deletedAt = Column(DateTime)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now(), default=func.now())
    isBeneficiary = Column(Boolean, default=False)
    rolePlayerId = Column(Integer)
    alsoMember = Column(Boolean, default=False)


# Define a before_update event listener
@event.listens_for(onboardingData, "before_update")
def before_update_listener(mapper, connection, target):
    Session = sessionmaker()
    # Use inspect to get the current state of the target
    # Get the state of the object

    inspection = inspect(target)
    # old_instance = session.query(AstuteResponse).get(target.idNumber)

    # if not old_instance:
    #     return  # Handle the case where no old record exists (which shouldn't happen for an update)

    # Prepare dictionaries to hold old and new values
    old_values = {}
    new_values = {}
    diff = {}

    for attr in inspection.attrs:
        field = attr.key
        old_value = (
            attr.history.deleted[0]
            if attr.history.deleted
            else (attr.history.unchanged[0] if attr.history.unchanged else None)
        )
        new_value = (
            attr.history.added[0]
            if attr.history.added
            else (attr.history.unchanged[0] if attr.history.unchanged else None)
        )

        old_values[field] = old_value
        new_values[field] = new_value

        if attr.history.has_changes():
            diff[field] = [old_value, new_value]

    # print(f"Old values: {old_values}")
    # print(f"New values: {new_values}")
    # print(f"Diff: {diff}")

    session = Session(bind=connection, autoflush=False)

    changeLog = History(
        schemaName="onboarding",
        tableName="onboardingData",
        tableId=target.id,
        before=old_values,
        after=new_values,
        changedValue=diff,
        changeType="UPDATE",
        updatedBy="System",
    )

    # Save the ChangeLog entry to the database
    session.add(changeLog)
    session.flush()  # Manually flush the session
    session.commit()


# Define a before_update event listener
@event.listens_for(onboardingPolicy, "before_update")
def before_update_listener(mapper, connection, target):
    Session = sessionmaker()
    # Use inspect to get the current state of the target
    # Get the state of the object

    inspection = inspect(target)
    # old_instance = session.query(AstuteResponse).get(target.idNumber)

    # if not old_instance:
    #     return  # Handle the case where no old record exists (which shouldn't happen for an update)

    # Prepare dictionaries to hold old and new values
    old_values = {}
    new_values = {}
    diff = {}

    for attr in inspection.attrs:
        field = attr.key
        old_value = (
            attr.history.deleted[0]
            if attr.history.deleted
            else (attr.history.unchanged[0] if attr.history.unchanged else None)
        )
        new_value = (
            attr.history.added[0]
            if attr.history.added
            else (attr.history.unchanged[0] if attr.history.unchanged else None)
        )

        old_values[field] = old_value
        new_values[field] = new_value

        if attr.history.has_changes():
            diff[field] = [old_value, new_value]
    logging.debug(f"Old values: {old_values}")
    logging.debug(f"New values: {new_values}")
    logging.debug(f"Diff: {diff}")

    session = Session(bind=connection, autoflush=False)

    changeLog = History(
        schemaName="onboarding",
        tableName="onboardingPolicy",
        tableId=target.id,
        before=old_values,
        after=new_values,
        changedValue=diff,
        changeType="UPDATE",
        updatedBy="System",
    )

    # Save the ChangeLog entry to the database
    session.add(changeLog)
    session.flush()  # Manually flush the session
    session.commit()
