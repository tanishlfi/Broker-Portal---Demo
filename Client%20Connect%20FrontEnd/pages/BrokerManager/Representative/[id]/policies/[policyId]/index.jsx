import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { CollectionsBookmarkOutlined } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  Grid,
  List,
  ListSubheader,
  Paper,
  Stack,
} from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import LoadingTable from "components/Bits/LoadingTable";
import PageHeader from "components/Bits/PageHeader";
import ContentItem from "components/Containers/ContentItem";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const RepresentativeId = () => {
  const router = useRouter();
  const { id, policyId } = router.query;
  const accessToken = useToken();

  const { data, isLoading, error, isError, isRefetching } = useQuery(
    ["RepresentativeId", policyId],
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/RolePlayer/RolePlayerPolicy/GetPoliciesByRepresentativeId/${policyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    { enabled: !!accessToken }
  );

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

  const representative = useQuery(
    `Broker/Representative${policyId}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Broker/Representative/${policyId}`, {
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
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/BrokerManager/Representative/${id}/policies/${policyId}/policy/${params.row.policyId}`
              )
            }>
            Edit
          </Button>
        );
      },
    },
    {
      field: "id",
      headerName: "ID",
      width: 100,
    },
    { field: "policyId", headerName: "policy Id", width: 100 },

    {
      field: "policyStatus",
      headerName: "policy Status",
      width: 100,
      renderCell: (params) => {
        const status = policyStatuses?.data?.data?.find(
          (x) => x.policyStatusId === params.row.policyStatusId
        );
        return (
          <Chip
            label={status?.name}
            variant="outlined"
            color={status?.name === "Active" ? "success" : "error"}
          />
        );
      },
    },

    { field: "policyOwner", headerName: "policy Owner", width: 200 },
    {
      field: "policyInceptionDate",
      headerName: "Policy Inception Date",
      width: 200,
    },
    { field: "productOption", headerName: "Scheme Name", width: 300 },
  ];

  const rows = data?.data?.map((row, index) => ({
    id: index + 1,
    policyId: row.policyId,
    productOption: row?.productOption?.name,
    policyOwner: row?.policyOwner?.displayName,
    policyInceptionDate: row.policyInceptionDate,
    policyStatus: row?.policyStatus,
    edit: row.policyId,
  }));

  return (
    <div>
      <PageHeader
        title="Representative"
        subTitle="Manage Representative Policies"
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
            title: `Representatives`,
            href: `/Brokers/${id}/Representative`,
          },
          {
            title: `${policyId}`,
            href: `/Brokers/${id}/Representative/${policyId}`,
          },
        ]}
      />

      {isError && <Alert severity="error">{error.message}</Alert>}

      {isRefetching && (
        <Alert sx={{ mb: 2 }} variant="outlined" severity="info">
          Refetching
        </Alert>
      )}

      <Grid container sx={{ mb: 2 }}>
        <Stack spacing={2}>
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
                Representative Details
              </ListSubheader>
            }>
            <ContentItem title="ID" value={representative?.data?.data?.id} />
            <ContentItem
              title="Representative Name"
              value={representative?.data?.data?.name}
            />
            <ContentItem title="code" value={representative.data?.data?.code} />
          </List>
        </Stack>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() => {
              router.push(
                `/BrokerManager/Representative/${id}/policies/${policyId}/CreateRepresentativePolicy`
              );
            }}>
            Create New Policy
          </Button>
        </Grid>
      </Grid>

      {isLoading ? (
        <LoadingTable />
      ) : (
        <>
          {rows && rows.length > 0 ? (
            <DataGridPremium
              autoHeight
              slots={{ toolbar: GridToolbar }}
              rows={rows}
              columns={columns}
            />
          ) : (
            <Alert severity="info">No Policies Found</Alert>
          )}
        </>
      )}
    </div>
  );
};

export default RepresentativeId;
