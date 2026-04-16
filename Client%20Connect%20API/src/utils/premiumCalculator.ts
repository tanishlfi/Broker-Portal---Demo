import { QueryTypes } from "sequelize";

export async function calculatePremium(
  sequelize: any,
  benefitRate: number,
  // premiumAdjustmentPercentage: number,
  adminFeePercentage: number,
  commissionPercentage: number,
  binderFeePercentage: number,
): Promise<number> {
  // const BaseRate = benefitRate * (1 + premiumAdjustmentPercentage);
  // console.log("premiumAdjustmentPercentage", premiumAdjustmentPercentage);
  // console.log("adminFeePercentage", adminFeePercentage);
  // console.log("commissionPercentage", commissionPercentage);
  // console.log("binderFeePercentage", binderFeePercentage);
  // console.log("benefitRate", benefitRate);

  const BaseRate = benefitRate;
  const [result] = await sequelize.query(
    // `SELECT round([dbo].[SynonymCalculateFuneralPolicyPremium](:benefitRate, :adminFee, :commission, :binderFee), 0) as premium`,
    `SELECT [dbo].[SynonymCalculateFuneralPolicyPremium](:benefitRate, :adminFee, :commission, :binderFee) as premium`,
    {
      replacements: {
        benefitRate: BaseRate,
        adminFee: adminFeePercentage,
        commission: commissionPercentage,
        binderFee: binderFeePercentage,
      },
      type: QueryTypes.SELECT,
    },
  );

  return (result as any).premium;
}
