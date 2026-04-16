import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Box,
} from "@mui/material";
import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import axios from "axios";
import AlertPopup from "components/Bits/AlertPopup";
import MainMemberForm from "components/PolicyForms/MainMemberForm";
import MembersDataGrid from "components/Containers/MembersDataGrid";
import PolicyButtons from "components/PolicyForms/PolicyButtons";
import AllocateBenefitsAndRates from "components/PolicyForms/AllocateBenefitsAndRates";
import CreatePolicyDetails from "components/PolicyForms/CreatePolicyDetails";
import DataParserForSubmission from "components/FormComponents.jsx/DataParserForSubmission";
import useToken from "hooks/useToken";
import ViewPolicyCard from "components/Containers/ViewPolicyCard";
import dayjs from "dayjs";

const CreatePolicy = () => {
  const router = useRouter();
  const accessToken = useToken();
  const { brokerId, schemeId, type } = router.query;
  const [productOptionId, setProductOptionId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [coverAmount, setCoverAmount] = useState("");
  const [refetchBenefits, setRefetchBenefits] = useState(false);

  // console.log("schemeId", schemeId);
  // console.log("brokerId", brokerId);
  // console.log("type", type);
  const [members, setMembers] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const today = dayjs();
  const isBeforeCutoff = today.date() < 16;

  const minDate = isBeforeCutoff
    ? today.startOf("month")
    : today.add(1, "month").startOf("month");

  const [policyDetails, setPolicyDetails] = useState({
    joinDate: minDate,
    selectedCategory: "3",
    coverAmount: "",
    productType: "Scheme",
    rules: "",
    adminPercentage: "",
    commissionPercentage: "",
    binderFeePercentage: "",
    productOptionId: "",
    providerInceptionDate: "",
    brokerageId: "",
    providerId: "",
    brokerageName: "",
    providerName: "",
  });
  const [providerInceptionDate, setProviderInceptionDate] = useState("");
  const [waitingPeriod, setWaitingPeriod] = useState(0);
  const [maxCover, setMaxCover] = useState(0);
  const [updatedMainMember, setUpdatedMainMember] = useState({});

  if (
    brokerId &&
    schemeId &&
    type &&
    !policyDetails.providerId &&
    !policyDetails.type &&
    !policyDetails.brokerId
  ) {
    setPolicyDetails({
      ...policyDetails,
      providerId: schemeId,
      productType: type,
      brokerId: brokerId,
    });
  }

  // Parse Date for submission
  const SubmitData = () => {
    // console.log(members);
    const membersArr = members.map((member) => {
      let docs = JSON.stringify(member?.PolicyMember?.supportDocument);
      return {
        ...member,
        supportDocument: docs,

        dateOfBirth: new Date(member?.dateOfBirth),
        PolicyMember: {
          notes: "",
          ...member?.PolicyMember,
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

  const CreatePolicyRequest = useMutation(
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

  const SavePolicyRequest = useMutation(
    (data) => {
      return axios.post(`${nodeSa}/onboarding/policies/save`, data, {
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
    const data = DataParserForSubmission({
      members,
      policyDetails,
      status: "Processing",
    });

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
          // change redirect endpoint for consistency from `/BrokerManager/UserPolicies/Created/${data.data.data.id}?policyId=${id}&schemeId=${schemeId}`
          router.push(`Policies/${data.data.data.id}`);
        }, 1000);
      },
    });
  };

  const handleSave = () => {
    const data = DataParserForSubmission({
      members,
      policyDetails,
      status: "Draft",
    });

    // IDs needs to be removed on Initial Create
    let removedIds = {
      ...data,
      members: data.members.map((member) => {
        delete member.id;
        return member;
      }),
    };

    // console.log(removedIds);

    SavePolicyRequest.mutate(removedIds, {
      onSuccess: (data) => {
        // Clear Local Storage
        handleReset();
        setTimeout(() => {
          // change redirect endpoint for consistency from `/BrokerManager/UserPolicies/Created/${data.data.data.id}?policyId=${id}&schemeId=${schemeId}`
          router.push(`/Onboarding/Policies/${data.data.data.id}`);
        }, 1000);
      },
    });
  };

  // reset Form
  const handleReset = () => {
    const today = dayjs();
    const isBeforeCutoff = today.date() < 16;
    const minDate = isBeforeCutoff
      ? today.startOf("month")
      : today.add(1, "month").startOf("month");
    setPolicyDetails({
      joinDate: minDate,
      selectedCategory: "3",
      coverAmount: "",
      productType: "Scheme",
      rules: "",
      adminPercentage: "",
      commissionPercentage: "",
      binderFeePercentage: "",
      productOptionId: "",
      providerInceptionDate: "",
      brokerageId: "",
      providerId: "",
      brokerageName: "",
      providerName: "",
    });
    setMembers([]);
    setTimeout(() => {
      router.push(`/Onboarding/CreatePolicy`);
    }, 500);
  };

  // check if all members have a benefit allocated

  // const allMembersHaveBenefit = members.map((member) => {
  //   return member?.PolicyMember?.benefit && member?.PolicyMember?.statedBenefitId;
  // });

  members?.every(
    (member) =>
      member?.PolicyMember?.benefit && member?.PolicyMember?.statedBenefitId
  );

  // Check For Main Member
  const hasMainMember = members?.some((member) => member?.memberTypeId === 1);

  // get benefits if policyDetails.productOptionId and selectedCategory is available
  const getBenefits = useQuery(
    ["getBenefitsMainOnly", productOptionId, coverAmount],
    async () =>
      await axios.get(
        `${nodeSa}/benefits/${productOptionId}?coverAmount=${coverAmount}&coverMemberTypeId=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken && !!productOptionId && !!coverAmount,
      onSuccess: (data) => {
        setBenefits(data?.data?.data);
        setRefetchBenefits(false);
        // console.log("getBenefits", data?.data?.data);
      },
    }
  );

  // rerun getBenefits if productOptionId and selectedCategory and coverAmount is changed
  useEffect(() => {
    if (refetchBenefits && productOptionId && coverAmount) {
      getBenefits.refetch();
    }
  }, [refetchBenefits, productOptionId, coverAmount, getBenefits]);

  return (
    <>
      <PageHeader
        title="Onboarding"
        subTitle="Create new Policy"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Select Scheme",
            href: `/Onboarding/CreatePolicy/${brokerId}`,
          },
          {
            title: "Create new Policy",
            href: `/Onboarding/CreatePolicy/${brokerId}/${schemeId}`,
          },
        ]}
      />

      {/* {(allocateBenefitData.isLoading || AllocateBenefit.isLoading) && (
        <LinearProgress />
      )} */}

      <AlertPopup
        open={CreatePolicyRequest.isError}
        severity="error"
        message={CreatePolicyRequest.error?.response?.data?.message}
        handleClose={() => CreatePolicy.reset()}
      />

      <AlertPopup
        open={CreatePolicyRequest.isSuccess}
        severity="success"
        message="Policy Created Successfully"
        handleClose={() => CreatePolicy.reset()}
      />
      <AlertPopup
        open={SavePolicyRequest.isSuccess}
        severity="success"
        message="Policy Saved Successfully"
        handleClose={() => SavePolicyRequest.reset()}
      />
      <AlertPopup
        open={SavePolicyRequest.isError}
        severity="error"
        message={SavePolicyRequest.error?.response?.data?.message}
        handleClose={() => SavePolicyRequest.reset()}
      />

      {/* {console.log("policyDetails", policyDetails)} */}

      <ViewPolicyCard policy={policyDetails} />

      <CreatePolicyDetails
        setPolicyDetails={setPolicyDetails}
        policyDetails={policyDetails}
        RMAPolicy={schemeId}
        setMaxCover={setMaxCover}
        setWaitingPeriod={setWaitingPeriod}
        setProviderInceptionDate={setProviderInceptionDate}
        setCoverAmount={setCoverAmount}
        setProductOptionId={setProductOptionId}
        setRefetchBenefits={setRefetchBenefits}
      />

      {policyDetails.coverAmount && policyDetails.joinDate && (
        <>
          {!hasMainMember ? (
            <Card>
              <CardHeader title="Add Main Member" />

              <CardContent>
                <MainMemberForm
                  selectedCategory={3}
                  setMembers={setMembers}
                  maxCover={maxCover}
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyDetails.joinDate}
                  benefits={benefits}
                  setUpdatedMainMember={setUpdatedMainMember}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {members && members.length > 0 && (
                <Stack spacing={3}>
                  <MembersDataGrid
                    setMembers={setMembers}
                    members={members}
                    maxCover={maxCover}
                    waitingPeriod={waitingPeriod}
                    policyInceptionDate={policyDetails.joinDate}
                    // benefits={benefits}
                    setUpdatedMainMember={setUpdatedMainMember}
                    updatedMainMember={updatedMainMember}
                  />

                  <PolicyButtons
                    policyDetails={policyDetails}
                    setPolicyDetails={setPolicyDetails}
                    members={members}
                    setMembers={setMembers}
                    waitingPeriod={waitingPeriod}
                    policyInceptionDate={policyDetails.joinDate}
                    benefits={benefits}
                    updatedMainMember={updatedMainMember}
                  />
                  {/* <Box sx={{ mt: 2 }}>
                    <AllocateBenefitsAndRates
                      productOptionId={policyDetails.productOptionId}
                      policyDetails={policyDetails}
                      setPolicyDetails={setPolicyDetails}
                      members={members}
                      setMembers={setMembers}
                    />
                  </Box> */}

                  <Alert severity="warning">
                    Benefits may change if the ID number on the Main Member is
                    not verified
                  </Alert>

                  <Stack
                    sx={{ mt: 3 }}
                    direction="row"
                    // justifyContent="space-between"
                    spacing={2}
                  >
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleSave}
                    >
                      Save As Draft
                    </Button>
                    <Button variant="contained" onClick={handleSubmit}>
                      Submit for Evaluation
                    </Button>
                    <Button color="inherit" onClick={handleReset}>
                      Reset
                    </Button>
                  </Stack>
                  {CreatePolicyRequest.isError && (
                    <>
                      <Alert severity="error">
                        {CreatePolicyRequest?.error?.response?.data?.message}
                      </Alert>
                    </>
                  )}
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
