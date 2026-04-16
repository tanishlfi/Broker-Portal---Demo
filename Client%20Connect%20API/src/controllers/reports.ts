import { Request, Response } from "express";
import { logger } from "../middleware/logger";
const { Policy, PolicyMember, Member, sequelize } = require("../models");
const { Op, QueryTypes, Sequelize } = require("sequelize");

// endpoint to get a list of policies with their errors
export const getPolicyErrors = async (req: Request, res: Response) => {
  try {
    const getErrors = await sequelize.query(
      `with cte as (select distinct op.ProviderName, od.policyId, od.id, od.exceptions, case when od.exceptions like '%VOPD%' then 1 else 0 end as VOPDmismatch, case when od.exceptions like '%deceased%' then 1 else 0 end as deceased, case when od.exceptions like '%field": "benefit%' then 1 else 0 end as benefitAllocation, case when od.exceptions like '%"field": "memberType"%' then 1 else 0 end as memberType, case when COALESCE(od.exceptions, '[]') = '[]' then 0 when od.exceptions like '%VOPD%' then 0 when od.exceptions like '%deceased%' then 0 when od.exceptions like '%field":%"benefit%' then 0 when od.exceptions like '%"field":%"memberType"%' then 0 else 1 end as other, case when COALESCE(od.exceptions, '[]') = '[]' then 1 else 0 end noIssues, case when COALESCE(od.exceptions, '[]') <> '[]' then 1 else 0 end Issues from onboarding.onboardingPolicies op (nolock) inner join onboarding.onboardingData od (nolock) on op.id = od.policyId where op.status = 'Error' and op.deletedAt is null and od.alsoMember = 0) select ProviderName, count(distinct policyId) as policies, count(distinct id) as members, sum(noIssues) as noIssues, sum(Issues) as Issues,SUM(VOPDmismatch) AS VOPDmismatch, SUM(deceased) AS deceased, SUM(benefitAllocation) AS benefitAllocation, SUM(memberType) AS memberType, SUM(other) AS other  from cte group by ProviderName;`,
      { type: QueryTypes.SELECT },
    );

    // if no data is returned
    if (!getErrors) {
      return res.status(200).json({
        success: false,
        message: "No data found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy errors returned successfully",
      data: getErrors,
    });
  } catch (error) {
    logger.error(`Error getting policy errors: ${error}`);
    res.status(500).json({ message: "Error getting policy errors" });
  }
};

// endpoint to get a list of VOPD responses for a specific scheme
export const getVopdResponses = async (req: Request, res: Response) => {
  try {
    const getVOPD = await sequelize.query(
      `with cte as (select distinct op.ProviderName, od.idValid, od.DateOfDeath, od.VopdVerified, od.idNumber, od.dateOfBirth, od.firstName, od.surname, od.idTypeId, od.policyId, od.id from onboarding.onboardingPolicies op (nolock) inner join onboarding.onboardingData od (nolock) on op.id = od.policyId where op.deletedAt is null and od.alsoMember = 0) select ProviderName, count(distinct id) as members, sum(case when idValid = 1 then 1 else 0 end) as validIds, sum(case when VopdVerified = 1 then 1 else 0 end) as VopdVerified, sum(case when DateOfDeath is not null then 1 else 0 end) as deceased from cte group by ProviderName;`,
      { type: QueryTypes.SELECT },
    );

    // if no data is returned
    if (!getVOPD) {
      return res.status(200).json({
        success: false,
        message: "No data found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy errors returned successfully",
      data: getVOPD,
    });
  } catch (error) {
    logger.error(`Error getting policy errors: ${error}`);
    res.status(500).json({ message: "Error getting policy errors" });
  }
};

// endpoint to get current workload from a raw sql query
export const getCurrentWorkload = async (req: Request, res: Response) => {
  try {
    const currentWorkload = await sequelize.query(
      `select
	distinct ProviderName,
	createdBy,
	count(id) as policies,
	sum(case when deletedAt is null and status = 'Draft' then 1 else 0 end) as Draft,
	sum(case when deletedAt is null and status = 'Processing' then 1 else 0 end) as Processing,
	sum(case when deletedAt is null and status = 'Error' then 1 else 0 end) as Error,
	sum(case when deletedAt is null and status = 'Duplicate' then 1 else 0 end) as Duplicate,
	sum(case when deletedAt is null and status = 'Submitted' then 1 else 0 end) as Submitted,
	sum(case when deletedAt is null and status = 'Approved' then 1 else 0 end) as Accepted,
	sum(case when deletedAt is null and status = 'Rejected' then 1 else 0 end) as Rejected,
	sum(case when deletedAt is null and status = 'Complete' then 1 else 0 end) as Completed,
	sum(case when deletedAt is not null then 1 else 0 end) as Removed
from
	onboarding.onboardingPolicies op (nolock)
WHERE op.deletedAt IS NULL
group by
	ProviderName,
	createdBy;`,
      { type: QueryTypes.SELECT },
    );

    // if no data is returned
    if (!currentWorkload) {
      return res.status(200).json({
        success: false,
        message: "No data found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workload returned successfully",
      data: currentWorkload,
    });
  } catch (error) {
    logger.error(`Error getting current workload: ${error}`);
    res
      .status(500)
      .json({ succuess: false, message: "Error getting current workload" });
  }
};

// endpoint to get current approver workload from a raw sql query
export const getCurrentApproverWorkload = async (
  req: Request,
  res: Response,
) => {
  try {
    const currentWorkload = await sequelize.query(
      `select
	distinct op.BrokerageName,
	op.ProviderName as Scheme,
	COALESCE(f.orgFileName,
	'Manual') as fileName,
	op.createdBy,
	op.approverId,
	COALESCE(f.createdAt,
	op.createdAt) as createdAt,
	count(op.id) as policies
from
	onboarding.onboardingPolicies op (nolock)
left join onboarding.Files f (nolock) on
	op.fileId = f.id
where
	op.status = 'Submitted'
	and op.deletedAt is null
group by
	op.BrokerageName,
	op.ProviderName,
	COALESCE(f.orgFileName,
	'Manual'),
	op.createdBy,
	op.approverId,
	COALESCE(f.createdAt,
	op.createdAt)
order by
	BrokerageName,
	Scheme;`,
      { type: QueryTypes.SELECT },
    );

    // if no data is returned
    if (!currentWorkload) {
      return res.status(200).json({
        success: false,
        message: "No data found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workload returned successfully",
      data: currentWorkload,
    });
  } catch (error) {
    logger.error(`Error getting current workload: ${error}`);
    res
      .status(500)
      .json({ succuess: false, message: "Error getting current workload" });
  }
};
