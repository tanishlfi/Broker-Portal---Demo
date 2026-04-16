import PolicyStatusChip from "components/Bits/PolicyStatusChip";
import { useUser } from "@auth0/nextjs-auth0/client";
import ContentItem from "components/Containers/ContentItem";
import PageHeader from "components/Bits/PageHeader";
import { rmaAPI } from "src/AxiosParams";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import React from "react";
import {
  DataGridPremium,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import {
  Alert,
  Button,
  Grid,
  LinearProgress,
  List,
  ListSubheader,
  Paper,
  Stack,
  Typography,
  Card,
} from "@mui/material";
import useToken from "hooks/useToken";

const Schema = ({ loading }) => {
  const router = useRouter();
  const { user } = useUser();

  const accessToken = useToken();

  const { id, schemeId } = router.query;

  const BrokerId =
    user?.rmaAppUserMetadata?.BrokerageIds?.length > 0 &&
    user?.rmaAppUserMetadata?.BrokerageIds[0];

  // if BrokerId is set and BrokerId is not equal to id, redirect to BrokerManager page with BrokerId
  // console.log("BrokerId", String(BrokerId) === id);
  if (BrokerId && String(BrokerId) !== id) {
    router.push(`/Brokers/${BrokerId}/Schemes`);
  }

  const policyQuery = useQuery(
    `SchemeById${schemeId}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${schemeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  const getChildPolicyIds = useQuery(
    `getChildPolicyIds${schemeId}`,
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/GetChildPoliciesMinimumData/${schemeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),

    {
      enabled: !!accessToken,
    }
  );

  // console.log("getChildPolicyIds", getChildPolicyIds);

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

  const columns = [
    {
      field: "View",
      headerName: "View Policy",
      width: 250,

      renderCell: (params) => {
        return (
          <Button
            disabled={!status?.name === "Active" || loading}
            variant="contained"
            onClick={() => {
              router.push(
                // `/Brokers/${id}/Schemes/${schemeId}/Policy/${params.row.policyId}`,
                `/Administration/EditPolicy/${id}?schemeId=${schemeId}&policyId=${params.row.policyId}`
              );
            }}>
            View Policy
          </Button>
        );
      },
    },
    // { field: "policyId", headerName: "Policy Id", width: 200 },
    { field: "policyNumber", headerName: "Policy Number", width: 200 },
    { field: "displayName", headerName: "Main Member", width: 400 },

    { field: "idNumber", headerName: "ID Number", width: 200 },
    {
      field: "policyStatus",
      headerName: "Policy Status",
      width: 200,

      renderCell: (params) => {
        return <PolicyStatusChip status={params.row.policyStatus} />;
      },
    },
  ];

  let status = policyStatuses?.data?.data?.find((status) =>
    status.id === policyQuery?.data?.data?.policyStatusId ? status : null
  );

  const rows = getChildPolicyIds?.data?.data?.map((row, index) => {
    return {
      id: index,
      policyId: row.policyId,
      displayName: row.displayName,
      policyStatusId: row.policyStatusId,
      policyNumber: row.policyNumber,
      idNumber: row.idNumber,
      policyStatus: row.policyStatus,
    };
  });

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </GridToolbarContainer>
    );
  }
  const policyInceptionDate = policyQuery?.data?.data?.policyInceptionDate;
  const date = new Date(policyInceptionDate);
  const formattedDate = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"), // +1 because getMonth() returns 0-11
    date.getDate().toString().padStart(2, "0"),
  ].join("-");

  return (
    <div>
      <PageHeader
        title="Scheme"
        subTitle="Manage Scheme"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `Schemes`,
            href: `/Brokers/${id}/Schemes`,
          },
          ,
          {
            title: "Scheme",
            href: `/Brokers/${id}/Schemes/${schemeId}`,
          },
        ]}
      />

      {(policyQuery.isLoading ||
        getChildPolicyIds.isLoading ||
        policyStatuses.isLoading) && (
        <Stack>
          <LinearProgress />
        </Stack>
      )}

      <>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {policyQuery?.data?.data && (
              <Card>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ListSubheader
                      color="inherit"
                      variant="outlined"
                      component={Paper}>
                      Scheme Details
                    </ListSubheader>
                  </Grid>

                  <Grid item xs={6}>
                    <List
                      dense
                      sx={{
                        width: "100%",
                      }}>
                      <ContentItem
                        title="Brokerage Name"
                        value={policyQuery?.data?.data?.brokerageName}
                      />
                      <ContentItem
                        title="Scheme / Representative Name"
                        value={policyQuery?.data?.data?.clientName}
                      />
                    </List>
                  </Grid>
                  <Grid item xs={6}>
                    <List
                      dense
                      sx={{
                        width: "100%",
                      }}>
                      <ContentItem
                        title="Scheme Policy Number"
                        value={policyQuery.data?.data?.policyNumber}
                      />
                      <ContentItem
                        title="Scheme Inception Date"
                        value={formattedDate}
                      />
                    </List>
                  </Grid>
                </Grid>
              </Card>
            )}

            <Grid item xs={12} my={2}>
              {status?.name && (
                <>
                  {status?.name === "Active" ? (
                    <Button
                      variant="contained"
                      onClick={() => {
                        router.push(
                          `/Onboarding/CreatePolicy/${id}/${schemeId}?type=Scheme`
                        );
                      }}>
                      Create New Policy
                    </Button>
                  ) : (
                    <>
                      <Alert
                        severity="error"
                        sx={{
                          p: 2,
                        }}>
                        <Typography variant="body1">
                          Scheme is not active
                        </Typography>
                      </Alert>
                    </>
                  )}
                </>
              )}
            </Grid>
          </Grid>

          {getChildPolicyIds?.data?.data && (
            <Grid item xs={12}>
              <div
                style={{
                  height: 900,
                  width: "94vw",
                }}>
                <DataGridPremium
                  rows={rows}
                  columnBuffer={2}
                  columnThreshold={2}
                  columns={columns}
                  loading={getChildPolicyIds.isLoading}
                  getRowId={(row) => row.id}
                  slots={{
                    toolbar: CustomToolbar,
                  }}
                />
              </div>
            </Grid>
          )}
        </Grid>
      </>
    </div>
  );
};

export default Schema;
