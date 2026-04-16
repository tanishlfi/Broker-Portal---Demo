import AllocateBenefitsAndRates from "components/PolicyForms/AllocateBenefitsAndRates";

import MembersDataGrid from "components/Containers/MembersDataGrid";
import PolicyNotes from "components/FormComponents.jsx/PolicyNotes";
import EditPolicy from "components/EditRMAPolicyForms/EditPolicy";
import PolicyButtons from "components/PolicyForms/PolicyButtons";
import ContentItem from "components/Containers/ContentItem";

import { useLocalStorage } from "hooks/useLocalStorage";
import useClientType from "hooks/LookUps/useClientType";
import PageHeader from "components/Bits/PageHeader";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import useIdTypes from "hooks/LookUps/useIdTypes";
import React from "react";
import { useMutation, useQueries, useQuery } from "react-query";
import AlertPopup from "components/Bits/AlertPopup";
import { Stack } from "@mui/system";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Box,
  LinearProgress,
  List,
  ListSubheader,
  Paper,
  Button,
  Card,
  CardHeader,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import useToken from "hooks/useToken";

const EditRMAPolicy = () => {
  const router = useRouter();

  const accessToken = useToken();

  const { id, policyId, editPolicyId } = router.query;

  const policyStatuses = useQuery(
    `PolicyStatuses`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Policy/PolicyStatus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  const idTypes = useIdTypes();

  const { ClientTypes } = useClientType();

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

  const GetPolicyById = useQuery(
    `GetPolicyById${editPolicyId}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Policy/Policy/${editPolicyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  const policyQuery = useQuery(
    `policyQuery${editPolicyId}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${editPolicyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),

    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        console.log("data", data.data);
        setPolicyDetails((prev) => {
          return {
            ...prev,
            policyId: data.data.policyId,
            policyNumber: data?.data?.policyNumber,
            joinDate: data?.data?.policyInceptionDate,
            SchemeRolePlayerId: data?.data?.policyOwnerId,
            productTypeId: "aa9a11bc-bb63-44d4-a496-b879a9e1e590",
            providerId: data?.data?.policyId,
            coverAmount: "",
            selectedCategory: "",
            productOptionId: data?.data?.productOptionId,
            brokerageId: data?.data?.brokerageId,
            representativeId: data?.data?.representativeId,
            providerInceptionDate: data?.data?.policyInceptionDate,
            adminPercentage: data?.data?.adminPercentage,
            commissionPercentage: data?.data?.commissionPercentage,
            binderFeePercentage: data?.data?.binderFeePercentage,
            regularInstallmentDayOfMonth:
              data?.data?.regularInstallmentDayOfMonth,
            paymentFrequencyId: data?.data?.paymentFrequencyId,
            premium: data?.data?.premium,
            notes: "",
          };
        });
      },
    }
  );

  const policyIsActive = policyStatuses?.data?.data.find((status) =>
    status?.id === policyQuery?.data?.data.policyStatusId ? status : null
  );

  const [members, setMembers] = React.useState([]);

  const [mainMember, setMainMember] = React.useState("");

  useQuery(
    `GetInsuredLifeByPolicyId${editPolicyId}`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${editPolicyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken,
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,
      onSuccess: (data) => {
        setMainMember(
          data?.data?.filter((item) =>
            item.rolePlayerTypeId === 10 ? item : null
          )[0]?.statedBenefitId
        );

        console.log("data.data", data.data);
        data.data.forEach((item, index) => {
          setMembers((prev) => [
            ...prev,
            {
              id: index + 1,
              title: item.rolePlayer.person.title,
              firstName: item.rolePlayer.person.firstName,
              surname: item.rolePlayer.person.surname,
              idNumber: item.rolePlayer.person.idNumber
                ? item.rolePlayer.person.idNumber
                : item.rolePlayer.person.dateOfBirth,
              dateOfBirth: new Date(item.rolePlayer.person.dateOfBirth),
              idTypeId: item.rolePlayer.person.idType === 1 ? 1 : 2,
              isVopdVerified: item.rolePlayer.person.isVopdVerified,
              dateVopdVerified: item.rolePlayer.person.dateVopdVerified
                ? item.rolePlayer.person.dateVopdVerified
                : null,
              cellNumber: item.rolePlayer.cellNumber,
              emailAddress: item.rolePlayer.emailAddress,
              preferredCommunicationTypeId:
                item.rolePlayer.preferredCommunicationTypeId,
              tellNumber: item.rolePlayer.tellNumber,
              gender: item.rolePlayer.person.gender
                ? item.rolePlayer.person.gender
                : "",
              rolePlayerId: item.rolePlayerId,
              PolicyMember: {
                memberTypeId: returnMemberType(item.rolePlayerTypeId),
                isBeneficiary: item.rolePlayer.person.isBeneficiary,
                statedBenefitId: item.statedBenefitId,
                benefitId: item.statedBenefitId,
                notes: [],
              },
            },
          ]);
        });
      },
    }
  );

  const getRMAbenefitById = useQuery(
    `getRMAbenefitById${mainMember}`,
    () =>
      axios.get(`${nodeSa}/onboarding/benefit_rules/rma/${mainMember}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),

    {
      enabled: mainMember && policyDetails?.productOptionId ? true : false,

      onSuccess: (data) => {
        let Product = data?.data?.data.find(
          (item) => item?.productOptionId === policyDetails?.productOptionId
        );

        setPolicyDetails({
          ...policyDetails,
          selectedCategory: Product?.categoryId,
          coverAmount: Product?.benefitAmount[0],
        });
      },
    }
  );

  const getRules = useQuery(
    `GetPolicyRules${policyDetails.productOptionId}`,
    async () =>
      await axios.get(
        `${nodeSa}/onboarding/benefit_rules/ByProductOptionId/${policyDetails.productOptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: policyDetails.productOptionId ? true : false && !!accessToken,
      onSuccess: (data) => {
        setPolicyDetails((prev) => {
          return {
            ...prev,
            rules: data?.data?.data.find(
              (item) => item.productOptionId === policyDetails.productOptionId
            ),
          };
        });
      },
    }
  );

  console.log("policyDetails", policyDetails);

  const SendPolicy = useMutation(
    (data) =>
      axios.post(`${nodeSa}/edit/policies`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );

  const SubmitData = () => {
    const membersArr = members.map((member) => {
      return {
        ...member,
        dateOfBirth: new Date(member?.dateOfBirth),
        dateVopdVerified: member.dateVopdVerified
          ? new Date(member?.dateVopdVerified)
          : null,
        PolicyMember: {
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

  const handleSubmit = () => {
    const subData = {
      ...SubmitData(),
      members: SubmitData().members.map((member) => {
        delete member.id;
        return {
          ...member,
        };
      }),
    };

    SendPolicy.mutate(subData, {
      onSuccess: (data) => {
        setTimeout(() => {
          router.push(`/BrokerManager/UserPolicies/Edited/${policyId}`);
        }, 1000);
      },
    });
  };

  const allMembersHaveBenefit = members.every(
    (member) =>
      member.PolicyMember.benefit && member.PolicyMember.statedBenefitId
  );

  const getEditedPolicyById = (accessToken, policyId) => {
    return axios.get(`${nodeSa}/edit/policies/ByPolicyId/${policyId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const getEditedPolicy = useQuery(
    `getEditedPolicy${policyId}`,
    () => getEditedPolicyById(accessToken, policyId),
    {
      enabled: policyId ? true : false,
    }
  );

  useQueries(
    members?.map((member, index) => ({
      queryKey: `benefitData${index}`,
      queryFn: () =>
        axios.get(
          `${rmaAPI}/clc/api/Product/Benefit/${member.PolicyMember.statedBenefitId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        ),
      enabled:
        member.PolicyMember.statedBenefitId &&
        policyDetails.commissionPercentage !== null
          ? true
          : false,

      onSuccess: (data) => {
        members[index].PolicyMember.benefit = data?.data?.name;
        members[index].PolicyMember.benefitRate =
          policyDetails.commissionPercentage &&
          Number(data?.data?.benefitRates[0]?.baseRate) /
            Number(1 - policyDetails.commissionPercentage).toFixed(1);
        setMembers([...members]);
      },
    })),
    {
      enabled: members?.length > 0 ? true : false,
    }
  );

  if (
    getRMAbenefitById.isLoading ||
    getRules.isLoading ||
    getEditedPolicy.isLoading
  )
    return <LinearProgress />;

  return (
    <div>
      <PageHeader
        title="User"
        subTitle="Manage Policy"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Schemes",
            href: `BrokerManager/SchemaManagement/${id}`,
          },
          {
            title: `Schema Management ${id}`,
            href: `/BrokerManager/SchemaManagement/${id}`,
          },
        ]}
      />

      {getEditedPolicy?.data?.data?.data && (
        <Card
          sx={{
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: "red",
            mb: 2,
          }}>
          <CardActionArea
            onClick={() => {
              router.push(
                `/BrokerManager/UserPolicies/Edited/${getEditedPolicy?.data?.data?.data?.id}`
              );
            }}>
            <CardHeader
              title="Policy Edit Awaiting Approval"
              subheader="Please wait for approval before making any changes"
            />
            <CardContent>
              <Typography align="center" variant="h6" color="text.secondary">
                Click here to view the policy
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      )}

      <AlertPopup
        message="Policy Updated Successfully"
        severity="success"
        open={SendPolicy?.isSuccess}
      />

      <AlertPopup
        message="Policy Update Failed"
        severity="error"
        open={SendPolicy?.isError}
      />

      {GetPolicyById?.isLoading || idTypes?.loadingIdTypes ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <Stack spacing={2} sx={{ pb: 2 }}>
          <Card>
            <List
              dense
              sx={{
                width: "100%",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Policy Details
                </ListSubheader>
              }>
              <ContentItem
                title="Policy ID"
                value={GetPolicyById?.data?.data?.policyId}
              />
              <ContentItem
                title="Brokerage Name"
                value={GetPolicyById?.data?.data?.brokerageName}
              />
              <ContentItem
                title="Policy Number"
                value={GetPolicyById.data?.data?.policyNumber}
              />
              <ContentItem
                title=" Policy Client Type"
                value={
                  ClientTypes?.find(
                    (x) =>
                      x.id ===
                      GetPolicyById?.data?.data?.policyOwner?.clientType
                  )?.name
                }
              />
            </List>
          </Card>
        </Stack>
      )}

      <EditPolicy
        getRules={getRules}
        setPolicyDetails={setPolicyDetails}
        policyDetails={policyDetails}
        RMAPolicy={policyId}
      />

      <Box sx={{ width: "100%", mt: 2 }}>
        <MembersDataGrid
          disabledFields={{
            mainMember: {
              idNumber: true,
              idTypeId: true,
              firstName: true,
              surname: true,
              dateOfBirth: true,
            },
          }}
          members={members}
          setMembers={setMembers}
        />
        <PolicyButtons
          policyDetails={policyDetails}
          setPolicyDetails={setPolicyDetails}
          members={members}
          setMembers={setMembers}
        />

        <PolicyNotes policyId={policyId} />

        <Stack sx={{ mt: 4 }} direction="row">
          <AllocateBenefitsAndRates
            SubmitData={SubmitData()}
            policyDetails={policyDetails}
            productOptionId={policyDetails?.productOptionId}
            members={members}
            setMembers={setMembers}
            commissionPercentage={policyDetails?.commissionPercentage}
          />
        </Stack>

        <Stack sx={{ mt: 4 }}>
          {allMembersHaveBenefit && policyIsActive?.name === "Active" && (
            <Button
              disabled={true}
              variant="contained"
              color="warning"
              onClick={() => handleSubmit()}>
              Submit
            </Button>
          )}
        </Stack>
      </Box>
    </div>
  );
};

export default EditRMAPolicy;

const returnMemberType = (memberTypeId) => {
  switch (memberTypeId) {
    case 10:
      return 1;
    case 11:
      return 2;
    case 32:
      return 3;
    case 38:
      return 4;
    default:
      return 5;
  }
};
