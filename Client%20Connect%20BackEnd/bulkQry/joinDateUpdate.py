JOINDATE_UPDATE = """-- set join date to start of month if end of month
UPDATE onboarding.onboardingPolicies
SET PolicyInceptionDate = DATEADD(DAY, 1, PolicyInceptionDate)
WHERE deletedAt IS NULL
  AND EOMONTH(PolicyInceptionDate) = PolicyInceptionDate
  and status not in ('Complete');

-- updated expiry of policies
with cte as (
select distinct id, status, OrgPolicyInceptionDate, PolicyInceptionDate, createdAt, (
        (DATEDIFF(DAY, createdAt, GETDATE()) 
         - (DATEDIFF(WEEK, createdAt, GETDATE()) * 2)
         - CASE WHEN DATENAME(WEEKDAY, createdAt) = 'Sunday' THEN 1 ELSE 0 END
         - CASE WHEN DATENAME(WEEKDAY, GETDATE()) = 'Saturday' THEN 1 ELSE 0 END
        )
      ) as cutoffDate
from onboarding.onboardingPolicies (nolock)
where deletedAt is null
and status not in ('Complete', 'Approved', 'Submitted', 'Expired', 'Processing')
--AND createdAt <= DATEADD(DAY, -14, GETDATE())  -- rough cutoff (at least 14 days ago)
)
update op
set op.status = 'Expired', op.statusNote = 'Unfortunately, policy creation took too long please recapture', op.updatedAt = current_timestamp
from onboarding.onboardingPolicies op
inner join cte as b on op.id = b.id
where b.cutoffDate > 10;


/*
update onboarding.onboardingPolicies
set PolicyInceptionDate = OrgPolicyInceptionDate 
where OrgPolicyInceptionDate <> PolicyInceptionDate 
and deletedAt is null
and status not in ('Complete', 'Approved', 'Submitted');
*/

-- set original joindate on file
update onboarding.onboardingPolicies
set OrgPolicyInceptionDate = PolicyInceptionDate 
where OrgPolicyInceptionDate is null
and deletedAt is null
and status not in ('Complete', 'Approved', 'Submitted', 'Expired');

-- reset processing policies for join date
with cte as (
select distinct id, status, OrgPolicyInceptionDate, PolicyInceptionDate, createdAt,CASE 
        WHEN DAY(GETDATE()) BETWEEN 1 AND 15 
            THEN DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
        ELSE DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
    END AS JoinDate
from onboarding.onboardingPolicies (nolock)
where deletedAt is null
and status not in ('Complete', 'Approved', 'Submitted', 'Expired')
),
cte2 as (
select * from cte where PolicyInceptionDate < JoinDate and status = 'Processing'
)
delete pc from onboarding.policy_checks pc
inner join cte2 as b on pc.policyId = b.id;

with cte as (
select distinct id, status, OrgPolicyInceptionDate, PolicyInceptionDate, createdAt,CASE 
        WHEN DAY(GETDATE()) BETWEEN 1 AND 15 
            THEN DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
        ELSE DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
    END AS JoinDate
from onboarding.onboardingPolicies (nolock)
where deletedAt is null
and status not in ('Complete', 'Approved', 'Submitted', 'Expired')
),
cte2 as (
select * from cte where PolicyInceptionDate < JoinDate and status = 'Processing'
)
update od
set od.status = 'New', od.exceptions = '[]', od.updatedAt = current_timestamp
from onboarding.onboardingPolicies op (nolock)
inner join cte2 on op.id = cte2.id
inner join onboarding.onboardingData od  on op.id = od.policyId 
where op.status = 'Processing';

-- change join date to new date it should be
with cte as (
select distinct id, OrgPolicyInceptionDate, PolicyInceptionDate, createdAt,CASE 
        WHEN DAY(GETDATE()) BETWEEN 1 AND 15 
            THEN DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
        ELSE DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
    END AS JoinDate
from onboarding.onboardingPolicies (nolock)
where deletedAt is null
and status not in ('Complete', 'Approved', 'Submitted', 'Expired')
)
update op
set op.PolicyInceptionDate = b.JoinDate, op.updatedAt = current_timestamp
from onboarding.onboardingPolicies op
inner join cte as b on op.id = b.id
where op.PolicyInceptionDate < b.JoinDate;

update od
set od.joinDate = op.PolicyInceptionDate
from onboarding.onboardingData od
inner join onboarding.onboardingPolicies op on od.policyId = op.id
where op.deletedAt is null
and od.deletedAt is null
and od.alsoMember = 0
and od.joinDate <> op.PolicyInceptionDate;
"""
