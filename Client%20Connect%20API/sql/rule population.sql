insert into rma."BenefitDependantBenefitRules" ("mainBenefitId","dependantBenefitId" )
select distinct a."benefitId", d.id
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
where 
	d."coverMemberType"  ilike 'child' 
	and a.children  > 0
	and trim(left(a.benefit, position('MAIN' in upper(a.benefit)) - 1)) ilike trim(left(d.benefit, position('CHILD' in upper(d.benefit)) - 1))
	
order by a."benefitId", d.id;


insert into rma."BenefitDependantBenefitRules" ("mainBenefitId","dependantBenefitId" )
with cte as (
select distinct a."benefitId"--, d.id
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid --  and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
inner join rma."BenefitDependantBenefitRules" as e on a."benefitId" = e."mainBenefitId" and d.id = e."dependantBenefitId" 
where 
d."coverMemberType"  ilike 'spouse' 
	and a.spouse > 0
	)
select distinct a."benefitId", d.id
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
where 
d."coverMemberType"  ilike 'spouse' 
	and a.spouse > 0

	and not exists(select * from cte where "benefitId" =a."benefitId" )
order by a."benefitId", d.id;

select distinct b.productoptionid, a."benefitId", a.benefit, a."benefitAmount" , d.*
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
where 
	d."coverMemberType"  = 'Extended Family' 
	and d."subGroup" is null
order by b.productoptionid, a."benefitId", d.id;


select distinct b.productoptionid, a."benefitId", a.benefit, a."benefitAmount" , d.*
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
where 
	d."coverMemberType"  = 'Extended Family' 
	and d."subGroup" is not null 
	and a."familyMembers" > 0
order by b.productoptionid, a."benefitId", d.id;

select distinct b.productoptionid, a."benefitId", a.benefit, a."benefitAmount" , d.*
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
where 
	d."coverMemberType"  ilike 'spouse' 
	and a.spouse > 0
	--and trim(left(a.benefit, position('MAIN' in upper(a.benefit)) - 1)) ilike trim(left(d.benefit, position('SPOUSE' in upper(d.benefit))-1))
order by b.productoptionid, a."benefitId", d.id;



insert into rma."BenefitDependantBenefitRules" ("mainBenefitId","dependantBenefitId" )
select distinct a."benefitId", d.id
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid  -- and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
where 
	d."coverMemberType"  ilike 'child' 
	and a.children  > 0
	--and trim(left(a.benefit, position('MAIN' in upper(a.benefit)))) ilike trim(left(d.benefit, position('CHILD' in upper(d.benefit))))
order by a."benefitId", d.id;

select distinct b.productoptionid, a."benefitId", d.id, a.benefit, a."benefitAmount" ,trim(left(a.benefit, position('MAIN' in upper(a.benefit)))), trim(left(d.benefit, position('CHILD' in upper(d.benefit))))
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid   and b.productoptionid  = 200
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
where 
	d."coverMemberType"  ilike 'child' 
	and a.children  > 0
	-- and trim(left(a.benefit, position('MAIN' in upper(a.benefit)))) ilike trim(left(d.benefit, position('CHILD' in upper(d.benefit))))
order by b.productoptionid, a."benefitId", d.id;


select distinct b.productoptionid, a."benefitId", a.benefit, a."benefitAmount" , e."default", d.*
from rma."benefitRules" as a
inner join rma.product_productoptionbenefit as b on a."benefitId"  = b.benefitid   and b.productoptionid  = 75
inner join rma.product_productoptionbenefit as c on b.productoptionid  = c.productoptionid
inner join rma."DependantBenefitRules" as d on c.benefitid  = d.id and a."benefitAmount"  = d."benefitAmount" 
inner join rma."BenefitDependantBenefitRules" as e on a."benefitId" = e."mainBenefitId" and d.id = e."dependantBenefitId" 
order by b.productoptionid desc, a."benefitId" asc, d.id;