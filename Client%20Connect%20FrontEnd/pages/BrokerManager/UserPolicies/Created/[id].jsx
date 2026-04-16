import {
  Button,
  List,
  ListSubheader,
  Paper,
  Stack,
  Tooltip,
  Alert,
} from "@mui/material";
import axios from "axios";
import AlertPopup from "components/Bits/AlertPopup";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import PageHeader from "components/Bits/PageHeader";
import ConfirmMembersTable from "components/Containers/ConfirmMembersTable";
import ContentItem from "components/Containers/ContentItem";
import ViewPolicyCard from "components/Containers/ViewPolicyCard";
import NoMainMember from "components/FormComponents.jsx/NoMainMember";
import PolicyNotes from "components/FormComponents.jsx/PolicyNotes";
import RejectPolicy from "components/FormComponents.jsx/RejectPolicy";

import SavePolicyWithoutValidation from "components/FormComponents.jsx/SavePolicyWithoutValidation";
import AllocateBenefitsAndRates from "components/PolicyForms/AllocateBenefitsAndRates";
import CreatePolicyDetails from "components/PolicyForms/CreatePolicyDetails";
import PolicyButtons from "components/PolicyForms/PolicyButtons";
// import PolicyDetailsSelector2 from "components/PolicyForms/PolicyDetailsSelector2";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { nodeSa } from "src/AxiosParams";
import { useUser } from "@auth0/nextjs-auth0/client";

const ApprovePolicy = () => {
  const router = useRouter();

  const { user } = useUser();

  const queryClient = useQueryClient();

  const { id } = router.query;
  const accessToken = useToken();

  const [policyDetails, setPolicyDetails] = useState({
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

  const [members, setMembers] = useState([]);

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
      enabled: !!accessToken && !!id,

      onSuccess: (data) => {
        setPolicyDetails({
          ...data.data.data,
          categoryId: data.data.data?.selectedCategory,
        });
        setMembers(data?.data?.data?.members);
      },
    },
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
      onSuccess: () => {
        queryClient.invalidateQueries(`getPolicyDetails`);
      },
      // onError: (data) => {
      //   setPolicyDetails({
      //     ...data.data.data,
      //     categoryId: data.data.data?.categoryId,
      //   });
      //   setMembers(data?.data?.data?.members);
      //   return;
      // },
    },
  );

  const clearData = () => {
    // set PolicyDetails Status to Processing

    let clear = members?.map((obj) => {
      let newObj = { ...obj };
      // If policyId doesn't exist, add a policyId property with the desired value
      if (!newObj.PolicyMember.policyId) {
        newObj = {
          ...newObj,
          PolicyMember: {
            ...newObj.PolicyMember,
            policyId: id,
          },
        };
      }
      for (const prop in newObj) {
        if (newObj[prop] === "") {
          newObj[prop] = null;
        }
      }
      if (
        typeof newObj.id === "string" &&
        newObj.id.match(
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        )
      ) {
        // If the id is a UUID, remove it
        const { id, ...rest } = newObj;
        return rest;
      } else if (typeof newObj.id === "number") {
        // If the id is a number, keep it
        return newObj;
      }
      return newObj;
    });
    let clearPolicyDetails = { ...policyDetails, status: "Processing" };
    const data = {
      ...clearPolicyDetails,
      members: clear,
    };

    return data;
  };

  return (
    <div>
      <Stack sx={{ mb: 4 }}>
        <PageHeader
          title="User"
          subTitle="Manage Policy"
          breadcrumbs={[
            {
              title: "Home",
              href: "/",
            },
            {
              title: "Policies",
              href: `Policies/`,
            },
            {
              title: `Policies`,
              href: `Policies/${id}`,
            },
          ]}
        />

        <Button
          onClick={() =>
            router.push(
              `/BrokerManager/SchemaManagement/${policyDetails.brokerageId}/Schema/${policyDetails.parentPolicyId}/CreateNewPolicy?type=${policyDetails.productTypeId}`,
            )
          }
        >
          Add Another Policy
        </Button>

        <ViewPolicyCard policy={policyDetails} />
        <Stack sx={{ mb: 2 }}>
          {policyDetails?.status && (
            <AppPolicyStatusChip status={policyDetails?.status} />
          )}
          <Alert severity="info" sx={{ my: 2 }} variant="outlined">
            {policyDetails?.statusNote}
          </Alert>
          {policyDetails?.status === "Processing" && (
            <>
              <Stack direction="row">
                {policyDetails?.checks?.map((check, index) => {
                  return (
                    <ContentItem
                      key={index}
                      title={check.checkDescr}
                      value={
                        <Tooltip
                          title={
                            check.status === true ? "Complete" : "Processing"
                          }
                        >
                          <>
                            {check.status === true ? "Complete" : "Processing"}
                          </>
                        </Tooltip>
                      }
                    />
                  );
                })}
              </Stack>
            </>
          )}
        </Stack>

        <CreatePolicyDetails
          policyDetails={policyDetails}
          setPolicyDetails={setPolicyDetails}
          RMAPolicy={policyDetails.providerId}
        />

        {/* <ViewPolicyCard scheme={id} /> */}

        {/* <PolicyDetailsSelector2
          productOptionId={getPolicyDetails?.data?.data?.data?.productOptionId}
          policyDetails={policyDetails}
          setPolicyDetails={setPolicyDetails}
        /> */}

        {members && members.length > 0 && (
          <>
            <NoMainMember members={members} setMembers={setMembers} />
            <ConfirmMembersTable setMembers={setMembers} members={members} />
            <PolicyButtons
              policyDetails={policyDetails}
              members={members}
              setMembers={setMembers}
            />
            <PolicyNotes policyId={getPolicyDetails?.data?.data?.data?.id} />
          </>
        )}

        <Stack direction="row">
          <AllocateBenefitsAndRates
            productOptionId={
              getPolicyDetails?.data?.data?.data?.productOptionId
            }
            policyDetails={policyDetails}
            setPolicyDetails={setPolicyDetails}
            members={members}
            setMembers={setMembers}
          />
        </Stack>

        <Stack sx={{ mt: 4 }} direction="row" justifyContent="space-between">
          {(policyDetails.status === "Processing" ||
            policyDetails.status === "Draft") && (
            <PolicyButton
              data={clearData()}
              setNodePolicyDetails={setPolicyDetails}
              setNodeMembers={setMembers}
              label="Save As Draft"
              status="Draft"
              statusNote={`Set To Draft by ${user.email}`}
              variant="outlined"
              color="inherit"
            />
          )}

          {(policyDetails.status === "Error" ||
            policyDetails.status === "Draft" ||
            policyDetails.status === "Rejected") && (
            <PolicyButton
              data={clearData()}
              setNodePolicyDetails={setPolicyDetails}
              setNodeMembers={setMembers}
              label="Submit Changes For Processing"
              status="Processing"
              statusNote={`Sent for Processing by ${user.email}`}
              color="secondary"
            />
          )}

          {policyDetails.status === "Ready" && (
            <PolicyButton
              data={clearData()}
              setNodePolicyDetails={setPolicyDetails}
              setNodeMembers={setMembers}
              label="Submit For Approval"
              status="Submitted"
              statusNote={`Sent for Approval by ${user.email}`}
              color="primary"
            />
          )}

          <RejectPolicy policy={{ members, ...policyDetails }} />
        </Stack>
      </Stack>
      <AppPolicyStatusChip status={policyDetails?.status} />
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
    </div>
  );
};

export default ApprovePolicy;

const PolicyButton = ({
  setNodePolicyDetails,
  setNodeMembers,
  label,
  status,
  statusNote,
  data,
  color,
  noValidate,
  variant,
}) => {
  const accessToken = useToken();

  let url = `${nodeSa}/onboarding/policies`;

  if (noValidate) {
    url = `${nodeSa}/onboarding/policies/save`;
  }

  const SendPolicy = useMutation((data) =>
    axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );

  const handleSubmit = () => {
    data.status = status;
    data.statusNote = statusNote;

    SendPolicy.mutate(data, {
      onSuccess: (data) => {
        setNodePolicyDetails(data.data.data);
        setNodeMembers(data.data.data?.members);
      },
    });
  };

  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between">
        <Button
          onClick={() => {
            handleSubmit();
          }}
          size="large"
          variant={variant ? variant : "contained"}
          color={color}
        >
          {label}
        </Button>
      </Stack>

      <AlertPopup
        severity="success"
        open={SendPolicy.isSuccess}
        message="Policy Updated Successfully"
      />

      <AlertPopup
        severity="error"
        open={SendPolicy.isError}
        message="Error Updating Policy"
      />
    </Stack>
  );
};
