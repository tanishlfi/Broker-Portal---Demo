import { useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import EditMainMemberFormWrapper from "components/EditRMAPolicyForms/EditMainMemberFormWrapper";
import EditSubMemberFormWrapper from "components/EditRMAPolicyForms/EditSubMemberFormWrapper";
import EditPolicy from "components/EditRMAPolicyForms/EditPolicy";
import useClientType from "hooks/LookUps/useClientType";
import useIdTypes from "hooks/LookUps/useIdTypes";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import useRolePlayerTypes from "hooks/LookUps/useRolePlayerTypes";

const UserPolicy = () => {
  const router = useRouter();

  const { id, Reps, policyId } = router.query;

  const idTypes = useIdTypes();

  const { ClientTypes } = useClientType();

  const accessToken = useToken();

  const GetPolicyById = useQuery(
    `GetPolicyById${Reps}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Policy/Policy/${policyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    },
  );

  const GetInsuredLifeByPolicyId = useQuery(
    `GetInsuredLifeByPolicyId${Reps}`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${policyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    {
      enabled: !!accessToken,
    },
  );

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
            title: "Brokers",
            href: "/Brokers",
          },
          {
            title: `${id}`,
            href: `/Brokers/${id}`,
          },
          {
            title: `Users`,
            href: `/Brokers/${id}/Users`,
          },
          {
            title: `${Reps}`,
            href: `/Brokers/${id}/Users/${Reps}`,
          },
          {
            title: `Policy`,
            href: `/Brokers/${id}/Users/${Reps}/Policy/${policyId}`,
          },
          {
            title: `${policyId}`,
            href: `/Brokers/${id}/Users/${Reps}/Policy/${policyId}`,
          },
        ]}
      />

      {GetPolicyById.isLoading ||
      GetPolicyById.isLoading ||
      idTypes.loadingIdTypes ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          <Card>
            <CardHeader title="Policy Details" />
            <CardContent>
              <Typography variant="h6">Policy Details</Typography>
              <Typography variant="body1">
                Policy ID: {GetPolicyById?.data?.data?.policyId}
              </Typography>
              <Typography variant="body1">
                Brokerage Name: {GetPolicyById?.data?.data?.brokerageName}
              </Typography>
              <Typography variant="body1">
                Policy Number: {GetPolicyById.data?.data?.policyNumber}
              </Typography>
              <Typography variant="body1">
                Policy Tenant Id: {GetPolicyById.data?.data?.tenantId}
              </Typography>
              <Typography variant="body1">
                Policy insurerId: {GetPolicyById.data?.data?.insurerId}
              </Typography>
              <Typography variant="body1">
                Policy quoteId: {GetPolicyById.data?.data?.quoteId}
              </Typography>
              <Typography variant="body1">
                Policy productOptionId:{" "}
                {GetPolicyById.data?.data?.productOptionId}
              </Typography>
              <Typography variant="body1">
                Policy policyOwnerId: {GetPolicyById.data?.data?.policyOwnerId}
              </Typography>
              <Typography variant="body1">
                Policy clientType:{" "}
                {
                  ClientTypes?.find(
                    (x) =>
                      x.id ===
                      GetPolicyById?.data?.data?.policyOwner?.clientType,
                  )?.name
                }
              </Typography>

              <EditPolicy
                productOptions={GetPolicyById?.data?.data?.productOption}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Main Member Details" />
            <CardContent>
              <EditMainMemberFormWrapper
                idTypes={idTypes}
                data2={GetPolicyById?.data?.data}
              />
            </CardContent>
          </Card>

          {GetInsuredLifeByPolicyId?.data?.data &&
            GetInsuredLifeByPolicyId?.data?.data.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  {item?.rolePlayerTypeId !== 10 && (
                    <Card>
                      <CardHeader
                        title={item?.rolePlayer.displayName}
                        action={
                          <RolePlayerChip
                            rolePlayerTypeId={item?.rolePlayerTypeId}
                          />
                        }
                      />
                      <CardContent>
                        <EditSubMemberFormWrapper
                          data={item}
                          idTypes={idTypes}
                        />
                      </CardContent>
                    </Card>
                  )}
                </React.Fragment>
              );
            })}

          {/* <Card sx={{ my: 5 }}>
            <pre>
              {JSON.stringify(GetInsuredLifeByPolicyId?.data?.data, null, 2)}
            </pre>
          </Card> */}
        </Stack>
      )}
    </div>
  );
};

export default UserPolicy;

const RolePlayerChip = ({ rolePlayerTypeId }) => {
  const { RolePlayer, loadingRolePlayers, RolePlayersError } =
    useRolePlayerTypes();

  if (loadingRolePlayers) {
    return <Chip label="Loading" />;
  }

  if (RolePlayersError) {
    return <Chip label="Error" />;
  }

  return (
    <Chip
      label={
        RolePlayer?.find((x) => x.rolePlayerTypeId === rolePlayerTypeId)?.name
      }
    />
  );
};
