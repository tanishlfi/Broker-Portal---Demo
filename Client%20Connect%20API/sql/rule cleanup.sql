-- cleanup spouse
with cte as (
select distinct b.productoptionid, a."benefitId", a.benefit, a."benefitAmount" , d.id, e."default", d.benefit, d."minAge", d."coverMemberType", d."subGroup", case when trim(left(a.benefit, position('MAIN' in upper(a.benefit)) - 1)) ilike trim(left(d.benefit, position('SPOUSE' in upper(d.benefit))-1)) then true
else false end as matching
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
inner join rma."BenefitDependantBenefitRules" as e on a."benefitId" = e."mainBenefitId" and d.id = e."dependantBenefitId" 
where 
	d."coverMemberType"  ilike 'spouse' 
	and a.spouse > 0
	--and trim(left(a.benefit, position('MAIN' in upper(a.benefit)) - 1)) ilike trim(left(d.benefit, position('SPOUSE' in upper(d.benefit))-1))
order by b.productoptionid, a."benefitId", d.id
),
cte2 as (
select *
from cte 
where matching = true
),
cte3 as (
select *
from cte as a
where matching = false
and exists(select * from cte2 where "benefitId" = a."benefitId")
order by productoptionid desc, "benefitId", id
)
delete from rma."BenefitDependantBenefitRules" as a
where exists(select * from cte3 where "benefitId" = a."mainBenefitId" and id = a."dependantBenefitId");

-- cleanup child
with cte as (
select distinct b.productoptionid, a."benefitId", a.benefit, a."benefitAmount" , d.id, e."default", d.benefit, d."minAge", d."coverMemberType", d."subGroup", case when trim(left(a.benefit, position('MAIN' in upper(a.benefit)) - 1)) ilike trim(left(d.benefit, position('CHILD' in upper(d.benefit))-1)) then true
else false end as matching
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
inner join rma."BenefitDependantBenefitRules" as e on a."benefitId" = e."mainBenefitId" and d.id = e."dependantBenefitId" 
where 
	d."coverMemberType"  ilike 'child' 
	and a.spouse > 0
	--and trim(left(a.benefit, position('MAIN' in upper(a.benefit)) - 1)) ilike trim(left(d.benefit, position('SPOUSE' in upper(d.benefit))-1))
order by b.productoptionid, a."benefitId", d.id
),
cte2 as (
select *
from cte 
where matching = true
),
cte3 as (
select *
from cte as a
where matching = false
and exists(select * from cte2 where "benefitId" = a."benefitId")
order by productoptionid desc, "benefitId", id
)
delete from rma."BenefitDependantBenefitRules" as a
where exists(select * from cte3 where "benefitId" = a."mainBenefitId" and id = a."dependantBenefitId");

-- set defaul benefit
update rma."BenefitDependantBenefitRules"
set "default" = false;

with cte as (
select distinct b.productoptionid, e."mainBenefitId",  e."dependantBenefitId", a.benefit, a."benefitAmount" , d."minAge", d."coverMemberType", d."subGroup"
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
inner join rma."BenefitDependantBenefitRules" as e on a."benefitId" = e."mainBenefitId" and d.id = e."dependantBenefitId" 
order by b.productoptionid, e."mainBenefitId",  e."dependantBenefitId"
),
cte2 as (
select productoptionid,"mainBenefitId", "benefitAmount" , "coverMemberType", "subGroup", "minAge", min("dependantBenefitId") as "dependantBenefitId"
from cte 
group by productoptionid,"mainBenefitId", "benefitAmount" , "coverMemberType", "subGroup", "minAge"
order by 1,2
)
update rma."BenefitDependantBenefitRules" as a 
set "default" = true
from cte2 as b
where a."mainBenefitId" = b."mainBenefitId" and a."dependantBenefitId" = b."dependantBenefitId";


insert into rma."BenefitDependantBenefitRules" ("mainBenefitId","dependantBenefitId" )
select distinct a."benefitId",  d.id
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  >= d."benefitAmount" 
where 
	d."coverMemberType"  ilike 'exten%' 
	and d."subGroup" is null
	and not exists(select * from rma."BenefitDependantBenefitRules" where "mainBenefitId" = a."benefitId" and "dependantBenefitId" = d.id)
	--and trim(left(a.benefit, position('MAIN' in upper(a.benefit)))) ilike trim(left(d.benefit, position('CHILD' in upper(d.benefit))))
order by a."benefitId", d.id;

select jsonb_agg(row_to_json(t))
from (
SELECT "mainBenefitId", "dependantBenefitId", "default"
FROM rma."BenefitDependantBenefitRules") as t;