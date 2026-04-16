import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import ConfirmEditsTable from "components/Containers/ConfirmEditsTable";
import { Alert, Button, LinearProgress, Stack } from "@mui/material";
import EditPolicy from "components/EditRMAPolicyForms/EditPolicy";
import PolicyButtons from "components/PolicyForms/PolicyButtons";
import PolicyNotes from "components/FormComponents.jsx/PolicyNotes";
import AllocateBenefitsAndRates from "components/PolicyForms/AllocateBenefitsAndRates";
import AlertPopup from "components/Bits/AlertPopup";
import useToken from "hooks/useToken";
import DifferencesInPolicies from "components/FormComponents.jsx/DifferencesInPolicies";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import ViewPolicyCard from "components/Containers/ViewPolicyCard";

const getEditedPolicyById = (accessToken, policyId) => {
  return axios.get(`${nodeSa}/edit/policies/ByPolicyId/${policyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const getRMAPolicy = (accessToken, policyId) => {
  return axios.get(
    `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${policyId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const AllEditedPolicies = () => {
  const router = useRouter();

  const { policyId: id } = router.query;

  const accessToken = useToken();

  const [RMAMembers, setRMAMembers] = useState([]);

  const [RMAPolicyDetails, setRMAPolicyDetails] = useState({});

  const [NodeMembers, setNodeMembers] = useState([]);

  const [NodePolicyDetails, setNodePolicyDetails] = useState({});

  const getPolicy = useQuery(
    ["getEditedPolicyById", id],
    () => getEditedPolicyById(accessToken, id),
    {
      enabled: !!accessToken,

      onSuccess: (data) => {
        setNodePolicyDetails(data.data.data);
        setNodeMembers(data.data.data?.members);
      },
    }
  );

  const getRMA = useQuery(
    ["getRMAPolicyById", NodePolicyDetails?.providerId],
    () => getRMAPolicy(accessToken, NodePolicyDetails?.providerId),
    {
      enabled: !!accessToken && NodePolicyDetails?.providerId ? true : false,
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,

      onSuccess: (data) => {
        data?.data?.forEach((item, index) => {
          setRMAPolicyDetails({
            ...RMAPolicyDetails,
            date: item.startDate,
          });

          setRMAMembers((prev) => [
            ...prev,
            {
              dateOfBirth: new Date(item.rolePlayer.person.dateOfBirth),
              dateOfDeath: item.rolePlayer.person.dateOfDeath || "",
              dateVopdVerified: item.rolePlayer.person.dateVopdVerified || "",
              supportDocument: [],
              id: item.rolePlayerId,
              rolePlayerId: item.rolePlayer.rolePlayerId,
              idTypeId: item.rolePlayer.person.idType,
              idNumber: item.rolePlayer.person.idNumber,
              firstName: item.rolePlayer.person.firstName,
              surname: item.rolePlayer.person.surname,
              deathCertificateNumber:
                item.rolePlayer.person.deathCertificateNumber || "",
              isVopdVerified: item.rolePlayer.person.isVopdVerified,
              gender: item.rolePlayer.person.gender || "",
              isStudent: item.rolePlayer.person.isStudying,
              isDisabled: item.rolePlayer.person.isDisabled,
              preferredCommunicationTypeId:
                item.rolePlayer.preferredCommunicationTypeId || "",
              tellNumber: item.rolePlayer.tellNumber,
              cellNumber: item.rolePlayer.cellNumber,
              emailAddress: item.rolePlayer.emailAddress,
              addressTypeId: "",
              addressLine1: "",
              addressLine2: "",
              postalCode: "",
              city: "",
              province: "",
              countryId: 1,
              createdBy: item.createdBy,
              createdAt: item.createdDate,
              updatedBy: item.createdBy,
              updatedAt: item.createdDate,
              deletedAt: item.deletedDate,
              PolicyMember: {
                exceptions: [],

                policyId: item.policyId,
                memberId: item.rolePlayerId,
                PolicyHolderMemberId: null,
                status: "",
                startDate: item.startDate.split("T")[0], // formatting startDate
                endDate: item.endDate,
                memberType: "",
                isBeneficiary: item.rolePlayer.person.isBeneficiary,
                benefitRate: 0,
                roleplayerTypeId: item.rolePlayerTypeId,
                statedBenefitId: item.statedBenefitId,
                statedBenefit: null,
                benefit: "",
                CoverAmount: "",
                premium: null,
                fileRow: null,
                createdBy: "",
                updatedBy: "",
                createdAt: "",
                updatedAt: "",
              },
            },
          ]);
        });
      },
    }
  );

  const CleanObj = (arr) => {
    let newArr = arr?.map((item) => {
      return {
        ...item,
        dateOfBirth: new Date(item.dateOfBirth)?.toISOString().slice(0, 10),
      };
    });

    return newArr?.map((obj) => {
      const newObj = { ...obj };
      for (const prop in newObj) {
        if (newObj[prop] === null) {
          newObj[prop] = "";
        }
      }
      return newObj;
    });
  };

  const diffArray = DifferencesInPolicies(
    CleanObj(RMAMembers),
    CleanObj(NodeMembers)
  );

  const getRules = useQuery(
    `GetPolicyRules`,
    async () =>
      await axios.get(
        `${nodeSa}/onboarding/benefit_rules/ByProductOptionId/${NodePolicyDetails.productOptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: NodePolicyDetails?.productOptionId ? true : false,
      onSuccess: (data) => {
        setNodePolicyDetails((prev) => {
          return {
            ...prev,
            rules: data?.data?.data.find(
              (item) =>
                item.productOptionId === NodePolicyDetails.productOptionId
            ),
          };
        });
      },
    }
  );

  const clearData = () => {
    // set PolicyDetails Status to Processing

    let clear = NodeMembers.map((obj) => {
      let newObj = { ...obj };
      // If policyId doesn't exist, add a policyId property with the desired value
      if (!newObj.PolicyMember.policyId) {
        newObj = {
          ...newObj,
          PolicyMember: {
            ...newObj.PolicyMember,
            policyId: Number(id),
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
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
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
    let clearPolicyDetails = { ...NodePolicyDetails, status: "Processing" };
    const data = {
      ...clearPolicyDetails,
      members: clear,
    };

    return data;
  };

  const SendPolicy = useMutation((data) =>
    axios.post(`${nodeSa}/edit/policies`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  );

  const handleSubmit = () => {
    SendPolicy.mutate(clearData(), {
      onSuccess: (data) => {
        setNodePolicyDetails(data.data.data);
        setNodeMembers(data.data.data?.members);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Approve RMA Policy Edit"
        subtitle="Approve RMA Policy Edit"
      />

      <ViewPolicyCard policy={NodePolicyDetails} />

      <AlertPopup
        open={SendPolicy.isError}
        severity="error"
        message={SendPolicy.error?.response?.data?.message}
      />
      <AlertPopup
        open={SendPolicy.isSuccess}
        severity="success"
        message="Policy Updated Successfully"
      />

      {getPolicy.isLoading || getRMA.isLoading || getRules.isLoading ? (
        <LinearProgress />
      ) : (
        <Stack>
          {NodePolicyDetails && (
            <>
              <Stack sx={{ mb: 2 }}>
                <AppPolicyStatusChip status={NodePolicyDetails?.status} />
                {NodePolicyDetails?.statusNote && (
                  <Alert severity="info" sx={{ my: 2 }} variant="outlined">
                    {NodePolicyDetails?.statusNote}
                  </Alert>
                )}
              </Stack>

              <EditPolicy
                getRules={getRules}
                setPolicyDetails={setNodePolicyDetails}
                policyDetails={NodePolicyDetails}
                RMAPolicy={id}
              />
            </>
          )}

          {NodeMembers && NodeMembers.length > 0 ? (
            <>
              <ConfirmEditsTable
                setMembers={setNodeMembers}
                members={CleanObj(NodeMembers)}
                diffArray={diffArray}
              />

              <PolicyButtons
                policyDetails={NodePolicyDetails}
                setPolicyDetails={setNodePolicyDetails}
                members={NodeMembers}
                setMembers={setNodeMembers}
              />

              <PolicyNotes policyId={id} />
              <AllocateBenefitsAndRates
                SubmitData={NodeMembers}
                policyDetails={NodePolicyDetails}
                productOptionId={NodePolicyDetails?.productOptionId}
                members={NodeMembers}
                setMembers={setNodeMembers}
                commissionPercentage={NodePolicyDetails?.commissionPercentage}
              />

              <Stack
                sx={{ mt: 3 }}
                direction="row"
                justifyContent="space-between">
                {NodePolicyDetails?.status === "Processing" && (
                  <>
                    <PolicyButton
                      setNodePolicyDetails={setNodePolicyDetails}
                      setNodeMembers={setNodeMembers}
                      label="Return To Draft"
                      status="Draft"
                      statusNote="User Returned To Draft"
                      data={clearData()}
                    />
                  </>
                )}
                {NodePolicyDetails?.status === "Draft" && (
                  <>
                    <PolicyButton
                      setNodePolicyDetails={setNodePolicyDetails}
                      setNodeMembers={setNodeMembers}
                      label="Send for Processing"
                      status="Processing"
                      color="warning"
                      statusNote="User Sent For Processing"
                      data={clearData()}
                    />
                  </>
                )}
                {(NodePolicyDetails.status === "Error" ||
                  NodePolicyDetails.status === "Issue" ||
                  NodePolicyDetails.status === "Rejected") && (
                  <>
                    <PolicyButton
                      setNodePolicyDetails={setNodePolicyDetails}
                      setNodeMembers={setNodeMembers}
                      label="Send for Processing"
                      status="Processing"
                      color="warning"
                      statusNote="User Sent For Processing"
                      data={clearData()}
                    />
                  </>
                )}

                {NodePolicyDetails?.status === "Ready" && (
                  <>
                    <PolicyButton
                      setNodePolicyDetails={setNodePolicyDetails}
                      setNodeMembers={setNodeMembers}
                      label="Submit to RMA"
                      status="Submitted"
                      color="success"
                      statusNote="User Submitted to RMA"
                      data={clearData()}
                    />
                  </>
                )}
              </Stack>
            </>
          ) : (
            <Alert>No Policy Data</Alert>
          )}
        </Stack>
      )}
    </div>
  );
};

export default AllEditedPolicies;

const PolicyButton = ({
  setNodePolicyDetails,
  setNodeMembers,
  label,
  status,
  statusNote,
  data,
  color,
}) => {
  const accessToken = useToken();

  const SendPolicy = useMutation((data) =>
    axios.post(`${nodeSa}/edit/policies`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
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
    <Stack sx={{ mt: 3 }} direction="row" justifyContent="space-between">
      <Button
        onClick={() => {
          handleSubmit();
        }}
        size="large"
        variant="contained"
        color={color}>
        {label}
      </Button>
    </Stack>
  );
};
