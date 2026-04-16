import { Stack, LinearProgress, Button, Alert } from "@mui/material";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";
import { useRouter } from "next/router";
import { useLocalStorage } from "hooks/useLocalStorage";
import MembersDataGrid from "components/Containers/MembersDataGrid";
import PolicyNotes from "components/FormComponents.jsx/PolicyNotes";
import CreatePolicyDetails from "./CreatePolicyDetails";
import PolicyButtons from "./PolicyButtons";
import AllocateBenefitsAndRates from "./AllocateBenefitsAndRates";
import AlertPopup from "components/Bits/AlertPopup";
import useToken from "hooks/useToken";

const EditCreatedPolicyForms = () => {
  const router = useRouter();
  const { id } = router.query;

  const { edited } = router.query;

  const [policyDetails, setPolicyDetails] = useLocalStorage(
    `policyDetails${id}`,
    {
      joinDate: "",
      selectedCategory: "",
      coverAmount: "",
      productTypeId: "",
      rules: "",
      representativeId: "",
      adminPercentage: "",
      commissionPercentage: "",
      paymentFrequencyId: "",
      regularInstallmentDayOfMonth: "",
      binderFeePercentage: "",
      SchemeRolePlayerId: "",
      productOptionId: "",
      providerInceptionDate: "",
    }
  );

  const [members, setMembers] = useState([]);

  const accessToken = useToken();

  const getPolicyDetails = useQuery(
    `getPolicyDetails`,
    () => {
      return axios.get(`${nodeSa}/onboarding/policies/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        setPolicyDetails({
          ...data.data.data,
          categoryId: data.data.data?.selectedCategory,
        });
        setMembers(data?.data?.data?.members);
      },
    }
  );

  const UpdatePolicy = useMutation(
    (data) => {
      return axios.post(`${nodeSa}/onboarding/policies`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  const handleSubmit = () => {
    let clear = members.map((obj) => {
      const newObj = { ...obj };
      for (const prop in newObj) {
        if (newObj[prop] === "") {
          newObj[prop] = null;
        }
      }
      return newObj;
    });

    const data = {
      ...policyDetails,
      members: clear,
    };
    UpdatePolicy.mutate(data);
  };

  const allMembersHaveBenefit = members?.every(
    (member) =>
      member.PolicyMember.benefit && member.PolicyMember.statedBenefitId
  );

  if (getPolicyDetails.isLoading) {
    return <LinearProgress />;
  }

  return (
    <>
      {!policyDetails.approverId && (
        <Alert severity="warning">
          Approver has been assigned to this policy awaiting approval
        </Alert>
      )}

      <AlertPopup
        severity="success"
        open={UpdatePolicy.isSuccess}
        message="Policy Updated Successfully"
      />

      <AlertPopup
        severity="error"
        open={UpdatePolicy.isError}
        message="Error Updating Policy"
      />

      <CreatePolicyDetails
        policyDetails={policyDetails}
        setPolicyDetails={setPolicyDetails}
        RMAPolicy={policyDetails.providerId}
      />

      {members && members.length > 0 && (
        <Stack sx={{ mb: 4 }}>
          <MembersDataGrid setMembers={setMembers} members={members} />
          <PolicyButtons
            policyDetails={policyDetails}
            members={members}
            setMembers={setMembers}
          />
        </Stack>
      )}

      {getPolicyDetails?.data?.data?.data?.id && (
        <>
          <PolicyNotes policyId={id} />
        </>
      )}

      <Stack
        sx={{ mt: 4 }}
        direction="row"
        justifyContent="space-between"
        spacing={2}>
        <AllocateBenefitsAndRates
          accessToken={accessToken}
          SubmitData={members}
          policyDetails={policyDetails}
          productOptionId={policyDetails?.productOptionId}
          members={members}
          setMembers={setMembers}
          commissionPercentage={policyDetails?.commissionPercentage}
        />
      </Stack>

      <Button color="primary" variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </>
  );
};

export default EditCreatedPolicyForms;
