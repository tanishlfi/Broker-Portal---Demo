ONBOARDINGDATA_HISTORY = """delete odh from onboarding.onboardingDataHistory odh
inner join onboarding.onboardingPolicies op (nolock) on odh.policyId = op.id and op.status not in ('Approved', 'Submitted');

insert into onboarding.onboardingDataHistory
select distinct od.*
from onboarding.onboardingData od (nolock)
inner join onboarding.onboardingPolicies op (nolock) on od.policyId = op.id and op.status = 'Submitted'
where not exists(select * from onboarding.onboardingDataHistory where id = od.id  and policyId = od.policyId);"""
