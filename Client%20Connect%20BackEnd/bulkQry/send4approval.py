ADDAPPROVAL = """
update od
set od.statedBenefitId = odh.statedBenefitId, od.statedBenefit = odh.statedBenefit 
from onboarding.onboardingData od 
inner join onboarding.onboardingDataHistory odh on od.id = odh.id
inner join onboarding.onboardingPolicies op on od.policyId = op.id and op.status = 'Approved'
where od.statedBenefitId is null
and odh.statedBenefitId is not null;

update pm
set pm.statedBenefitId = od.statedBenefitId, pm.statedBenefit = od.statedBenefit 
from onboarding.onboardingData od 
inner join onboarding.PolicyMember pm on od.id = pm.onboardingDataId 
inner join onboarding.onboardingPolicies op on od.policyId = op.id and op.status = 'Approved'
where  pm.statedBenefitId is null
and  od.statedBenefitId is not null;

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
and pd.deletedAt is null;

INSERT INTO onboarding.PolicyData
(parentPolicyId, providerId, ProductOptionId, providerInceptionDate, PolicyInceptionDate, coverAmount, status, selectedCategory, fileId, approverId, createdBy, CreatedDate, updatedAt, updatedBy, deletedAt, actionType, statusNote, BrokerageName, ProviderName, onboardingPoliciesId)
select distinct parentPolicyId, parentPolicyId, ProductOptionId, providerInceptionDate, PolicyInceptionDate, coverAmount, 
status, 3, fileId, approverId, createdBy, CreatedAt , updatedAt, updatedBy , deletedAt, 'ADD', statusNote, BrokerageName, ProviderName, id
from onboarding.onboardingPolicies op (nolock)
where status = 'Approved'
and not exists(select * from onboarding.PolicyData (nolock) where PolicyDataId = op.PolicyDataId)
;

update op
set op.PolicyDataId = pd.PolicyDataId 
from onboarding.onboardingPolicies op
inner join onboarding.PolicyData pd (nolock) on op.id = pd.onboardingPoliciesId
where op.PolicyDataId is null;



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
and not exists(select * from onboarding.Member_old (nolock) where MemberId = m.MemberId);

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
and not exists(select * from onboarding.[Member] (nolock) where onboardingDataId = od.id);

update od
set od.MemberId = m.MemberId
from onboarding.onboardingData od
inner join onboarding.[Member] m (nolock) on od.id = m.onboardingDataId
where od.MemberId is null;

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
and not exists(select * from onboarding.PolicyMember (nolock) where onboardingDataId = od.id);

update od
set od.PolicyMemberId = m.PolicyMemberId
from onboarding.onboardingData od
inner join onboarding.PolicyMember m (nolock) on od.id = m.onboardingDataId
where od.PolicyMemberId is null;
"""

UPDATE_ECARE_REJECTIONS = """with cte as (
select distinct pm.insuredMemberId 
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
inner join onboarding.PolicyMember pm (nolock) on pd.PolicyDataId = pm.PolicyDataId
where sb.ResponseMessage like '%String or binary data would be truncated.'
)
update m
set m.onboardingDataid = null
from onboarding.Member m
inner join cte as b on m.memberId = b.insuredMemberId;

with cte as (
select distinct pd.PolicyDataId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
where sb.ResponseMessage like '%String or binary data would be truncated.'
)
delete pm from onboarding.PolicyMember pm
inner join cte as b on pm.PolicyDataId = b.PolicyDataId;

with cte as (
select distinct op.id as policyId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
where sb.ResponseMessage like '%String or binary data would be truncated.'
)
update od
set memberId = null, PolicyMemberId = null
from onboarding.onboardingData od 
inner join cte as b on od.policyid = b.policyId;

with cte as (
select distinct op.id as policyId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
where sb.ResponseMessage like '%String or binary data would be truncated.'
)
update op
set op.status = 'Rejected', op.statusNote = 'Address line 1 too long'
from onboarding.onboardingPolicies op 
inner join cte as b on op.id = b.policyId;

with cte as (
select distinct pd.PolicyDataId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Rejected'
where sb.ResponseMessage like '%String or binary data would be truncated.'
)
delete pd from onboarding.PolicyData pd
inner join cte as b on pd.PolicyDataId = b.PolicyDataId;

delete from onboarding.ServiceBusMessages 
where ResponseMessage like '%String or binary data would be truncated.';

with cte as (
select distinct pm.insuredMemberId 
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
inner join onboarding.PolicyMember pm (nolock) on pd.PolicyDataId = pm.PolicyDataId
where sb.ResponseMessage like '%Cannot insert duplicate key row in object ''client.Person'' with unique index ''uidx_Person_IdNumber''%'
)
update m
set m.onboardingDataid = null
from onboarding.Member m
inner join cte as b on m.memberId = b.insuredMemberId;

with cte as (
select distinct pd.PolicyDataId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
where sb.ResponseMessage like '%Cannot insert duplicate key row in object ''client.Person'' with unique index ''uidx_Person_IdNumber''%'
)
delete pm from onboarding.PolicyMember pm
inner join cte as b on pm.PolicyDataId = b.PolicyDataId;

with cte as (
select distinct op.id as policyId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
where sb.ResponseMessage like '%Cannot insert duplicate key row in object ''client.Person'' with unique index ''uidx_Person_IdNumber''%'
)
update od
set memberId = null, PolicyMemberId = null
from onboarding.onboardingData od 
inner join cte as b on od.policyid = b.policyId;

with cte as (
select distinct op.id as policyId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Approved'
where sb.ResponseMessage like '%Cannot insert duplicate key row in object ''client.Person'' with unique index ''uidx_Person_IdNumber''%'
)
update op
set op.status = 'Rejected', op.statusNote = 'Duplicate members'
from onboarding.onboardingPolicies op 
inner join cte as b on op.id = b.policyId;

with cte as (
select distinct pd.PolicyDataId
from onboarding.PolicyData pd (nolock)
inner  join onboarding.ServiceBusMessages sb (nolock) on pd.ReferenceNumber = sb.RequestReferenceNumber  and sb.ResponseReferenceNumber = 'N/A'
inner join onboarding.onboardingPolicies op (nolock) on pd.onboardingPoliciesId = op.id and op.status = 'Rejected'
where sb.ResponseMessage like '%Cannot insert duplicate key row in object ''client.Person'' with unique index ''uidx_Person_IdNumber''%'
)
delete pd from onboarding.PolicyData pd
inner join cte as b on pd.PolicyDataId = b.PolicyDataId;

delete from onboarding.ServiceBusMessages 
where ResponseMessage like '%Cannot insert duplicate key row in object ''client.Person'' with unique index ''uidx_Person_IdNumber''%';"""
