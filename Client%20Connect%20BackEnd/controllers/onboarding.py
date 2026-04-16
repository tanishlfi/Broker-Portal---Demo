import os
import utils
import logging
from models import (
    PolicyCheck,
    Member,
    ClientUpdate,
    Policy,
    PolicyMember,
    ClientUpdateData,
    OnboardingPolicy,
    onboardingPolicy,
    onboardingData,
    ServiceBusMessage,
    OnboardingFile,
    AstuteResponse,
    BrokerageRepresentativeMap,
)
from sqlalchemy import (
    update,
    func,
    cast,
    Date,
    insert,
    exists,
    or_,
    select,
    text,
    alias,
    and_,
)
from sqlalchemy.orm import aliased
import utils
import json
import datetime
from .vopd import addVOPD
import concurrent.futures
import pytz


# @description: get all files from the onboarding file table and update the brokerageName and schemeName from RMA API
# @params: db_conn
def update_file_brokerage_scheme():
    try:
        with utils.orm_conn(os.getenv("DATABASE_URL")) as db_conn:
            s = (
                OnboardingFile.__table__.select()
                .with_hint(OnboardingFile, "WITH (NOLOCK)")
                .where(
                    or_(
                        OnboardingFile.brokerageName == None,
                        OnboardingFile.scheme == None,
                    )
                )
                .with_only_columns(OnboardingFile.providerId)
                .distinct()
                .limit(100)
            )
            result = db_conn.execute(s)
            for row in result.mappings().all():
                logging.debug(f"Check file: {row}")
                # get brokerageName and schemeName from rma api
                getProvider = utils.get_rma_api(
                    f"/clc/api/Policy/Policy/{row['providerId']}"
                )
                brokerageName = None
                schemeName = None
                if getProvider:
                    brokerageName = getProvider["brokerageName"]
                    schemeName = getProvider["clientName"]

                # update file with brokerageName and schemeName
                s = (
                    update(OnboardingFile)
                    .where(
                        OnboardingFile.providerId == row["providerId"],
                        or_(
                            OnboardingFile.brokerageName == None,
                            OnboardingFile.scheme == None,
                        ),
                    )
                    .values(
                        brokerageName=brokerageName,
                        scheme=schemeName,
                    )
                )
                db_conn.execute(s)
            db_conn.commit()
    except Exception as error:
        logging.error(error)
        db_conn.rollback()


# @description: get all policies without a brokerageName and schemeName and update the policy with the brokerageName and schemeName from RMA API
# @params: db_conn
def update_policy_brokerage_scheme():
    with utils.orm_conn(os.getenv("DATABASE_URL")) as db_conn:
        try:
            s = (
                onboardingPolicy.__table__.select()
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .where(
                    or_(
                        onboardingPolicy.BrokerageName == None,
                        onboardingPolicy.ProviderName == None,
                        onboardingPolicy.ProductOptionId == None,
                        onboardingPolicy.brokerageId == None,
                    )
                )
                .with_only_columns(onboardingPolicy.parentPolicyId)
                .distinct()
                .limit(100)
            )
            result = db_conn.execute(s)
            for row in result.mappings().all():
                logging.debug(f"Check policy: {row}")
                # get brokerageName and schemeName from rma api
                getProvider = utils.get_rma_api(
                    f"/clc/api/Policy/Policy/{row["parentPolicyId"]}"
                )
                brokerageName = None
                schemeName = None
                productId = None
                brokerageId = None
                if getProvider:
                    brokerageName = getProvider["brokerageName"]
                    schemeName = getProvider["clientName"]
                    productId = getProvider["productOptionId"]
                    brokerageId = getProvider["brokerageId"]

                # update policy with brokerageName and schemeName
                s = (
                    update(onboardingPolicy)
                    .where(
                        onboardingPolicy.parentPolicyId == row["parentPolicyId"],
                        or_(
                            onboardingPolicy.BrokerageName == None,
                            onboardingPolicy.ProviderName == None,
                            onboardingPolicy.ProductOptionId == None,
                            onboardingPolicy.brokerageId == None,
                        ),
                    )
                    .values(
                        BrokerageName=brokerageName,
                        ProviderName=schemeName,
                        ProductOptionId=productId,
                        brokerageId=brokerageId,
                    )
                )
                db_conn.execute(s)
            db_conn.commit()
        except Exception as error:
            logging.error(error)
            db_conn.rollback()


# @description: update approved policies with status of "Approved" and statusNote != "Policy transferred to modernisation"
# @params: db_conn
def update_approved_policies_ref(db_conn):
    try:
        # set reference number to CDA + create date in  yyyyMMdd + - + filler of 000000 and PolicyDataId
        utils.orm_query(
            db_conn,
            "update onboarding.PolicyData set ReferenceNumber = 'CDA' + CONVERT(CHAR(8),createdDate,112) + '-' + right(concat('000000', PolicyDataId), 6) where status = 'Approved';",
        )
    except Exception as e:
        logging.error(f"Error in update_approved_policies: {e}")
        db_conn.rollback()


# @description: get policies with status of approved
# @params: none
# @returns: list of policies
def get_approved_policies(db_conn, policyList, lastPolicyId=0):
    try:
        aliasServiceBusMessage = aliased(ServiceBusMessage)
        s = (
            select(OnboardingPolicy)
            .with_hint(OnboardingPolicy, "WITH (NOLOCK)")
            .join(
                onboardingPolicy, onboardingPolicy.PolicyDataId == OnboardingPolicy.id
            )
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            # .join(PolicyCheck, PolicyCheck.policyId == OnboardingPolicy.id).with_hint(PolicyCheck, "WITH (NOLOCK)")
            # .join(
            #     ServiceBusMessage,
            #     ServiceBusMessage.RequestReferenceNumber
            #     == OnboardingPolicy.ReferenceNumber,
            #     isouter=True,
            # )
            # .with_hint(ServiceBusMessage, "WITH (NOLOCK)")
            .where(
                OnboardingPolicy.status == "Approved",
                OnboardingPolicy.onboardingPoliciesId != None,
                OnboardingPolicy.id > lastPolicyId,
                OnboardingPolicy.providerId != 40085,
                onboardingPolicy.deletedAt == None,
                onboardingPolicy.status == "Approved",
                # onboardingPolicy.id >= 200000,
                # onboardingPolicy.createdAt >= datetime.datetime(2026, 2, 1),
                # onboardingPolicy.fileId == "75039d2e-11fd-44e2-b569-18005feb86d5",
                onboardingPolicy.id.in_(policyList),
            )
            .filter(
                ~exists().where(
                    aliasServiceBusMessage.RequestReferenceNumber
                    == OnboardingPolicy.ReferenceNumber,
                    aliasServiceBusMessage.ResponseReferenceNumber != None,
                )
            )
            .order_by(OnboardingPolicy.id.asc())
            # .where(OnboardingPolicy.status == "Approved", PolicyCheck.status == True, PolicyCheck.checkDescr == "Benefit Confirmation", OnboardingPolicy.providerId != 40085, ServiceBusMessage.ResponseMessage == None).distinct()
            .limit(10)
        )
        getMembers = db_conn.execute(s)
        return getMembers.mappings().all()
    except Exception as e:
        logging.error(f"Error in get_approved_policies: {e}")
    return None


def getApprovedPoliciesOnboardingPolicies(db_conn, lastPolicyId=0):
    """
    get policies with status of approved from onboardingPolicies table
      # @params: none
      # @returns: list of policies
    """
    try:
        s = (
            select(onboardingPolicy)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .where(
                onboardingPolicy.status == "Approved",
                onboardingPolicy.id > lastPolicyId,
                onboardingPolicy.deletedAt == None,
                # onboardingPolicy.id >= 200000,
                # onboardingPolicy.createdAt >= datetime.datetime(2026, 2, 1),
                # onboardingPolicy.fileId == "75039d2e-11fd-44e2-b569-18005feb86d5",
                # onboardingPolicy.id.in_([297546]),
            )
            .order_by(onboardingPolicy.id.asc())
            .limit(100)
        )
        getMembers = db_conn.execute(s)
        return getMembers.mappings().all()
    except Exception as e:
        logging.error(f"Error in get_approved_policies: {e}")
    return None


def get_approved_policy(db_conn, policyId):
    try:

        s = (
            select(OnboardingPolicy)
            .with_hint(OnboardingPolicy, "WITH (NOLOCK)")
            # .join(PolicyCheck, PolicyCheck.policyId == OnboardingPolicy.id)
            # .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .where(OnboardingPolicy.status == "Approved")
            .distinct()
            # .where(OnboardingPolicy.status == "Approved", PolicyCheck.status == True, PolicyCheck.checkDescr == "Benefit Confirmation", OnboardingPolicy.providerId != 40085).distinct()
            # .limit(100)
        )
        getMembers = db_conn.execute(s)
        return getMembers.mappings().all()
    except Exception as e:
        logging.error(f"Error in get_approved_policies: {e}")
    return None


# function to return onboardingPoliciesId from ResponseReferenceNumber being checked on onboarding.PolicyData table
def get_onboarding_policy_id(db_conn, ReferenceNumber):
    try:
        s = (
            select(Policy)
            .add_columns(OnboardingPolicy.onboardingPoliciesId)
            .where(
                Policy.ReferenceNumber == ReferenceNumber,
            )
            .with_hint(Policy, "WITH (NOLOCK)")
        )
        getPolicy = db_conn.execute(s)
        getPolicyResult = getPolicy.mappings().first()
        if getPolicyResult:
            return getPolicyResult["onboardingPoliciesId"]
    except Exception as e:
        logging.error(f"Error in get_onboarding_policy_id: {e}")
    return None


def resetPolicy(conn, policyId, ReferenceNumber):
    qry1 = f"""update onboarding.onboardingPolicies
                set status = 'Approved'
                where id in ({policyId});

                update onboarding.PolicyData
                set status = 'Approved'
                where onboardingPoliciesId in ({policyId});

              delete from onboarding.ServiceBusMessages 
              where RequestReferenceNumber in (
              '{ReferenceNumber}'
              );"""
    qry1 = f"""with cte2 as (
select distinct pd.PolicyDataId, pd.onboardingPoliciesId
from onboarding.PolicyData pd (nolock)
where pd.onboardingPoliciesId in ({policyId})
) 
,cte as (
select distinct insuredMemberId 
from onboarding.PolicyMember pm (nolock)
inner join cte2 as b on pm.PolicyDataId = b.PolicyDataId
)
update m
set m.onboardingDataid = null
from onboarding.Member m
inner join cte as b on m.memberId = b.insuredMemberId;

with cte2 as (
select distinct pd.PolicyDataId, pd.onboardingPoliciesId
from onboarding.PolicyData pd (nolock)
where pd.onboardingPoliciesId in ({policyId})
) 
delete pm from onboarding.PolicyMember pm
where exists(select * from cte2 where PolicyDataId =  pm.PolicyDataId);

update onboarding.onboardingData
set memberId = null, PolicyMemberId = null
where policyId in ({policyId});


update onboarding.PolicyData
set status = 'Approved'
where onboardingPoliciesId in ({policyId});

update onboarding.onboardingPolicies
set status = 'Approved'
where id in ({policyId});

delete from onboarding.ServiceBusMessages 
where RequestReferenceNumber in (
'{ReferenceNumber}');
"""
    # logging.debug(f"Running qry: {qry1}")
    return utils.orm_query(conn, qry1)


def addApprovalPolicy(conn, policyId):
    try:
        qry1 = f"""update od
  set od.statedBenefitId = odh.statedBenefitId, od.statedBenefit = odh.statedBenefit 
  from onboarding.onboardingData od 
  inner join onboarding.onboardingDataHistory odh on od.id = odh.id
  inner join onboarding.onboardingPolicies op on od.policyId = op.id and op.status = 'Approved'
  where od.statedBenefitId is null
  and odh.statedBenefitId is not null
  and op.id in ({policyId});

  update pm
  set pm.statedBenefitId = od.statedBenefitId, pm.statedBenefit = od.statedBenefit 
  from onboarding.onboardingData od 
  inner join onboarding.PolicyMember pm on od.id = pm.onboardingDataId 
  inner join onboarding.onboardingPolicies op on od.policyId = op.id and op.status = 'Approved'
  where  pm.statedBenefitId is null
  and  od.statedBenefitId is not null
  and op.id in ({policyId});

  UPDATE pd
  SET
      pd.PolicyInceptionDate = op.PolicyInceptionDate,
      pd.coverAmount = op.coverAmount,
      pd.status = op.status,
      pd.approverId = op.approverId,
      pd.updatedAt = op.updatedAt,
      pd.updatedBy = op.updatedBy,
      pd.statusNote = op.statusNote,
      pd.onboardingPoliciesId = op.id
  FROM onboarding.PolicyData pd
  JOIN onboarding.onboardingPolicies op (NOLOCK) 
      ON pd.PolicyDataId = op.PolicyDataId
  WHERE op.status = 'Approved'
  and pd.deletedAt is null
  and op.id in ({policyId});

  INSERT INTO onboarding.PolicyData
  (parentPolicyId, providerId, ProductOptionId, providerInceptionDate, PolicyInceptionDate, coverAmount, status, selectedCategory, fileId, approverId, createdBy, CreatedDate, updatedAt, updatedBy, deletedAt, actionType, statusNote, BrokerageName, ProviderName, onboardingPoliciesId)
  select distinct parentPolicyId, parentPolicyId, ProductOptionId, providerInceptionDate, PolicyInceptionDate, coverAmount, 
  status, 3, fileId, approverId, createdBy, CreatedAt , updatedAt, updatedBy , deletedAt, 'ADD', statusNote, BrokerageName, ProviderName, id
  from onboarding.onboardingPolicies op (nolock)
  where status = 'Approved'
  and not exists(select * from onboarding.PolicyData (nolock) where PolicyDataId = op.PolicyDataId)
  and id in ({policyId})
  ;

  update op
  set op.PolicyDataId = pd.PolicyDataId 
  from onboarding.onboardingPolicies op
  inner join onboarding.PolicyData pd (nolock) on op.id = pd.onboardingPoliciesId
  where op.PolicyDataId is null
  and op.id in ({policyId});



  insert into onboarding.Member_old
  select m.*
  FROM onboarding.PolicyData pd
  JOIN onboarding.onboardingPolicies op (NOLOCK) 
      ON pd.PolicyDataId = op.PolicyDataId
    inner join onboarding.PolicyMember pm (NOLOCK) on pd.PolicyDataId = pm.PolicyDataId
    inner join onboarding.[Member] m (NOLOCK) on pm.insuredMemberId = m.MemberId
    where op.status = 'Approved'
  and pd.deletedAt is null
  and m.onboardingDataId is null
  and not exists(select * from onboarding.Member_old (nolock) where MemberId = m.MemberId)
  and op.id in ({policyId});

  delete m from onboarding.[Member] m
  where exists(select * from onboarding.Member_old (nolock) where MemberId = m.MemberId);

  insert into onboarding.PolicyMember_old
  select pm.*
  FROM onboarding.PolicyData pd
  JOIN onboarding.onboardingPolicies op (NOLOCK) 
      ON pd.PolicyDataId = op.PolicyDataId
    inner join onboarding.PolicyMember pm (NOLOCK) on pd.PolicyDataId = pm.PolicyDataId
    where op.status = 'Approved'
  and pd.deletedAt is null
  and pm.onboardingDataId is null
  and not exists(select * from onboarding.PolicyMember_old (nolock) where PolicyMemberId = pm.PolicyMemberId)
  and op.id in ({policyId})
  ;

  delete pm from onboarding.PolicyMember pm
  where exists(select * from onboarding.PolicyMember_old (nolock) where PolicyMemberId = pm.PolicyMemberId);


  INSERT INTO onboarding.[Member]
  ( rolePlayerId, IdType, IdNumber, FirstName, Surname, DateOfBirth, DateOfDeath,  VopdVerified, VopdVerificationDate,  CommunicationPreferenceId, TelephoneNumber, MobileNumber, EmailAddress, AddressTypeId, AddressLine1, AddressLine2, PostalCode, City, Province, CountryId, CreatedBy, CreatedDate, updatedBy, updatedAt, deletedAt, IsStudying, IsDisabled, supportDocument, notes, vopdResponse, onboardingDataId)
  select rolePlayerId, IdTypeId, IdNumber, FirstName, Surname, DateOfBirth, DateOfDeath, VopdVerified, VopdVerificationDate, preferredMethodOfCommunication, telephone, mobile, email, 1, address1, address2, areaCode, city, province, 1, od.CreatedBy, od.createdAt, od.updatedBy, od.updatedAt, od.deletedAt, od.IsStudent, od.IsDisabled, od.supportDocument, od.notes, od.vopdResponse, od.id
  FROM onboarding.PolicyData pd
  JOIN onboarding.onboardingPolicies op (NOLOCK) 
      ON pd.PolicyDataId = op.PolicyDataId
  inner join onboarding.onboardingData od (nolock) on op.id = od.policyId 
  WHERE op.status = 'Approved'
  and pd.deletedAt is null
  and od.deletedAt is null
  and od.alsoMember =0
  and not exists(select * from onboarding.[Member] (nolock) where onboardingDataId = od.id)
  and op.id in ({policyId});

  update od
  set od.MemberId = m.MemberId
  from onboarding.onboardingData od
  inner join onboarding.[Member] m (nolock) on od.id = m.onboardingDataId
  where od.MemberId is null
  and od.policyId in ({policyId});

  INSERT INTO onboarding.PolicyMember
  ( PolicyDataId, InsuredMemberId, status, StartDate, MemberTypeId, memberType, isBeneficiary, benefitRate, coverMemberTypeId, StatedBenefitId, statedBenefit, benefit, CoverAmount, Premium, fileRow, exceptions, createdBy, createdAt, updatedBy, updatedAt, deletedAt, PreviousInsurer, PreviousInsurerPolicyNumber, PreviousInsurerJoinDate, PreviousInsurerCancellationDate, PreviousInsurerCoverAmount, onboardingDataId)
  select op.PolicyDataId, od.MemberId, od.status, od.joinDate, case when MemberTypeId = 1 then 10 when MemberTypeId = 2 then 11 when MemberTypeId = 3 then 32 when MemberTypeId = 4 then 38 when MemberTypeId = 6 then 41 else MemberTypeId end, memberType, isBeneficiary, od.Premium, MemberTypeId, StatedBenefitId, statedBenefit, od.benefitName, od.CoverAmount, od.Premium, fileRow, exceptions, od.createdBy, od.createdAt, od.updatedBy, od.updatedAt, od.deletedAt , PreviousInsurer, left(trim(PreviousInsurerPolicyNumber), 50), PreviousInsurerJoinDate, PreviousInsurerCancellationDate, PreviousInsurerCoverAmount, od.id
  FROM onboarding.PolicyData pd
  JOIN onboarding.onboardingPolicies op (NOLOCK) 
      ON pd.PolicyDataId = op.PolicyDataId
  inner join onboarding.onboardingData od (nolock) on op.id = od.policyId 
  WHERE op.status = 'Approved'
  and pd.deletedAt is null
  and od.deletedAt is null
  and od.alsoMember =0
  and not exists(select * from onboarding.PolicyMember (nolock) where onboardingDataId = od.id)
  and op.id in ({policyId});

  update od
  set od.PolicyMemberId = m.PolicyMemberId
  from onboarding.onboardingData od
  inner join onboarding.PolicyMember m (nolock) on od.id = m.onboardingDataId
  where od.PolicyMemberId is null
  and od.policyId in ({policyId});
  """
        # logging.debug(f"Running qry: {qry1}")
        return utils.orm_query(conn, qry1)
    except Exception as e:
        logging.error(f"Error in addApprovalPolicy: {e}")

    return False


# @description: get policies from ServiceBusMessages table where Response Message is marked as Policy Created Successfully and mark them as completed
# @params: db connection
# @returns: list of policies
def update2complete_service_bus_messages(db_conn):
    try:
        s = (
            select(ServiceBusMessage)
            .with_hint(ServiceBusMessage, "WITH (NOLOCK)")
            .join(
                Policy,
                Policy.ReferenceNumber == ServiceBusMessage.RequestReferenceNumber,
            )
            .with_hint(Policy, "WITH (NOLOCK)")
            .where(
                Policy.status != "Complete",
                ServiceBusMessage.ResponseReferenceNumber != None,
                ServiceBusMessage.ResponseReferenceNumber != "N/A",
            )
            .with_only_columns(
                ServiceBusMessage.RequestReferenceNumber,
                Policy.id,
                Policy.createdBy,
                ServiceBusMessage.ResponseReferenceNumber,
            )
            .limit(100)
        )
        getMessages = db_conn.execute(s)
        getMessagesDetail = getMessages.mappings().all()
        # """
        # DEBUG:root:Policy not found: 03-202510-1015179
        # Onboarding Policy ID: 137288
        # """
        for message in getMessagesDetail:
            print(message)
            policyNo = message["ResponseReferenceNumber"]
            # policyNo = "03-202412-722201"
            getPolicy = utils.get_rma_api(
                f"/clc/api/Policy/Policy/GetPolicyByNumber/{policyNo}"
            )
            if not getPolicy:
                logging.debug(f"Policy not found: {policyNo}")
                onboardingPolicyId = get_onboarding_policy_id(
                    db_conn, message["RequestReferenceNumber"]
                )
                # print(f"Onboarding Policy ID not found: {onboardingPolicyId}")
                # exit()
                resetPolicy(
                    db_conn, onboardingPolicyId, message["RequestReferenceNumber"]
                )
                continue
            else:
                logging.debug(f"Policy found: {policyNo}")
                # continue
                if set_policy_complete(
                    db_conn, message["PolicyDataId"], message["ResponseReferenceNumber"]
                ):
                    logging.debug(f"Policy updated: {message}")
                # utils.sendEmailNotification(message["createdBy"], "RMA Client Connect - Policy Created", f"Policy {message["ResponseReferenceNumber"]} created on modernisation, https://clientconnect.randmutual.co.za/Policies/{message["PolicyDataId"]}", contentType="HTML")
    except Exception as e:
        logging.error(f"Error in get_service_bus_messages: {e}")
    return None


# @description: add entry to ServiceBusMessages table
# @params:db connection and policy id
# @returns: true if successful, false otherwise
def add_service_bus_message(db_conn, policy_id):
    try:
        # check is service bus message exists
        s = select(ServiceBusMessage).where(
            ServiceBusMessage.RequestReferenceNumber == policy_id
        )
        getMessages = db_conn.execute(s)
        getMessagesDetail = getMessages.mappings().all()
        if getMessagesDetail:
            return True

        stmt = insert(ServiceBusMessage).values(
            RequestReferenceNumber=policy_id,
        )
        db_conn.execute(stmt)
        db_conn.commit()
        return True
    except Exception as e:
        logging.error(f"Error in add_service_bus_message: {e}")
        db_conn.rollback()
    return False


# @description: set policy status to 'Complete'
# @params: policy id and db connection
# @returns: true if successful, false otherwise
def set_policy_complete(db_conn, policy_id, statusNote):
    try:
        stmt = (
            update(OnboardingPolicy)
            .where(OnboardingPolicy.id == policy_id)
            .values(
                status="Complete",
                StatusNote=f"Policy Created Successfully - {statusNote}",
            )
        )
        db_conn.execute(stmt)
        db_conn.commit()
        return True
    except Exception as e:
        logging.error(f"Error in set_policy_complete: {e}")
        db_conn.rollback()
    return False


# @description: get a list of members with no roleplayerid but id number and then check on rma api
# @params: db_conn
def process_member(member):
    logging.debug(f"Check row: {member}")
    getRolePlayerId = utils.get_rma_api(
        f"/clc/api/RolePlayer/RolePlayer/GetRolePlayerByIdNumber/{member['idNumber']}"
    )
    # logging.debug(f"Check res: {res}")
    rolePlayerId = 0
    if getRolePlayerId:
        rolePlayerId = getRolePlayerId[0]["rolePlayerId"]
    return rolePlayerId


def addRolePlayerId(db_conn):
    try:
        aliasPolicyCheck = aliased(PolicyCheck)
        s = (
            select(PolicyCheck)
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .join(onboardingData, onboardingData.policyId == PolicyCheck.policyId)
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingPolicy.id == onboardingData.policyId)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .distinct()
            .where(
                PolicyCheck.status == False,
                or_(
                    # PolicyCheck.checkDescr == "Too Much Cover RMA",
                    PolicyCheck.checkDescr == "Claim for RMA",
                    PolicyCheck.checkDescr == "Duplicate cover",
                ),
                onboardingPolicy.status == "Processing",
                onboardingData.rolePlayerId == None,
                onboardingData.alsoMember == False,
                onboardingPolicy.deletedAt == None,
                onboardingPolicy.deletedAt == None,
                # Policy.id==3678
            )
            .filter(
                ~exists().where(
                    aliasPolicyCheck.policyId == onboardingPolicy.id,
                    aliasPolicyCheck.checkDescr == "VOPD",
                    aliasPolicyCheck.status == False,
                )
            )
            .with_only_columns(PolicyCheck.policyId)
            .order_by(PolicyCheck.policyId.asc())
            .limit(20)
        )
        getPolicies = db_conn.execute(s)
        getPolicyResults = getPolicies.mappings().all()
        lastPolicyId = 0
        while getPolicyResults:
            lastPolicyId = getPolicyResults[-1]["policyId"]
            for policy in getPolicyResults:
                logging.debug(f"Check policy: {policy}")

                # get all members with no roleplayerid but id number
                s = (
                    onboardingData.__table__.select()
                    .with_hint(onboardingData, "WITH (NOLOCK)")
                    .where(
                        onboardingData.rolePlayerId == None,
                        onboardingData.alsoMember == False,
                        onboardingData.deletedAt == None,
                        onboardingData.policyId == policy["policyId"],
                        # onboardingData.idTypeId == 1
                    )
                    .with_only_columns(
                        onboardingData.idNumber,
                        onboardingData.id,
                        onboardingData.idTypeId,
                    )
                )
                getMembers = db_conn.execute(s)
                getMemberResults = getMembers.mappings().all()

                getMemberResultsWithId = []

                for member in getMemberResults:
                    if member["idTypeId"] != 1:
                        response = (
                            db_conn.query(onboardingData)
                            .filter_by(id=member["id"])
                            .one()
                        )
                        response.rolePlayerId = 0
                    else:
                        getMemberResultsWithId.append(member)

                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future_to_member = {
                        executor.submit(process_member, member): member
                        for member in getMemberResultsWithId
                    }
                    for future in concurrent.futures.as_completed(future_to_member):
                        member = future_to_member[future]
                        try:
                            rolePlayerId = future.result()
                            response = (
                                db_conn.query(onboardingData)
                                .filter_by(id=member["id"])
                                .one()
                            )
                            response.rolePlayerId = rolePlayerId
                        except Exception as exc:
                            logging.error(
                                f"Member {member['id']} generated an exception: {exc}"
                            )

                db_conn.commit()

            s = (
                select(PolicyCheck)
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .join(onboardingData, onboardingData.policyId == PolicyCheck.policyId)
                .with_hint(onboardingData, "WITH (NOLOCK)")
                .join(onboardingPolicy, onboardingPolicy.id == onboardingData.policyId)
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .distinct()
                .where(
                    PolicyCheck.status == False,
                    or_(
                        # PolicyCheck.checkDescr == "Too Much Cover RMA",
                        PolicyCheck.checkDescr == "Claim for RMA",
                        PolicyCheck.checkDescr == "Duplicate cover",
                    ),
                    onboardingPolicy.status == "Processing",
                    onboardingData.rolePlayerId == None,
                    onboardingData.alsoMember == False,
                    onboardingPolicy.deletedAt == None,
                    onboardingPolicy.deletedAt == None,
                    onboardingPolicy.id > lastPolicyId,
                )
                .filter(
                    ~exists().where(
                        aliasPolicyCheck.policyId == onboardingPolicy.id,
                        aliasPolicyCheck.checkDescr == "VOPD",
                        aliasPolicyCheck.status == False,
                    )
                )
                .with_only_columns(PolicyCheck.policyId)
                .order_by(PolicyCheck.policyId.asc())
                .limit(20)
            )
            getPolicies = db_conn.execute(s)
            getPolicyResults = getPolicies.mappings().all()
    except Exception as error:
        logging.error(f"Error: {error}")
        db_conn.rollback()


# @description: claim and duplicate check
def duplicateCoverPerMember(rolePlayerId, parentPolicyId, policyInceptionDate) -> str:
    policyNumbers = ""
    try:
        logging.debug(f"Check member: {rolePlayerId}")

        # get all policies for member from rma api /clc/api/Policy/Policy/GetPoliciesByRolePlayer/:rolePlayerId
        getPolicies = utils.get_rma_api(
            f"/clc/api/Policy/Policy/GetPoliciesByRolePlayer/{rolePlayerId}"
        )

        logging.debug(f"RMA policies: {getPolicies}")

        if getPolicies:
            memberPolicies = []
            for pol in getPolicies:
                # check member object for "policyInsuredLives"
                if "policyInsuredLives" not in pol:
                    continue

                if pol["policyStatus"] != 1:
                    continue

                if pol["parentPolicyId"] != parentPolicyId:
                    continue

                for mem in pol["policyInsuredLives"]:
                    logging.debug(f"Check mem: {mem}")

                    if (
                        rolePlayerId == mem["rolePlayerId"]
                        and mem["insuredLifeStatus"] == 1
                        and mem["rolePlayerTypeId"] == 10
                    ):
                        # inceptionDate = datetime.datetime.strptime(
                        #     mem["policyInceptionDate"], "%Y-%m-%dT%H:%M:%S"
                        # ).date()

                        # sa_timezone = pytz.timezone("Africa/Johannesburg")
                        # sa_inception_date = policyInceptionDate.astimezone(
                        #     sa_timezone
                        # ).date()

                        # if inceptionDate < (
                        #     sa_inception_date - datetime.timedelta(days=180)
                        # ):
                        # continue

                        policyNumbers += f"{pol['policyNumber']},"

        return policyNumbers

    except Exception as error:
        logging.error(f"Error 2: {error}")
    return ""


# @description: get a list of members with no roleplayerid but id number and then check on rma api
# @params: db_conn
def finalCheckDuplicate(db_conn, policyId):
    result = False
    try:
        s = (
            select(onboardingData)
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingPolicy.id == onboardingData.policyId)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .distinct()
            .where(
                onboardingPolicy.status.in_(["Submitted", "Approved"]),
                onboardingData.alsoMember == False,
                onboardingPolicy.deletedAt == None,
                onboardingPolicy.deletedAt == None,
                onboardingData.memberTypeId == 1,
                onboardingPolicy.allowDuplicate == False,
                onboardingPolicy.id == policyId,
            )
            .with_only_columns(
                onboardingData.idNumber,
                onboardingData.id,
                onboardingData.exceptions,
                onboardingData.policyId,
                onboardingData.rolePlayerId,
                onboardingData.memberTypeId,
                onboardingPolicy.parentPolicyId,
                onboardingData.status,
                onboardingPolicy.PolicyInceptionDate,
            )
            .order_by(onboardingData.id.asc())
            .limit(20)
        )
        getPolicies = db_conn.execute(s)
        getPolicyResults = getPolicies.mappings().all()
        if getPolicyResults:
            for policy in getPolicyResults:
                logging.debug(f"Check policy: {policy}")
                policyNumbers = ""
                exceptions = []
                if policy["exceptions"]:
                    exceptions = json.loads(policy["exceptions"])

                if not exceptions:
                    exceptions = []

                # logging.debug(f"Check res: {res}")
                rolePlayerId = policy["rolePlayerId"] if policy["rolePlayerId"] else 0

                if rolePlayerId == 0:
                    getRolePlayerId = utils.get_rma_api(
                        f"/clc/api/RolePlayer/RolePlayer/GetRolePlayerByIdNumber/{policy['idNumber']}"
                    )
                    if getRolePlayerId:
                        rolePlayerId = getRolePlayerId[0]["rolePlayerId"]

                if rolePlayerId > 0:
                    policyNumbers = duplicateCoverPerMember(
                        rolePlayerId,
                        policy["parentPolicyId"],
                        policy["PolicyInceptionDate"],
                    )

                if policyNumbers != "":

                    policyNumbers = policyNumbers[:-1]

                    exceptions = utils.addExceptionsExistingValues(
                        exceptions,
                        "coverAmount",
                        f"Duplicate cover - {policyNumbers}",
                    )

                response = (
                    db_conn.query(onboardingData).filter_by(id=policy["id"]).one()
                )

                response.exceptions = json.dumps(exceptions) if exceptions else "[]"
                response.status = "Error" if exceptions else policy["status"]
                response.rolePlayerId = rolePlayerId

                policyUpdate = (
                    db_conn.query(onboardingPolicy)
                    .filter_by(id=policy["policyId"])
                    .one()
                )
                policyUpdate.status = "Duplicate" if exceptions else policyUpdate.status
                policyUpdate.statusNote = (
                    "Possible Duplicate Cover on Modernisation"
                    if exceptions
                    else policyUpdate.statusNote
                )

                if exceptions:
                    result = True

                db_conn.commit()

        return result
    except Exception as error:
        logging.error(f"Error: {error}")
        db_conn.rollback()
    return result


def process_member_checks(member, policy):
    """Process checks for a single member"""
    try:
        logging.debug(f"Check member: {member}")
        logging.debug(f"Policy: {policy}")

        exceptions = []
        if member["exceptions"]:
            exceptions = json.loads(member["exceptions"])

        if not exceptions:
            exceptions = []

        existingClaim = False
        existingPolicy = False
        policyNumbers = ""
        rolePlayerId = member["rolePlayerId"]

        # Get all policies for member
        getPolicies = utils.get_rma_api(
            f"/clc/api/Policy/Policy/GetPoliciesByRolePlayer/{rolePlayerId}"
        )

        if getPolicies:
            memberPolicies = []
            for pol in getPolicies:
                if "policyInsuredLives" not in pol:
                    continue

                for mem in pol["policyInsuredLives"]:
                    if rolePlayerId == mem["rolePlayerId"]:
                        currentObj = {
                            "idNumber": member["idNumber"],
                            "rolePlayerId": rolePlayerId,
                            "memberId": member["id"],
                            "policyId": pol["policyId"],
                            "policyNumber": pol["policyNumber"],
                            "policyStatus": pol["policyStatus"],
                            "parentPolicyId": pol["parentPolicyId"],
                            "brokerageId": pol["brokerageId"],
                            "representativeId": pol["representativeId"],
                            "insuredLifeStatus": mem["insuredLifeStatus"],
                            "statedBenefitId": mem["statedBenefitId"],
                            "memberTypeId": utils.returnMemberTypeFromRolePlayer(
                                mem["rolePlayerTypeId"]
                            ),
                            "policyInceptionDate": pol["policyInceptionDate"],
                        }
                        memberPolicies.append(currentObj)

            for memberPolicy in memberPolicies:
                if memberPolicy["policyStatus"] == 1:
                    # Check claims
                    getClaim = utils.get_rma_api(
                        f"/clm/api/Claim/GetClaimsByPolicyId/{memberPolicy['policyId']}"
                    )
                    if getClaim:
                        for claim in getClaim:
                            getClaimInfo = utils.get_rma_api(
                                f"/clm/api/Claim/GetClaimAndEventByClaimId/{claim['claimId']}"
                            )
                            if rolePlayerId == getClaimInfo["insuredLifeId"]:
                                existingClaim = True
                                break

                    # Check duplicate policy
                    # convert to date for example "policyInceptionDate": "2023-05-01T00:00:00" becomes "2023-05-01"
                    inceptionDate = datetime.datetime.strptime(
                        memberPolicy["policyInceptionDate"], "%Y-%m-%dT%H:%M:%S"
                    ).date()

                    # get the new policy inception date
                    # sa_timezone = pytz.timezone("Africa/Johannesburg")
                    # newPolicy_inception_date = (
                    #     policy["PolicyInceptionDate"].astimezone(sa_timezone).date()
                    # )
                    newPolicy_inception_date = policy["PolicyInceptionDate"]

                    # print(f"New Policy Inception Date: {newPolicy_inception_date}")
                    # print(f"Old Inception Date: {inceptionDate}")
                    # print(
                    #     inceptionDate
                    #     < (newPolicy_inception_date - datetime.timedelta(days=180))
                    # )
                    # exit()

                    if (
                        memberPolicy["memberTypeId"] == 1
                        and not policy["allowDuplicate"]
                        and memberPolicy["parentPolicyId"] == policy["parentPolicyId"]
                        and member["memberType"] == "Main Member"
                    ):
                        # check if policy is a duplicate
                        # if inceptionDate is 6 month or older before inception date of policy then skip
                        if inceptionDate < (
                            newPolicy_inception_date - datetime.timedelta(days=180)
                        ):
                            continue
                        policyNumbers += f"{memberPolicy['policyNumber']},"
                        existingPolicy = True

        # Build exceptions
        if existingClaim:
            exceptions = utils.addExceptionsExistingValues(
                exceptions, "coverAmount", "Existing Claim"
            )

        if member["memberType"] == "Main Member" and existingPolicy:
            policyNumbers = policyNumbers[:-1]
            exceptions = utils.addExceptionsExistingValues(
                exceptions,
                "coverAmount",
                f"Duplicate cover - {policyNumbers}",
            )

        return {
            "memberId": member["id"],
            "exceptions": exceptions,
            "hasExistingClaim": existingClaim,
            "hasExistingPolicy": existingPolicy,
        }

    except Exception as e:
        logging.error(f"Error processing member {member['id']}: {str(e)}")
        exit()
        return None


def process_members_concurrent(db_conn, getMemberResults, policy):
    """Process multiple members concurrently"""
    results = []
    policyExistingClaim = False
    policyExistingPolicy = False

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_member = {
            executor.submit(process_member_checks, member, policy): member
            for member in getMemberResults
        }

        for future in concurrent.futures.as_completed(future_to_member):
            result = future.result()
            if result:
                results.append(result)

                # Update member exceptions
                response = (
                    db_conn.query(onboardingData).filter_by(id=result["memberId"]).one()
                )
                response.exceptions = json.dumps(result["exceptions"])
                response.status = "Error" if result["exceptions"] else response.status

                # Track policy level flags
                if result["hasExistingClaim"]:
                    policyExistingClaim = True
                if result["hasExistingPolicy"]:
                    policyExistingPolicy = True

    # Update policy status if needed
    if policyExistingClaim or policyExistingPolicy:
        policyUpdate = (
            db_conn.query(onboardingPolicy).filter_by(id=policy["policyId"]).one()
        )
        if policyExistingClaim:
            policyUpdate.status = "Error"
            policyUpdate.statusNote = "Existing claim"
        elif policyExistingPolicy:
            policyUpdate.status = "Duplicate"
            policyUpdate.statusNote = "Possible Duplicate Cover on Modernisation"

    db_conn.commit()

    return results


def externalChecksPerMember(db_conn):
    batch_id = 0
    try:
        aliasPolicyCheck = aliased(PolicyCheck)
        s = (
            select(PolicyCheck)
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .distinct()
            .where(
                PolicyCheck.status == False,
                or_(
                    PolicyCheck.checkDescr == "Claim for RMA",
                    PolicyCheck.checkDescr == "Duplicate cover",
                ),
                onboardingPolicy.deletedAt == None,
                onboardingPolicy.status == "Processing",
                # onboardingPolicy.id == 44955,
            )
            .filter(
                ~exists().where(
                    aliasPolicyCheck.policyId == onboardingPolicy.id,
                    aliasPolicyCheck.checkDescr == "VOPD",
                    aliasPolicyCheck.status == False,
                )
            )
            .with_only_columns(
                PolicyCheck.policyId,
                onboardingPolicy.parentPolicyId,
                onboardingPolicy.allowDuplicate,
                onboardingPolicy.PolicyInceptionDate,
            )
            .order_by(PolicyCheck.policyId.asc())
            .limit(20)
        )
        getPolicies = db_conn.execute(s)
        getPolicyResults = getPolicies.mappings().all()
        lastPolicyId = 0
        while getPolicyResults:
            lastPolicyId = getPolicyResults[-1]["policyId"]
            for policy in getPolicyResults:
                logging.debug(f"Check policy duplicate: {policy}")
                if "allowDuplicate" not in policy:
                    continue

                policyExistingClaim = False
                policyExistingPolicy = False

                # get all members with roleplayerid > 0
                s = (
                    onboardingData.__table__.select()
                    .with_hint(onboardingData, "WITH (NOLOCK)")
                    .where(
                        onboardingData.rolePlayerId > 0,
                        onboardingData.policyId == policy["policyId"],
                        onboardingData.memberType != "Beneficiary",
                        onboardingData.deletedAt == None,
                        onboardingData.alsoMember == False,
                    )
                    .with_only_columns(
                        onboardingData.idNumber,
                        onboardingData.id,
                        onboardingData.exceptions,
                        onboardingData.policyId,
                        onboardingData.rolePlayerId,
                        onboardingData.memberType,
                    )
                )

                getMembers = db_conn.execute(s)
                getMemberResults = getMembers.mappings().all()

                if getMemberResults:
                    results = process_members_concurrent(
                        db_conn, getMemberResults, policy
                    )
                    logging.debug(f"Processed {len(results)} members")

                # confirm policy check completion

                # print(policy)
                s = (
                    update(PolicyCheck)
                    .where(
                        PolicyCheck.policyId == policy["policyId"],
                        PolicyCheck.status == False,
                        PolicyCheck.checkDescr == "Claim for RMA",
                    )
                    .values(status=True)
                )
                db_conn.execute(s)
                s = (
                    update(PolicyCheck)
                    .where(
                        PolicyCheck.policyId == policy["policyId"],
                        PolicyCheck.status == False,
                        PolicyCheck.checkDescr == "Duplicate cover",
                    )
                    .values(status=True)
                )
                db_conn.execute(s)

                db_conn.commit()
            # exit()

            aliasPolicyCheck = aliased(PolicyCheck)
            s = (
                PolicyCheck.__table__.select()
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .distinct()
                .where(
                    PolicyCheck.status == False,
                    or_(
                        PolicyCheck.checkDescr == "Claim for RMA",
                        PolicyCheck.checkDescr == "Duplicate cover",
                    ),
                    onboardingPolicy.status == "Processing",
                    onboardingPolicy.deletedAt == None,
                    # onboardingPolicy.id == 58329,
                    onboardingPolicy.id > lastPolicyId,
                )
                .filter(
                    ~exists().where(
                        aliasPolicyCheck.policyId == onboardingPolicy.id,
                        aliasPolicyCheck.checkDescr == "VOPD",
                        aliasPolicyCheck.status == False,
                    )
                )
                .with_only_columns(
                    PolicyCheck.policyId,
                    onboardingPolicy.parentPolicyId,
                    onboardingPolicy.allowDuplicate,
                    onboardingPolicy.PolicyInceptionDate,
                )
                .order_by(PolicyCheck.policyId.asc())
                .limit(20)
            )
            getPolicies = db_conn.execute(s)
            getPolicyResults = getPolicies.mappings().all()
            # getPolicyResults = []

    except Exception as error:
        logging.error(f"Error: {error}")
        db_conn.rollback()

    return batch_id


def externalChecksPerMemberCoverAmount(db_conn):
    batch_id = 0
    try:
        aliasPolicyCheck = aliased(PolicyCheck)
        s = (
            PolicyCheck.__table__.select()
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .distinct()
            .where(
                PolicyCheck.status == False,
                PolicyCheck.checkDescr == "Too Much Cover RMA",
                onboardingPolicy.status == "Processing",
            )
            .filter(
                exists().where(
                    aliasPolicyCheck.policyId == onboardingPolicy.id,
                    aliasPolicyCheck.checkDescr == "Benefit Allocation",
                    aliasPolicyCheck.status == True,
                )
            )
            .with_only_columns(PolicyCheck.policyId)
            .order_by(PolicyCheck.policyId.asc())
            .limit(1000)
        )

        getPolicies = db_conn.execute(s)
        getPolicyResults = getPolicies.mappings().all()
        lastPolicyId = 0
        i = 0
        while getPolicyResults:
            i += 1
            lastPolicyId = getPolicyResults[-1]["policyId"]
            for policy in getPolicyResults:
                logging.debug(f"Check policy: {policy}")

                policyCoverAmount = False

                # get all members with roleplayerid > 0
                s = (
                    onboardingData.__table__.select()
                    .with_hint(onboardingData, "WITH (NOLOCK)")
                    .where(
                        onboardingData.rolePlayerId > 0,
                        onboardingData.policyId == policy["policyId"],
                        onboardingData.memberType != "Beneficiary",
                    )
                    .with_only_columns(
                        onboardingData.idNumber,
                        onboardingData.id,
                        onboardingData.exceptions,
                        onboardingData.policyId,
                        onboardingData.rolePlayerId,
                        onboardingData.memberType,
                        onboardingData.statedBenefitId,
                        onboardingData.coverAmount,
                    )
                )

                getMembers = db_conn.execute(s)
                getMemberResults = getMembers.mappings().all()

                for member in getMemberResults:
                    logging.debug(f"Check row: {member}")
                    exceptions = []
                    if member["exceptions"]:
                        exceptions = json.loads(member["exceptions"])

                    if not exceptions:
                        exceptions = []

                    totalCoverAmount = 0

                    getBenefit = utils.get_rma_api(
                        f"/clc/api/Product/Benefit/{member['statedBenefitId']}"
                    )

                    if getBenefit:
                        totalCoverAmount += getBenefit["benefitRates"][0][
                            "benefitAmount"
                        ]

                    policyCoverAmount = False

                    rolePlayerId = member["rolePlayerId"]

                    # get all policies for member from rma api /clc/api/Policy/Policy/GetPoliciesByRolePlayer/:rolePlayerId
                    getPolicies = utils.get_rma_api(
                        f"/clc/api/Policy/Policy/GetPoliciesByRolePlayer/{rolePlayerId}"
                    )

                    logging.debug(f"Check policy: {getPolicies}")

                    if getPolicies:

                        memberPolicies = []
                        for pol in getPolicies:
                            currentObj = {}
                            # check member object for "policyInsuredLives"
                            if "policyInsuredLives" not in pol:
                                continue

                            for mem in pol["policyInsuredLives"]:
                                if rolePlayerId == mem["rolePlayerId"]:
                                    currentObj = {
                                        "idNumber": member["idNumber"],
                                        "rolePlayerId": rolePlayerId,
                                        "memberId": member["id"],
                                        "policyId": pol["policyId"],
                                        "policyStatus": pol["policyStatus"],
                                        "parentPolicyId": pol["parentPolicyId"],
                                        "brokerageId": pol["brokerageId"],
                                        "representativeId": pol["representativeId"],
                                        "insuredLifeStatus": mem["insuredLifeStatus"],
                                        "statedBenefitId": mem["statedBenefitId"],
                                        "coverMemberTypeId": utils.returnMemberTypeFromRolePlayer(
                                            mem["rolePlayerTypeId"]
                                        ),
                                    }
                                    memberPolicies.append(currentObj)

                        for memberPolicy in memberPolicies:
                            logging.debug(f"Check memberPolicy: {memberPolicy}")

                            if memberPolicy["policyStatus"] == 1:
                                # check cover amount
                                # get cover amount for statedBenefitId using rma api clc/api/Product/Benefit/:id
                                if (
                                    memberPolicy["statedBenefitId"]
                                    and memberPolicy["insuredLifeStatus"] == 1
                                ):
                                    getBenefit = utils.get_rma_api(
                                        f"/clc/api/Product/Benefit/{memberPolicy['statedBenefitId']}"
                                    )

                                    if getBenefit:
                                        totalCoverAmount += getBenefit["benefitRates"][
                                            0
                                        ]["benefitAmount"]

                    if totalCoverAmount >= 104000:
                        logging.debug(f"Check totalCoverAmount: {totalCoverAmount}")
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "CoverAmount",
                            "Too much cover is being processed for this member",
                        )

                        policyCoverAmount = True

                    if exceptions:
                        s = (
                            update(onboardingData)
                            .where(onboardingData.id == member["id"])
                            .values(exceptions=json.dumps(exceptions), status="Error")
                        )
                        db_conn.execute(s)

                if policyCoverAmount:
                    s = (
                        update(onboardingPolicy)
                        .where(onboardingPolicy.id == policy["policyId"])
                        .values(status="Error", statusNote="Too much cover")
                    )
                    db_conn.execute(s)

                # confirm policy check completion
                s = (
                    update(PolicyCheck)
                    .where(
                        PolicyCheck.policyId == policy["policyId"],
                        PolicyCheck.status == False,
                        PolicyCheck.checkDescr == "Too Much Cover RMA",
                    )
                    .values(status=True)
                )
                db_conn.execute(s)

                db_conn.commit()

            aliasPolicyCheck = aliased(PolicyCheck)
            s = (
                PolicyCheck.__table__.select()
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .distinct()
                .where(
                    PolicyCheck.status == False,
                    PolicyCheck.checkDescr == "Too Much Cover RMA",
                    onboardingPolicy.status == "Processing",
                    onboardingPolicy.id > lastPolicyId,
                )
                .filter(
                    exists().where(
                        aliasPolicyCheck.policyId == onboardingPolicy.id,
                        aliasPolicyCheck.checkDescr == "Benefit Allocation",
                        aliasPolicyCheck.status == True,
                    )
                )
                .with_only_columns(PolicyCheck.policyId)
                .order_by(PolicyCheck.policyId.asc())
                .limit(1000)
            )
            getPolicies = db_conn.execute(s)
            getPolicyResults = getPolicies.mappings().all()
    except Exception as error:
        logging.error(f"Error: {error}")
        db_conn.rollback()

    return batch_id


# @description: check if any policyId from polic exists in PolicyCheck table with the checks for vopd, too much cover, too much cover rma and claim for rma, if not add policyId to PolicyCheck table with the checks, status on Policy should be processing
# @params: db_conn
def checkPolicyFlag(db_conn):
    policyCheckScript = """with cte as (
select distinct op.fileId
from onboarding.onboardingPolicies op (nolock)
where op.status = 'Processing'
and op.deletedAt is null
and not exists(select * from onboarding.policy_checks (nolock) where policyId = op.id)
)
update f
set documents = null
from onboarding.Files f 
inner join cte as b on f.id = b.fileId;

with cte as (
select distinct op.id
from onboarding.onboardingPolicies op (nolock)
where op.status = 'Processing'
and op.deletedAt is null
and not exists(select * from onboarding.policy_checks (nolock) where policyId = op.id)
)
update od
set exceptions = '[]', status = 'New'
from onboarding.onboardingData od 
inner join cte as b on od.policyId = b.id;

with cte as (
select distinct op.id, op.fileId, op.allowDuplicate
from onboarding.onboardingPolicies op (nolock)
where op.status = 'Processing'
and op.deletedAt is null
and not exists(select * from onboarding.policy_checks (nolock) where policyId = op.id)
)
insert into onboarding.policy_checks (policyId, checkDescr, status, createdAt, updatedAt)
select distinct id, 'VOPD' as checkDescr, 0 as status, current_timestamp, current_timestamp from cte
union
select distinct id, 'Claim for RMA' as checkDescr, 0 as status, current_timestamp, current_timestamp from cte 
union
select distinct id, 'Benefit Allocation' as checkDescr, 0 as status, current_timestamp, current_timestamp from cte
union
select distinct id, 'Duplicate cover' as checkDescr, 0 as status, current_timestamp, current_timestamp from cte where allowDuplicate = 0
union
select distinct id, 'Duplicate loaded' as checkDescr, 0 as status, current_timestamp, current_timestamp from cte where allowDuplicate = 0;"""
    try:
        # get all policyIds with policiy members where policy in processing status
        utils.orm_query(db_conn, policyCheckScript)
    except Exception as error:
        logging.error(error)


# @description: check if all members with valid ID number has been updated for VOPD and set policycheck for VOPD to true
# @params: db_conn
def checkVOPD(db_conn):
    batch_id = 0
    try:
        # get all policyIds with the check for VOPD
        mainQ = (
            select(onboardingPolicy)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .join(PolicyCheck, onboardingPolicy.id == PolicyCheck.policyId)
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .where(
                onboardingPolicy.status == "Processing",
                PolicyCheck.checkDescr == "VOPD",
                PolicyCheck.status == False,
            )
            .with_only_columns(onboardingPolicy.id)
            .order_by(onboardingPolicy.id.asc())
            .limit(100)
        )
        policies = db_conn.execute(mainQ)
        # logging.debug(result.mappings().all())

        policyResults = policies.mappings().all()
        lastPolicyId = 0
        while policyResults:
            lastPolicyId = policyResults[-1]["id"]

            # check each policy and there members
            for policy in policyResults:
                logging.debug(f"Check policy: {policy}")

                # get all members with valid ID number
                s = (
                    select(onboardingData)
                    .with_hint(onboardingData, "WITH (NOLOCK)")
                    .outerjoin(
                        AstuteResponse,
                        onboardingData.idNumber == AstuteResponse.idNumber,
                    )
                    .with_hint(AstuteResponse, "WITH (NOLOCK)")
                    .where(
                        onboardingData.policyId == policy["id"],
                        onboardingData.idTypeId == 1,
                        onboardingData.alsoMember == False,
                        onboardingData.deletedAt == None,
                    )
                    .with_only_columns(
                        onboardingData.idNumber,
                        onboardingData.id,
                        onboardingData.vopdVerified,
                        onboardingData.policyId,
                        AstuteResponse.status,
                        AstuteResponse.updatedAt,
                    )
                )
                getMembers = db_conn.execute(s)

                getMemberResults = getMembers.mappings().all()

                vopdComplete = True
                if not getMemberResults:
                    logging.debug(f"No members with idType 1")
                    s = (
                        update(PolicyCheck)
                        .where(
                            PolicyCheck.policyId == policy["id"],
                            PolicyCheck.checkDescr == "VOPD",
                        )
                        .values(status=True)
                    )
                    db_conn.execute(s)
                    # db_conn.commit()
                    continue

                for member in getMemberResults:
                    logging.debug(f"Check member: {member}")

                    if not member["vopdVerified"] and member["status"] not in [
                        "submitted" "pending",
                    ]:
                        vopdComplete = False
                        addVOPD(db_conn, member["idNumber"])
                    elif (
                        not member["vopdVerified"]
                        and member["status"] == "submitted"
                        and member["updatedAt"]
                        < datetime.now() - datetime.timedelta(days=2)
                    ):
                        vopdComplete = False
                        addVOPD(db_conn, member["idNumber"])
                    elif not member["vopdVerified"]:
                        vopdComplete = False

                if vopdComplete:
                    s = (
                        update(PolicyCheck)
                        .where(
                            PolicyCheck.policyId == policy["id"],
                            PolicyCheck.checkDescr == "VOPD",
                        )
                        .values(status=True)
                    )
                    db_conn.execute(s)

            db_conn.commit()

            # get all policyIds with the check for VOPD
            mainQ = (
                select(onboardingPolicy)
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .join(PolicyCheck, onboardingPolicy.id == PolicyCheck.policyId)
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .where(
                    onboardingPolicy.status == "Processing",
                    PolicyCheck.checkDescr == "VOPD",
                    PolicyCheck.status == False,
                    onboardingPolicy.id > lastPolicyId,
                )
                .with_only_columns(onboardingPolicy.id)
                .order_by(onboardingPolicy.id.asc())
                .limit(20)
            )
            policies = db_conn.execute(mainQ)
            # logging.debug(result.mappings().all())

            policyResults = policies.mappings().all()

    except Exception as error:
        logging.error(error)


# @description: set policy status to ready once all checks are completed
# @params: db_conn
def setPolicyReady(db_conn):
    batch_id = 0
    try:
        # check for errors
        qry = "update pd set pd.status = 'Error', pd.statusNote = 'Issue on Policy' from onboarding.onboardingData pm  inner join onboarding.onboardingPolicies pd on pm.policyId = pd.id where pm.status = 'Error' and pd.status not in ('Complete','Error','Rejected','Duplicate','Removed') and pd.deletedAt is null;"

        utils.orm_query(db_conn, qry)

        aliasPolicyCheck = aliased(PolicyCheck)
        # get all policyIds with policiy members where policy in processing status
        s = (
            select(onboardingPolicy)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .join(PolicyCheck, PolicyCheck.policyId == onboardingPolicy.id)
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .where(
                onboardingPolicy.status == "Processing",
                PolicyCheck.status == True,
                onboardingPolicy.deletedAt == None,
            )
            .filter(
                ~exists().where(
                    aliasPolicyCheck.policyId == onboardingPolicy.id,
                    aliasPolicyCheck.status == False,
                )
            )
            .with_only_columns(onboardingPolicy.id)
            .order_by(onboardingPolicy.id.asc())
            .limit(25)
        )

        result = db_conn.execute(s)
        rows = result.mappings().all()
        while rows:
            # check if policyId exists in PolicyCheck table
            for row in rows:
                # if policyId does not exist in PolicyCheck table, add policyId to PolicyCheck table with the checks
                logging.debug(f"Check row: {row}")

                # set Policy status to ready
                s = (
                    update(onboardingPolicy).where(onboardingPolicy.id == row["id"])
                    # removed Ready
                    .values(status="Submitted", statusNote="Ready for approval")
                )
                db_conn.execute(s)
            db_conn.commit()

            lastPolicyId = rows[-1]["id"]

            s = (
                select(onboardingPolicy)
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .join(PolicyCheck, PolicyCheck.policyId == onboardingPolicy.id)
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .where(
                    onboardingPolicy.status == "Processing",
                    PolicyCheck.status == True,
                    onboardingPolicy.deletedAt == None,
                    onboardingPolicy.id > lastPolicyId,
                )
                .filter(
                    ~exists().where(
                        aliasPolicyCheck.policyId == onboardingPolicy.id,
                        aliasPolicyCheck.status == False,
                    )
                )
                .with_only_columns(onboardingPolicy.id)
                .order_by(onboardingPolicy.id.asc())
                .limit(25)
            )

            result = db_conn.execute(s)
            rows = result.mappings().all()

    except Exception as error:
        logging.error(error)


# @description get  total coverAmount for a specific id number
# @params: db_conn, idNumber
def getCoverAmount(db_conn, idNumber):
    try:
        s = (
            PolicyMember.__table__.select()
            .join(Member, Member.id == PolicyMember.memberId)
            .where(Member.idNumber == idNumber)
            .with_only_columns(PolicyMember.CoverAmount)
        )
        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        logging.debug(f"Check {len(resultSet)}")
        totalCoverAmount = 0
        for res in resultSet:
            logging.debug(f"Check res: {res}")
            if res["CoverAmount"]:
                totalCoverAmount = totalCoverAmount + res["CoverAmount"]

        return totalCoverAmount
    except Exception as error:
        logging.error(error)


# function ro return object
def fmt_obj(field, error):
    # field = field.replace("_", " ").title()
    return {
        "field": field,
        "message": error,
    }


# @description: check cover level of policies on processing status and add exception to policy member should cover level be more than 104000
# @params: db_conn
def internalCheckCover(db_conn):
    batch_id = 0
    try:
        aliasPolicyCheck = aliased(PolicyCheck)
        s = (
            PolicyCheck.__table__.select()
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .distinct()
            .join(Policy, Policy.id == PolicyCheck.policyId)
            .with_hint(Policy, "WITH (NOLOCK)")
            .where(
                PolicyCheck.checkDescr == "Too Much Cover",
                PolicyCheck.status == False,
                Policy.status == "Processing",
            )
            .filter(
                exists().where(
                    aliasPolicyCheck.policyId == Policy.id,
                    aliasPolicyCheck.checkDescr == "Benefit Allocation",
                    aliasPolicyCheck.status == True,
                )
            )
            .with_only_columns(PolicyCheck.policyId)
            .limit(100)
            .order_by(PolicyCheck.policyId.asc())
        )

        result = db_conn.execute(s)
        policyList = result.mappings().all()
        while policyList:
            for row in policyList:
                if batch_id == 0:
                    batch_id = 1
                logging.debug(f"Check row: {row}")
                # get all policyIds with policiy members where policy in processing status and their member ID numbers, exclude member type beneficiary
                s = (
                    Policy.__table__.select()
                    .with_hint(Policy, "WITH (NOLOCK)")
                    .join(PolicyMember, PolicyMember.policyId == Policy.id)
                    .with_hint(PolicyMember, "WITH (NOLOCK)")
                    .join(Member, Member.id == PolicyMember.memberId)
                    .with_hint(Member, "WITH (NOLOCK)")
                    .where(
                        Policy.id == row["policyId"],
                        Policy.status == "Processing",
                        PolicyMember.memberType != "Beneficiary",
                    )
                    .with_only_columns(
                        Policy.id,
                        Member.idNumber,
                        PolicyMember.memberId,
                        PolicyMember.exceptions,
                        PolicyMember.statedBenefitId,
                        PolicyMember.CoverAmount,
                    )
                )
                resultExe = db_conn.execute(s)
                resultSet = resultExe.mappings().all()
                # logging.debug(f"Check {len(resultSet)}")
                totalCoverAmount = 0
                for res in resultSet:
                    totalCoverAmount = 0
                    # logging.debug(f"Check res: {res}")
                    exceptions = []
                    if res["exceptions"]:
                        exceptions = json.loads(res["exceptions"])
                    logging.debug(
                        f"Check exceptions: {exceptions} exception_type {type(exceptions)}"
                    )
                    logging.debug(f"Check res: {res}")
                    # get total coverAmount for a specific id number
                    totalCoverAmount = getCoverAmount(db_conn, res["IdNumber"])
                    logging.debug(f"Check totalCoverAmount: {totalCoverAmount}")
                    # if total coverAmount is more than 104000, add exception to policy member
                    if totalCoverAmount > 104000:
                        exceptions = utils.addExceptionsExistingValues(
                            exceptions,
                            "CoverAmount",
                            "Too much cover is being processed for this member",
                        )
                        logging.debug(f"Check exceptions: {exceptions}")
                        s = (
                            update(PolicyMember)
                            .where(
                                PolicyMember.policyId == res["PolicyDataId"],
                                PolicyMember.memberId == res["InsuredMemberId"],
                                PolicyMember.memberType != "Beneficiary",
                            )
                            .values(exceptions=json.dumps(exceptions), status="Error")
                        )
                        db_conn.execute(s)

                s = (
                    update(PolicyCheck)
                    .where(
                        PolicyCheck.policyId == row["policyId"],
                        PolicyCheck.checkDescr == "Too Much Cover",
                    )
                    .values(status=True)
                )
                db_conn.execute(s)
                db_conn.commit()

            lastRecord = policyList[-1]
            s = (
                PolicyCheck.__table__.select()
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .join(Policy, Policy.id == PolicyCheck.policyId)
                .with_hint(Policy, "WITH (NOLOCK)")
                .where(
                    PolicyCheck.checkDescr == "Too Much Cover",
                    PolicyCheck.status == False,
                    Policy.status == "Processing",
                    Policy.id > lastRecord["policyId"],
                )
                .filter(
                    exists().where(
                        aliasPolicyCheck.policyId == Policy.id,
                        aliasPolicyCheck.checkDescr == "Benefit Allocation",
                        aliasPolicyCheck.status == True,
                    )
                )
                .with_only_columns(PolicyCheck.policyId)
                .limit(100)
                .order_by(PolicyCheck.policyId.asc())
            )

            result = db_conn.execute(s)
            policyList = result.mappings().all()
    except Exception as error:
        logging.error(error)
    return batch_id


# @description: check duplicates on passport number
def internalCheckPassport(db_conn):
    qry = """with cte as (
select od.policyId, od.firstName, od.surname, od.dateOfBirth, op.status, min(od.id) as id
from onboarding.onboardingData od (nolock)
inner join onboarding.onboardingPolicies op (nolock) on od.policyId = op.id and op.deletedAt is null
where od.idTypeId <> 1 
and od.deletedAt is null
and od.alsoMember = 0
and op.status in ('Processing', 'Draft')
group by od.policyId, od.firstName, od.surname, od.dateOfBirth, op.status
having count(distinct od.id) > 1
)
select distinct od.policyId, od.id, od.exceptions, od.status 
from  onboarding.onboardingData od (nolock)
inner join cte as b on od.policyId = b.policyId and od.firstName = b.firstName and od.surname = b.surname and od.dateOfBirth = b.dateOfBirth 
where od.deletedAt is null
and od.alsoMember = 0
and b.id < od.id"""

    try:
        # result = utils.orm_select(db_conn, qry)
        policyDuplicates = utils.orm_select(db_conn, qry)

        for res in policyDuplicates:
            logging.debug(f"Check res: {res}")
            exceptions = []
            if res["exceptions"]:
                exceptions = json.loads(res["exceptions"])
            # logging.debug(
            #     f"Check exceptions: {exceptions} exception_type {type(exceptions)}"
            # )

            exceptions = utils.addExceptionsExistingValues(
                exceptions,
                "IdNumber",
                f"Possible duplicate for member on Client Connect",
            )
            logging.debug(f"Check exceptions: {exceptions}")
            s = (
                update(onboardingData)
                .where(
                    onboardingData.policyId == res["policyId"],
                    onboardingData.id == res["id"],
                )
                .values(exceptions=json.dumps(exceptions), status="Error")
            )
            db_conn.execute(s)
            s = (
                update(onboardingPolicy)
                .where(onboardingPolicy.id == res["policyId"])
                .values(status="Error", statusNote="Issue on Policy")
            )
            db_conn.execute(s)
        db_conn.commit()
    except Exception as error:
        logging.error(error)
        db_conn.rollback()


# @description: check if the same main member has had a policy loaded with the same parentPolictId and set the policy status to error and add exception
# @params: db_conn
def internalCheckDuplicateCover(db_conn):
    try:
        aliasPolicyCheck = aliased(PolicyCheck)
        s = (
            PolicyCheck.__table__.select()
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .where(
                PolicyCheck.checkDescr == "Duplicate loaded",
                PolicyCheck.status == False,
                onboardingPolicy.status == "Processing",
                onboardingPolicy.deletedAt == None,
            )
            .filter(
                ~exists().where(
                    aliasPolicyCheck.policyId == onboardingPolicy.id,
                    aliasPolicyCheck.checkDescr == "VOPD",
                    aliasPolicyCheck.status == False,
                )
            )
            .with_only_columns(PolicyCheck.policyId)
            .limit(100)
            .order_by(PolicyCheck.policyId.asc())
        )

        result = db_conn.execute(s)
        # use result.mappings().all() and create a list of all policyIds
        policyList = None
        policyList = ",".join(str(x["policyId"]) for x in result.mappings().all())

        while policyList:
            s = text(
                f"""with cte as (select pd.parentPolicyId, od.IdNumber, min(pd.id) as PolicyDataId from onboarding.onboardingPolicies pd (nolock) inner join onboarding.onboardingData od (nolock) on pd.id = od.policyId where od.IdNumber is not null and od.memberType = 'Main Member' and pd.status not in ('Complete') and pd.deletedAt is null group by pd.parentPolicyId, od.IdNumber having count(distinct pd.id) > 1) select distinct b.PolicyDataId, pd.status, od.id as PolicyMemberId, od.memberType, od.exceptions, od.status as memberStatus from onboarding.onboardingPolicies pd (nolock) inner join onboarding.onboardingData od (nolock) on pd.id = od.policyId inner join cte as b on pd.parentPolicyId = b.parentPolicyId and od.IdNumber = b.IdNumber where pd.status not in ('Complete') and pd.deletedAt is null and od.memberType = 'Main Member' and od.policyId > b.PolicyDataId and od.policyId in ({policyList});"""
            )

            result = db_conn.execute(s)
            policyDuplicates = result.mappings().all()

            for res in policyDuplicates:
                logging.debug(f"Check res: {res}")
                exceptions = []
                if res["exceptions"]:
                    exceptions = json.loads(res["exceptions"])
                # logging.debug(
                #     f"Check exceptions: {exceptions} exception_type {type(exceptions)}"
                # )

                exceptions = utils.addExceptionsExistingValues(
                    exceptions,
                    "IdNumber",
                    f"Possible duplicate for main member on Client Connect",
                )
                logging.debug(f"Check exceptions: {exceptions}")
                s = (
                    update(onboardingData)
                    .where(
                        onboardingData.policyId == res["PolicyDataId"],
                        onboardingData.id == res["PolicyMemberId"],
                    )
                    .values(exceptions=json.dumps(exceptions), status="Error")
                )
                db_conn.execute(s)
            policyList2 = []
            for x in policyList.split(","):
                policyList2.append(int(x))
            s = (
                update(PolicyCheck)
                .where(
                    PolicyCheck.policyId.in_(policyList2),
                    PolicyCheck.checkDescr == "Duplicate loaded",
                )
                .values(status=True)
            )
            db_conn.execute(s)
            db_conn.commit()

            lastPolicyId = policyList2[-1]

            s = (
                PolicyCheck.__table__.select()
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .where(
                    PolicyCheck.checkDescr == "Duplicate loaded",
                    PolicyCheck.status == False,
                    onboardingPolicy.status == "Processing",
                    onboardingPolicy.deletedAt == None,
                    onboardingPolicy.id > lastPolicyId,
                )
                .filter(
                    ~exists().where(
                        aliasPolicyCheck.policyId == onboardingPolicy.id,
                        aliasPolicyCheck.checkDescr == "VOPD",
                        aliasPolicyCheck.status == False,
                    )
                )
                .with_only_columns(PolicyCheck.policyId)
                .limit(100)
                .order_by(PolicyCheck.policyId.asc())
            )

            result = db_conn.execute(s)
            policyList = None
            policyList = ",".join(str(x["policyId"]) for x in result.mappings().all())

    except Exception as error:
        logging.error(error)
        db_conn.rollback()


# @description: add all policy members idNumber, firstname and surname to ClientUpdate table if they do not exists
# @params: db_conn
def addClientUpdate(db_conn):
    batch_id = 1
    try:
        # get current max batchId from ClientUpdate table + 1
        s = ClientUpdate.__table__.select().with_only_columns(
            func.max(ClientUpdate.batchId)
        )
        result = db_conn.execute(s)
        resultSet = result.mappings().all()
        logging.debug(f"Check {len(resultSet)}")
        if resultSet[0]["max_1"]:
            batch_id = resultSet[0]["max_1"] + 1

        logging.debug(f"Check batch_id: {batch_id}")

        s = (
            Policy.__table__.select()
            .join(PolicyMember, PolicyMember.policyId == Policy.id)
            .join(Member, Member.id == PolicyMember.memberId)
            .where(
                Policy.status == "Processing",
                PolicyMember.memberType != "Beneficiary",
            )
            .filter(~exists().where(ClientUpdate.idNumber == Member.idNumber))
            .with_only_columns(
                Member.idNumber,
                Member.firstName,
                Member.surname,
                PolicyMember.memberType,
                Policy.id,
                Member.idTypeId,
            )
            .limit(100)
        )
        result = db_conn.execute(s)

        for row in result.mappings().all():
            logging.debug(f"Check row: {row}")
            s = insert(ClientUpdate).values(
                batchId=batch_id,
                idNumber=row["IdNumber"],
                firstName=row["FirstName"],
                surname=row["Surname"],
                idTypeId=row["IdType"],
                policyId=row["PolicyDataId"],
            )
            db_conn.execute(s)
        db_conn.commit()

    except Exception as error:
        logging.error(error)
        db_conn.rollback()


# @description: get all policy members idNumber, client type, policy id, dob, id type from Member, Policy,PolicyMember tables where status is processing
# @params: db_conn
def getPolicies(db_conn):
    try:
        s = (
            Policy.__table__.select()
            .where(
                Policy.status == "Processing",
            )
            .with_only_columns(Policy.id, Policy.parentPolicyId, Policy.coverAmount)
            .limit(100)
        )

        result = db_conn.execute(s)

        return result.mappings().all()
    except Exception as error:
        logging.error(error)

    return None


# @description: get all policy members idNumber, client type, policy id, dob, id type from Member, Policy,PolicyMember tables where status is processing
# @params: db_conn
def getPoliciesWaitVOPD(db_conn, lastPolicy=0, status="Processing"):
    try:
        aliasPolicyCheck = aliased(PolicyCheck)
        s = (
            PolicyCheck.__table__.select()
            .with_hint(PolicyCheck, "WITH (NOLOCK)")
            .distinct()
            .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .where(
                PolicyCheck.status == False,
                PolicyCheck.checkDescr == "Benefit Allocation",
                onboardingPolicy.status == status,
                onboardingPolicy.deletedAt == None,
                onboardingPolicy.id > lastPolicy,
                # onboardingPolicy.ProviderName == "LEVYDALE SUPERSPAR",
                # onboardingPolicy.fileId == "a292295b-21a4-4d7e-84a0-030b67445bd8",
                # onboardingPolicy.id == 253345,
                # onboardingPolicy.id >= 43167,
                # onboardingPolicy.ProductOptionId == 116,
                # onboardingPolicy.id.in_([298589]),
                # Policy.CreatedDate > "2024-07-01"
            )
            .filter(
                ~exists().where(
                    aliasPolicyCheck.policyId == onboardingPolicy.id,
                    aliasPolicyCheck.checkDescr == "VOPD",
                    aliasPolicyCheck.status == False,
                )
            )
            .with_only_columns(
                onboardingPolicy.id,
                onboardingPolicy.parentPolicyId,
                onboardingPolicy.coverAmount,
                onboardingPolicy.ProductOptionId,
            )
            .order_by(onboardingPolicy.id.asc())
            .limit(25)
        )
        if status != "Processing":
            s = (
                PolicyCheck.__table__.select()
                .with_hint(PolicyCheck, "WITH (NOLOCK)")
                .distinct()
                .join(onboardingPolicy, onboardingPolicy.id == PolicyCheck.policyId)
                .with_hint(onboardingPolicy, "WITH (NOLOCK)")
                .join(onboardingData, onboardingData.policyId == onboardingPolicy.id)
                .with_hint(onboardingData, "WITH (NOLOCK)")
                .where(
                    PolicyCheck.status == False,
                    onboardingData.statedBenefitId == None,
                    PolicyCheck.status == False,
                    onboardingPolicy.deletedAt == None,
                    PolicyCheck.checkDescr == "Benefit Confirmation",
                    # Policy.id.in_([40302])
                    # Policy.id == 40140
                    # Policy.providerId == 134567
                    # Policy.CreatedDate > "2024-07-01"
                )
                .filter(
                    ~exists().where(
                        aliasPolicyCheck.policyId == onboardingPolicy.id,
                        aliasPolicyCheck.checkDescr == "VOPD",
                        aliasPolicyCheck.status == False,
                    )
                )
                .with_only_columns(
                    onboardingPolicy.id,
                    onboardingPolicy.parentPolicyId,
                    onboardingPolicy.coverAmount,
                )
                .order_by(onboardingPolicy.id.asc())
                .limit(1000)
            )
        result = db_conn.execute(s)

        return result.mappings().all()
    except Exception as error:
        logging.error(error)

    return None


# @description: get all policy members idNumber, client type, policy id, dob, id type from Member, Policy,PolicyMember tables where status is processing
# @params: db_conn
def getPolicy(db_conn, policyId):
    try:
        s = (
            onboardingPolicy.__table__.select()
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .join(onboardingData, onboardingData.policyId == onboardingPolicy.id)
            .with_hint(onboardingData, "WITH (NOLOCK)")
            .where(
                # reactivate this
                # Policy.status == "Processing",
                onboardingData.memberType != "Beneficiary",
                onboardingPolicy.id == policyId,
                onboardingData.deletedAt == None,
                onboardingData.alsoMember == False,
            )
            .with_only_columns(
                onboardingData.idNumber,
                onboardingData.memberType,
                onboardingData.memberTypeId,
                onboardingPolicy.id,
                onboardingData.id.label("memberId"),
                onboardingData.idTypeId,
                onboardingData.dateOfBirth,
                onboardingData.address1.label("AddressLine1"),
                onboardingPolicy.PolicyInceptionDate,
                onboardingPolicy.parentPolicyId,
                onboardingData.exceptions,
                onboardingData.statedBenefitId,
                onboardingData.statedBenefit,
                onboardingData.benefitName.label("benefit"),
                onboardingPolicy.coverAmount,
                onboardingData.supportDocument,
                onboardingData.email,
                onboardingData.preferredMethodOfCommunication,
            )
            .order_by(onboardingData.memberTypeId.asc())
        )

        result = db_conn.execute(s)

        return result.mappings().all()
    except Exception as error:
        logging.error(f"error getPolicies {error}")

    return None


# @description: update exceptions and status on PolicyMember table
# @params: db_conn, policyId, memberId, exceptions, status
def updatePolicyMemberExceptions(db_conn, policyId, memberId, exceptions, status):
    try:
        s = (
            update(onboardingData)
            .where(
                onboardingData.policyId == policyId,
                onboardingData.id == memberId,
                # onboardingData.memberType != "Beneficiary",
            )
            .values(exceptions=json.dumps(exceptions), status=status)
        )
        db_conn.execute(s)

        if status == "Error":
            s = (
                update(onboardingPolicy)
                .where(onboardingPolicy.id == policyId)
                .values(status="Error", statusNote="Issue on members")
            )
            db_conn.execute(s)
        # db_conn.commit()
        return True
    except Exception as error:
        logging.error(error)
        db_conn.rollback()
    return False


# @description: update policyStats and statusNote on Policy table
# @params: db_conn, policyId, status, statusNote
def updatePolicy(db_conn, policyId, status, statusNote):
    try:
        s = (
            update(onboardingPolicy)
            .where(onboardingPolicy.id == policyId)
            .values(status=status, statusNote=statusNote)
        )
        db_conn.execute(s)
        # db_conn.commit()
        return True
    except Exception as error:
        logging.error(error)
        db_conn.rollback()
    return False


# @description: update policyFlag status on PolicyCheck table
# @params: db_conn, policyId, checkDescr, status
def updatePolicyCheck(db_conn, policyId, checkDescr, status):
    try:
        s = (
            update(PolicyCheck)
            .where(
                PolicyCheck.policyId == policyId,
                PolicyCheck.checkDescr == checkDescr,
            )
            .values(status=status)
        )
        db_conn.execute(s)
        # db_conn.commit()
        return True
    except Exception as error:
        logging.error(error)
        db_conn.rollback()
    return False


# @description: update statedBenefitId, statedBenefit and baserate on PolicyMember table
# @params: db_conn, policyId, memberId, statedBenefitId, statedBenefit, baserate
def updatePolicyMemberStatedBenefit(
    db_conn,
    policyId,
    memberId,
    statedBenefitId,
    statedBenefit,
    benefitRate,
    commissionPercentage,
    coverAmount,
    PremiumAdjustmentPercentage,
    BinderFeePercentage,
    AdminPercentage=0,
):
    try:
        premiumCalc = benefitRate
        if benefitRate > 0:
            premiumCalc = benefitRate * (1 + PremiumAdjustmentPercentage)
            qry = f"""select [dbo].[SynonymCalculateFuneralPolicyPremium] ( {benefitRate}, {AdminPercentage}, {commissionPercentage}, {BinderFeePercentage}) as result;"""

            result = utils.orm_select(db_conn, qry)
            if result:
                premiumCalc = result[0]["result"]

        s = (
            update(onboardingData)
            .where(
                onboardingData.policyId == policyId,
                onboardingData.id == memberId,
                onboardingData.memberType != "Beneficiary",
            )
            .values(
                statedBenefitId=statedBenefitId,
                statedBenefit=statedBenefit,
                premium=premiumCalc,
                coverAmount=coverAmount,
            )
        )
        db_conn.execute(s)
        db_conn.commit()
        return True
    except Exception as error:
        logging.error(error)
        db_conn.rollback()
    return False


# @description: get list of policies with no approverId allocated
# @params: db_conn
def getPoliciesNoApprover(db_conn, fileId=None):
    try:

        s = (
            select(onboardingPolicy)
            .with_hint(onboardingPolicy, "WITH (NOLOCK)")
            .where(
                onboardingPolicy.fileId == None,
                onboardingPolicy.status == "Submitted",
                onboardingPolicy.approverId == None,
                onboardingPolicy.deletedAt == None,
            )
            .with_only_columns(onboardingPolicy.id, onboardingPolicy.createdBy)
            .limit(1000)
        )
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as error:
        logging.error(error)
    return None


# @description: get list of files with no approverId allocated with count of policies
# @params: db_conn
def getFilesNoApprover(db_conn):
    try:
        s = """select distinct id, createdBy from onboarding.Files (nolock) where status = 'submitted' and approverId is null"""
        result = db_conn.execute(text(s))
        return result.mappings().all()
    except Exception as error:
        logging.error(error)
    return None


# @description: get last approver for a file id
# @params: db_conn, fileId
def getLastApprover(db_conn, fileId):
    try:
        s = (
            Policy.__table__.select()
            .where(
                Policy.fileId == fileId,
                Policy.approverId != None,
            )
            .with_only_columns(Policy.approverId)
            .order_by(Policy.id.desc())
            .limit(1)
        )
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as error:
        logging.error(error)
    return None


# @description: count of policies per approver where status is not not completed
# @params: db_conn
def countPoliciesPerApprover(db_conn):
    try:
        s = text(
            "SELECT approverId, count(id) as policies from onboarding.onboardingPolicies op (nolock) where status <> 'completed' and approverId is not null and deletedAt is null group by approverId;"
        )

        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as error:
        logging.error(error)
    return None


# @descriptions get all Users with a specific role and number of policies allocated to them
# @params: db_conn
def getUsersCountPolicies(db_conn):
    try:
        s = (
            onboardingPolicy.__table__.select()
            .join(
                OnboardingFile,
                onboardingPolicy.fileId == OnboardingFile.id,
            )
            .where(onboardingPolicy.status == "Submitted")
            # .where(User.roles.like(f"%CDA-RMA-Policy Admin%"))
            # .where(User.email.in_('zmabena@randmutual.co.za','tpursooth@randmutual.co.za','pnaicker@randmutual.co.za','mmokhothu@randmutual.co.za','skunene@randmutual.co.za','nmehlo@randmutual.co.za','lcarelse@randmutual.co.za','kmontshonyane@randmutual.co.za','tmphulane@randmutual.co.za','bndaba@randmutual.co.za'))
            .with_only_columns(
                onboardingPolicy.BrokerageName,
                onboardingPolicy.ProviderName,
                OnboardingFile.orgFileName,
                onboardingPolicy.approverId.label("email"),
                func.count(onboardingPolicy.id).label("policies"),
            )
            .group_by(
                onboardingPolicy.BrokerageName,
                onboardingPolicy.ProviderName,
                OnboardingFile.orgFileName,
                onboardingPolicy.approverId,
            )
        )
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as error:
        logging.error(error)
    return None


# @description: get all users  and number of policies created per status using a case statement
# sum(case  when status = 'Draft' then 1 else 0 end) as Draft
# sum(case when status = 'Processing' then 1 else 0 end) as Processing
# sum(case  when status = 'Error' then 1 else 0 end) as Error
# sum(case  when status = 'Submitted' then 1 else 0 end) as Submitted
# sum(case  when status = 'Approved' then 1 else 0 end) as Approved
# sum(case  when status = 'Rejected' then 1 else 0 end) as Rejected
# sum(case  when status = 'Completed' then 1 else 0 end) as Completed
# @params: db_conn
def getUsersCountPoliciesStatus(db_conn):
    try:
        s = text(
            """select
	pd.createdBy,
	coalesce(f.orgFileName,
	'Manual') as fileName,
	pd.BrokerageName,
	pd.ProviderName,
	count(pd.id) as policies,
	sum(case when pd.status = 'Draft' then 1 else 0 end) as Draft,
	sum(case when pd.status = 'Processing' then 1 else 0 end) as Processing,
	sum(case when pd.status = 'Duplicate' then 1 else 0 end) as Duplicate,
	sum(case when pd.status = 'Error' then 1 else 0 end) as Error,
	sum(case when pd.status = 'Submitted' then 1 else 0 end) as Submitted,
	sum(case when pd.status = 'Approved' then 1 else 0 end) as Approved,
	sum(case when pd.status = 'Rejected' then 1 else 0 end) as Rejected,
	sum(case when pd.status = 'Complete' then 1 else 0 end) as Complete
from
	onboarding.onboardingPolicies pd (nolock)
left join onboarding.Files f (nolock) on
	pd.fileId = f.id
where pd.deletedAt is  null
group by
	pd.createdBy,
	coalesce(f.orgFileName,
	'Manual'),
	pd.BrokerageName,
	pd.ProviderName
order by
	createdBy;"""
        )
        result = db_conn.execute(s)
        return result.mappings().all()
    except Exception as error:
        logging.error(error)
    return None


# @description: set approver for a specific policy
# @params: db_conn, fileId, approverId
def setApprover(db_conn, fileId, approverId):
    try:
        s = (
            update(OnboardingFile)
            .where(OnboardingFile.id == fileId)
            .values(approverId=approverId)
        )
        db_conn.execute(s)

        s = (
            update(onboardingPolicy)
            .where(
                onboardingPolicy.fileId == fileId,
                onboardingPolicy.status != "Complete",
                onboardingPolicy.deletedAt == None,
            )
            .values(approverId=approverId)
        )
        db_conn.execute(s)

    except Exception as error:
        logging.error(error)
        db_conn.rollback()


# @description: set approver for a specific policy
# @params: db_conn, fileId, approverId
def setApproverPolicy(db_conn, policyId, approverId):
    try:

        s = (
            update(onboardingPolicy)
            .where(onboardingPolicy.id == policyId)
            .values(approverId=approverId)
        )
        db_conn.execute(s)

    except Exception as error:
        logging.error(error)
        db_conn.rollback()


# @description: add brokerageRepresentativeMap
# @params: db_conn, brokerageId, representativeId
def addBrokerageRepresentativeMap(db_conn, brokerageId, representativeId):
    try:
        # check if brokerageRepresentativeMap exists
        s = (
            select(BrokerageRepresentativeMap)
            .where(
                BrokerageRepresentativeMap.BrokerageId == brokerageId,
                BrokerageRepresentativeMap.RepresentativeId == representativeId,
            )
            .with_only_columns(BrokerageRepresentativeMap.BrokerageRepresentativeMapId)
        )
        result = db_conn.execute(s)
        resultSet = result.mappings().all()

        if resultSet:
            # return brokerageId
            return resultSet[0]["BrokerageRepresentativeMapId"]

        s = insert(BrokerageRepresentativeMap).values(
            BrokerageId=brokerageId,
            RepresentativeId=representativeId,
        )
        db_conn.execute(s)
        db_conn.commit()

        # return brokerageId
        s = (
            select(BrokerageRepresentativeMap)
            .where(
                BrokerageRepresentativeMap.BrokerageId == brokerageId,
                BrokerageRepresentativeMap.RepresentativeId == representativeId,
            )
            .with_only_columns(BrokerageRepresentativeMap.BrokerageRepresentativeMapId)
        )
        result = db_conn.execute(s)
        resultSet = result.mappings().all()

        if resultSet:
            # return brokerageId
            return resultSet[0]["BrokerageRepresentativeMapId"]

    except Exception as error:
        logging.error(error)
        db_conn.rollback()
    return None
