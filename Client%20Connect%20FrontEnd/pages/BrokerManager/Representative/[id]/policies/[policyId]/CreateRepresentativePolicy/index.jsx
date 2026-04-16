import { Button, Card, CardContent, CardHeader } from "@mui/material";
import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";
import { useRouter } from "next/router";
import React from "react";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useMutation, useQuery } from "react-query";
import { nodeSa, rmaAPI } from "src/AxiosParams";
import axios from "axios";
import AlertPopup from "components/Bits/AlertPopup";
import MainMemberForm from "components/PolicyForms/MainMemberForm";
import MembersDataGrid from "components/Containers/MembersDataGrid";
import AllocateBenefitsAndRates from "components/PolicyForms/AllocateBenefitsAndRates";
import DataParserForSubmission from "components/FormComponents.jsx/DataParserForSubmission";
import RepPolicy from "components/EditRMAPolicyForms/RepPolicy";
import SpouseDialog from "components/PolicyForms/SpouseDialog";
import ChildDialog from "components/PolicyForms/ChildDialog";
import SubMemberDialog from "components/PolicyForms/SubMemberDialog";
import BeneficiaryDialog from "components/PolicyForms/BeneficiaryDialog";
import useToken from "hooks/useToken";

const CreatePolicy = () => {
  const router = useRouter();

  const { id, policyId, type } = router.query;

  const accessToken = useToken();

  const [members, setMembers] = React.useState([]);

  const [policyDetails, setPolicyDetails] = useLocalStorage(
    `policyDetails${policyId}`,
    {
      joinDate: "",
      selectedCategory: "",
      coverAmount: "",
      productTypeId: type || "",
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
      providerId: policyId,
      commissionPercentage: "",
    },
  );

  // Parse Date for submission
  const SubmitData = () => {
    const membersArr = members.map((member) => {
      let docs = JSON.stringify(member?.PolicyMember?.supportDocument);
      return {
        ...member,
        supportDocument: docs,

        dateOfBirth: new Date(member?.dateOfBirth),
        PolicyMember: {
          notes: "",
          ...member.PolicyMember,
        },
      };
    });

    // if the item is empty, this will remove it from the array
    const newArr = membersArr.map((obj) => {
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
      members: newArr,
    };

    return data;
  };

  const CreatePolicyRequest = useMutation((data) => {
    return axios.post(`${nodeSa}/onboarding/policies`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  });

  const handleSubmit = () => {
    const data = DataParserForSubmission({ members, policyDetails });

    // IDs needs to be removed on Initial Create
    let removedIds = {
      ...data,
      members: data.members.map((member) => {
        delete member.id;
        return member;
      }),
    };

    CreatePolicyRequest.mutate(removedIds, {
      onSuccess: (data) => {
        // Clear Local Storage
        handleReset();
        setTimeout(() => {
          router.push(
            `/BrokerManager/UserPolicies/Created/${data.data.data.id}`,
          );
        }, 1000);
      },
    });
  };

  // reset Form
  const handleReset = () => {
    setPolicyDetails({
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
    });
    setMembers([]);
  };

  // check if all members have a benefit allocated

  const allMembersHaveBenefit = members.every(
    (member) =>
      member?.PolicyMember?.benefit && member?.PolicyMember?.statedBenefitId,
  );

  // Check For Main Member
  const hasMainMember = members.some(
    (member) => member?.PolicyMember?.memberTypeId === 1,
  );

  return (
    <>
      <PageHeader
        title="Scheme"
        subTitle="Manage Scheme"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Brokers",
            href: "/Brokers",
          },
          {
            title: "Scheme",
            href: `/Brokers/${id}/Representative/${policyId}`,
          },
        ]}
      />

      {/* {(allocateBenefitData.isLoading || AllocateBenefit.isLoading) && (
        <LinearProgress />
      )} */}

      <AlertPopup
        open={CreatePolicyRequest.isError}
        severity="error"
        message={"Error Creating Policy"}
        handleClose={() => CreatePolicy.reset()}
      />

      <AlertPopup
        open={CreatePolicyRequest.isSuccess}
        severity="success"
        message="Policy Created Successfully"
        handleClose={() => CreatePolicy.reset()}
      />

      <RepPolicy
        setPolicyDetails={setPolicyDetails}
        policyDetails={policyDetails}
      />

      {policyDetails.joinDate && policyDetails.productTypeId && (
        <>
          {!hasMainMember ? (
            <Card>
              <CardHeader title="Add Main Member" />

              <CardContent>
                <MainMemberForm
                  selectedCategory={policyDetails.selectedCategory}
                  setMembers={setMembers}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {members && members.length > 0 && (
                <Stack spacing={3}>
                  <MembersDataGrid setMembers={setMembers} members={members} />

                  <Stack direction="row" spacing={2}>
                    <SpouseDialog
                      edit={false}
                      client_type="spouse"
                      setMembers={setMembers}
                      waitingPeriod={waitingPeriod}
                      policyInceptionDate={policyInceptionDate}
                    />
                    <ChildDialog
                      selectedCategory={policyDetails.selectedCategory}
                      client_type="child"
                      setMembers={setMembers}
                      waitingPeriod={waitingPeriod}
                      policyInceptionDate={policyInceptionDate}
                    />
                    <SubMemberDialog
                      selectedCategory={policyDetails.selectedCategory}
                      client_type="extended"
                      setMembers={setMembers}
                      waitingPeriod={waitingPeriod}
                      policyInceptionDate={policyInceptionDate}
                    />

                    <BeneficiaryDialog setMembers={setMembers} />
                  </Stack>

                  <AllocateBenefitsAndRates
                    SubmitData={SubmitData()}
                    policyDetails={policyDetails}
                    productOptionId={policyDetails?.productOptionId}
                    members={members}
                    setMembers={setMembers}
                    commissionPercentage={"1"}
                  />

                  <Stack
                    sx={{ mt: 4 }}
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    {allMembersHaveBenefit && (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                      >
                        Submit For Approval
                      </Button>
                    )}

                    <Button color="inherit" onClick={handleReset}>
                      Reset
                    </Button>
                  </Stack>
                </Stack>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default CreatePolicy;
