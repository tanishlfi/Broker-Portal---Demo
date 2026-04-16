import {
  Alert,
  Button,
  Card,
  Grid,
  LinearProgress,
  List,
  ListSubheader,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PageHeader from "components/Bits/PageHeader";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import { useRouter } from "next/router";
import React from "react";

import PolicyStatusChip from "components/Bits/PolicyStatusChip";
import {
  DataGridPremium,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbar,
} from "@mui/x-data-grid-premium";
import ContentItem from "components/Containers/ContentItem";
import useToken from "hooks/useToken";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import axios from "axios";

const ViewPolicies = () => {
  const [broker, setBroker] = React.useState(null);
  const [productType, setProductType] = React.useState("");
  const [scheme, setScheme] = React.useState(null);

  const router = useRouter();
  const { brokerId, schemeId } = router.query;

  // On initial load, populate broker and scheme from query params
  React.useEffect(() => {
    if (brokerId) {
      setBroker({ id: brokerId });
    }
    if (schemeId) {
      setScheme({ policyId: schemeId });
    }
  }, [brokerId, schemeId]);

  // Update query params when broker and scheme are selected
  React.useEffect(() => {
    if (broker?.id && scheme?.policyId) {
      router.push(
        {
          pathname: router.pathname,
          query: { brokerId: broker.id, schemeId: scheme.policyId },
        },
        undefined,
        { shallow: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broker, scheme]);

  // Set default product type
  if (!productType) {
    setProductType("Scheme");
  }

  return (
    <div>
      <>
        <PageHeader
          title="Administration"
          subTitle="Edit Policy"
          breadcrumbs={[
            {
              title: "Home",
              href: "/",
            },
            {
              title: "Edit Policy",
              href: "/Administration/EditPolicy",
            },
          ]}
        />

        <Stack sx={{ my: 2 }}>
          <Stack sx={{ mb: 2 }}>
            <SelectBroker select={broker} setSelect={setBroker} />
          </Stack>

          {broker?.id && (
            <Stack sx={{ my: 2 }}>
              <SelectScheme
                select={scheme}
                setSelect={setScheme}
                id={broker?.id}
              />
            </Stack>
          )}
        </Stack>
      </>

      {scheme && (
        <>
          <ViewSchemePolicies
            brokerId={broker?.id}
            schemeId={scheme.policyId}
          />
        </>
      )}
    </div>
  );
};

export default ViewPolicies;

export const ViewSchemePolicies = ({ brokerId, schemeId }) => {
  const router = useRouter();

  const accessToken = useToken();

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

  // let statusData = policyStatuses?.data?.data;

  const columns = [
    {
      field: "Edit",
      headerName: "Edit Policy",
      width: 250,

      renderCell: (params) => {
        return (
          <Button
            disabled={!status?.name === "Active" || policyQuery.isLoading}
            variant="contained"
            onClick={() => {
              router.push(
                `/Administration/EditPolicy/${brokerId}?schemeId=${schemeId}&policyId=${params.row.policyId}`
                // `/BrokerManager/SchemaManagement/${brokerId}/Schema/${schemeId}/Policy/${params.row.policyId}`
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
    {
      field: "policyCancelReasonEnum",
      headerName: "Policy Cancel Reason",
      width: 200,
    },
    {
      field: "reinstateReasonEnum",
      headerName: "Reinstate Reason",
      width: 200,
    },
  ];

  const rows = getChildPolicyIds?.data?.data?.map((row, index) => {
    return {
      id: index,
      policyId: row.policyId,
      displayName: row.displayName,
      policyStatusId: row.policyStatusId,
      policyNumber: row.policyNumber,
      idNumber: row.idNumber,
      policyStatus: row.policyStatus,
      policyCancelReasonEnum: row.policyCancelReasonEnum,
      reinstateReasonEnum: row.reinstateReasonEnum,
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

  let status = policyStatuses?.data?.data?.find((status) =>
    status.id === policyQuery?.data?.data.policyStatusId ? status : null
  );

  return (
    <div>
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
                          `/Onboarding/CreatePolicy/${brokerId}/${schemeId}?type=Scheme`
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
                  height: 750,
                  width: "94vw",
                }}>
                <DataGridPremium
                  rows={rows}
                  columnBuffer={2}
                  columnThreshold={2}
                  columns={columns}
                  loading={getChildPolicyIds.isLoading}
                  getRowId={(row) => row.id}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                    },
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
