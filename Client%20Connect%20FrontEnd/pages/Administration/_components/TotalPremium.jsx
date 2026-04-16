import React, { useEffect, useState } from "react";
import { useQueries } from "react-query";
import useToken from "../../../hooks/useToken";
import axios from "axios";
import { nodeSa } from "../../../src/AxiosParams";
import { Card, CardHeader, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import GetPremiumRoundingExclusions from "./GetPremiumRoundingExclusions";

const premiumCalculator = async (accessToken, data) => {
  try {
    // console.log("Premium calculation data:", data);
    const response = await axios.post(`${nodeSa}/premiumCalculator`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // console.log("Premium calculation response:", response.data);
    return response?.data; // Return the actual premium value
  } catch (error) {
    console.error("Premium calculation error:", error);
    return null; // Or handle error as needed
  }
};

const TotalPremium = ({
  PolicyMembers,
  setPolicyMembers,
  PolicyData,
  setTotal,
  total,
  premiumTotal,
  setPremiumTotal,
  ParentPolicy,
  europAssist,
  isPremiumFetched,
  setIsPremiumFetched,
}) => {
  const accessToken = useToken();

  const [rounded, setRounded] = useState(false);

  // console.log("PolicyData", PolicyData);
  // console.log("PolicyMembers", PolicyMembers);
  // console.log("ParentPolicy", ParentPolicy);
  let {
    PremiumRoundingExclusions,
    isLoadingGetPremiumRoundingExclusions,
    isSuccessGetPremiumRoundingExclusions,
  } = GetPremiumRoundingExclusions();
  const isEuropAssist = PolicyData?.isEuropAssist;

  useEffect(() => {
    if (isPremiumFetched) return; // Stop if already successful

    const fetchPremium = async () => {
      const memberPremium = PolicyMembers.filter(
        (member) => member.insuredLifeStatus === 1,
      ).reduce((sum, member) => sum + (member?.Premium || 0), 0);
      // console.log("Total Premium before adjustments:", memberPremium);
      setTotal(memberPremium);

      const baseRate =
        memberPremium * (1 + PolicyData.premiumAdjustmentPercentage);

      const premiumResponse = await premiumCalculator(accessToken, {
        benefitRate: baseRate,
        adminFeePercentage: PolicyData.AdminPercentage,
        commissionPercentage: PolicyData.CommissionPercentage,
        binderFeePercentage: PolicyData.BinderFeePercentage,
      });

      // console.log("Calculated Premium from API:", premiumResponse?.data);

      if (
        new Date(ParentPolicy?.policyInceptionDate) < new Date("2023-11-01")
      ) {
        setRounded(true);
      }

      if (PremiumRoundingExclusions.includes(ParentPolicy?.policyId)) {
        setRounded(false);
      }
      const Ptotal = rounded
        ? Math.round(premiumResponse?.data)
        : premiumResponse?.data;
      const europAssistFee = PolicyData.isEuropAssist
        ? europAssist / (1 - PolicyData?.CommissionPercentage)
        : 0;
      setPremiumTotal(Ptotal + europAssistFee);
      setIsPremiumFetched(true); // Mark as successful
    };
    // id isSuccessGetPremiumRoundingExclusions to true
    if (isSuccessGetPremiumRoundingExclusions) {
      fetchPremium();
    }
  }, [
    PolicyMembers,
    setTotal,
    setPremiumTotal,
    ParentPolicy?.policyInceptionDate,
    PolicyData,
    europAssist,
    accessToken,
    isPremiumFetched, // Add this
    PremiumRoundingExclusions,
    isSuccessGetPremiumRoundingExclusions,
  ]);

  return (
    <Card>
      {/* {getCalculatedPremium.map((query, index) => {
        if (query.isLoading) return <div key={index}>Loading...</div>;
        return null;
      }) */}

      <CardHeader
        align="right"
        title={`Total Premium: R ${
          premiumTotal &&
          premiumTotal?.toFixed()?.replace(/\d(?=(\d{3})+\.)/g, "$&,")
        }`}
        subheader={
          <Stack>
            <Typography>{`Commission : R ${(premiumTotal - total)
              .toFixed(2)
              ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}`}</Typography>
            {PolicyData.isEuropAssist && (
              <Typography
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                Europ Assist :&nbsp;
                <CheckBoxIcon style={{ color: "green" }} />
              </Typography>
            )}
          </Stack>
        }
      />
    </Card>
  );
};

export default TotalPremium;
