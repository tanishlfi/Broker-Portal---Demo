import React, { useEffect } from "react";
import { useMutation, useQueries } from "react-query";
import { nodeSa, rmaAPI } from "../../../src/AxiosParams";
import useToken from "../../../hooks/useToken";
import { Alert, Button, Stack } from "@mui/material";
import AlertPopup from "../../../components/Bits/AlertPopup";
import axios from "axios";

const AllocateEditBenefits = ({
  PolicyMembers,
  setPolicyMembers,
  PolicyData,
  setIsPremiumFetched,
  // PolicyMembersOrg,
}) => {
  // console.log("PolicyMember", PolicyMembers);
  const accessToken = useToken();

  const [requiresBenefit, setRequiresBenefit] = React.useState(false);

  useEffect(() => {
    let requiresBenefit = false;
    PolicyMembers.forEach((member) => {
      if (
        !member?.benefitId &&
        member?.insuredLifeStatus === 1 &&
        member.MemberTypeId !== 6
      ) {
        requiresBenefit = true;
      }
    });

    setRequiresBenefit(requiresBenefit);
  }, [PolicyMembers]);

  const getBenefitsDetails = useQueries(
    PolicyMembers.map((member) => ({
      queryKey: [
        "getBenefitsAndRates",
        member?.RolePlayerId + member.benefitId,
      ],
      queryFn: async () => {
        if (!member?.benefitId) return null; // Prevent unnecessary requests
        const response = await axios.get(
          `${rmaAPI}/clc/api/Product/Benefit/${member.benefitId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        return response.data;
      },
      onSuccess: (data) => {
        if (!data) return; // Safeguard against invalid responses

        setPolicyMembers((prev) =>
          prev.map((item) =>
            item?.benefitId === data?.id
              ? {
                  ...item,
                  benefitId: data.id,
                  BenefitCode: data.code,
                  // Premium: data.benefitRates?.[0]?.baseRate || 0,
                  Premium: data.benefitRates?.[0]?.baseRate
                    ? data.benefitRates[0].baseRate *
                      (1 + PolicyData.premiumAdjustmentPercentage)
                    : 0, // Default to 0 if benefitRates is missing
                  CoverAmount: data.benefitRates?.[0]?.benefitAmount || 0, // Default CoverAmount
                  BenefitDetail: data,
                  Benefit: data.name,
                  benefitRuleItems: data.ruleItems || [], // Default empty array
                }
              : item,
          ),
        );
      },
      staleTime: 0, // Mark data as immediately stale
      cacheTime: 0, // Prevent caching of query data
      refetchOnMount: true, // Force a new fetch when the component remounts
      refetchOnWindowFocus: false, // Avoid refetching on window focus
      enabled: !!member?.benefitId && member?.benefitId !== 0, // Ensure only valid queries run
    })),
  );

  const allocate = useMutation({
    mutationFn: async (data) => {
      return await axios.post(`${nodeSa}/edit/benefits/allocate`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
  });

  const SubmitBenefitsRequest = () => {
    // console.log("SubData", PolicyMembers);
    let SubData = {
      ...PolicyData,
      PolicyMembers: PolicyMembers.filter(
        (member) => member?.insuredLifeStatus === 1,
      ).map((member) => ({
        ...member,
        Premium: member?.Premium || 0, // Default Premium if missing
        benefitId: member?.benefitId || 0, // Ensure benefitId is always included
        MemberAction:
          member?.MemberAction === 0 &&
          member?.benefitId &&
          member?.benefitId !== member?.orgBenefitId
            ? 2
            : member.MemberAction, // Determine action
        status:
          member?.MemberAction === 0 &&
          member?.benefitId &&
          member?.benefitId !== member?.orgBenefitId
            ? "Update"
            : member?.status, // Default status if missing
      })),
    };

    allocate.mutate(SubData, {
      onSuccess: (data) => {
        setPolicyMembers(
          data?.data?.data?.PolicyMembers?.map((member) => ({
            ...member, // Spread the rest of the member fields
            benefitId: member?.BenefitId ? member.BenefitId : member?.benefitId, // Default to 0 if missing
          })),
        );
        getBenefitsDetails.forEach((query) => query.refetch());
        setIsPremiumFetched(false); // Reset premium fetched state
      },
    });
  };

  return (
    <Stack sx={{ width: "100%" }}>
      <Button
        sx={{ width: "100%" }}
        fullWidth
        onClick={() => SubmitBenefitsRequest()}
        variant="contained"
        disabled={allocate.isLoading}
        color="secondary"
      >
        {allocate.isLoading || getBenefitsDetails.isLoading
          ? "Allocating Benefits..."
          : "Allocate Benefits"}
      </Button>
      {requiresBenefit && (
        <Alert
          severity="warning"
          sx={{ width: "100%", mt: 2 }}
          variant="outlined"
        >
          Some Members do not have benefits allocated
        </Alert>
      )}
      <AlertPopup
        open={allocate.isSuccess}
        severity="success"
        message="Benefits Allocated Successfully"
      />
      <AlertPopup
        open={allocate.isError}
        severity="error"
        message={
          allocate?.error?.response?.data?.message ||
          "Error Allocating Benefits"
        }
      />
    </Stack>
  );
};

export default AllocateEditBenefits;
