import { useOidcAccessToken } from "@axa-fr/react-oidc";
import PageHeader from "components/Bits/PageHeader";
import { nodeSa } from "src/AxiosParams";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import axios from "axios";
import React, { useCallback, useEffect } from "react";
import {
  Alert,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import useToken from "hooks/useToken";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";

// productTypeId,
// providerId,
// memberTypeId,
// createdBy,
// limit,
// page,
// status,
// idNumber,
// fileName,

const Index = () => {
  const router = useRouter();

  const [status, setStatus] = React.useState("");

  const { fileName } = router.query;

  let URL = `${nodeSa}/onboarding/policies?createdBy=true`;

  if (status) {
    URL = `${URL}&status=${status}`;
  }

  const accessToken = useToken();
  const { data, isLoading, refetch, error, isFetching } = useQuery(
    "getAllUserPolicies",
    async () => {
      return await axios.get(`${URL}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    },
  );

  useEffect(() => {
    if (status) {
      refetch();
    }
  }, [status, refetch]);

  const columns = [
    {
      field: "Manage Policy",
      headerName: "Mange Policy",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            {params.row.id ? (
              <Button
                onClick={() => handleRowClick(params)}
                variant="contained"
                color="primary"
              >
                Manage
              </Button>
            ) : (
              <></>
            )}
          </>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,

      renderCell: (params) => {
        return <AppPolicyStatusChip status={params.row.status} />;
      },
    },
    {
      field: "statusNote",
      headerName: "Comment",
      width: 170,
    },
    { field: "providerId", headerName: "Provider Id", width: 100 },
    { field: "policyMember", headerName: "Main Member", width: 250 },
    { field: "firstName", headerName: "First Name", width: 250 },
    { field: "surname", headerName: "Surname", width: 200 },
    { field: "createdAt", headerName: "Created At", width: 200 },
    {
      field: "from File",
      headerName: "From File",
      width: 100,
      renderCell: (params) => {
        return <strong>{params.row.fromFile ? "Yes" : "No"}</strong>;
      },
    },
    { field: "fileName", headerName: "File Name", width: 200 },
  ];

  const rows = data?.data.data
    ? data?.data.data?.map((row) => {
        const policyMainMember = row.members.find(
          (member) => member.PolicyMember.memberTypeId === 1,
        );

        return {
          id: row.id,
          status: row.status,
          providerId: row.providerId,
          policyId: row.policyId,
          statusNote: row.statusNote,
          policyMember: policyMainMember?.idNumber,
          firstName: policyMainMember?.firstName,
          surname: policyMainMember?.surname,
          fromFile: row?.File?.orgFileName,
          fileName: row?.File?.orgFileName,
          createdAt: new Date(row.createdAt).toLocaleString(),
        };
      })
    : [];
  const handleRowClick = (params) => {
    console.log(params);
    router.push(`/BrokerManager/UserPolicies/Created/${params.row.id}`);
  };

  return (
    <>
      <PageHeader title="User Policies" subTitle={`Manage Created Policies`} />

      {(isLoading || isFetching) && <LinearProgress />}

      {/* filters */}

      {status}

      <Stack
        sx={{ my: 2 }}
        spacing={1}
        direction="row"
        justifyContent="flex-end"
      >
        <>
          <Chip
            variant={status === "" ? "contained" : "outlined"}
            label="All"
            color={status === "" ? "primary" : "default"}
            onClick={() => {
              refetch();
              setStatus("");
            }}
          />
        </>
        <Chip
          variant={status === "Draft" ? "contained" : "outlined"}
          label="Draft"
          color={status === "Draft" ? "primary" : "default"}
          onClick={() => setStatus("Draft")}
        />
        <Chip
          variant={status === "Processing" ? "contained" : "outlined"}
          label="Processing"
          color={status === "Processing" ? "primary" : "default"}
          onClick={() => setStatus("Processing")}
        />
        <Chip
          variant={status === "Rejected" ? "contained" : "outlined"}
          color={status === "Rejected" ? "primary" : "default"}
          label="Rejected"
          onClick={() => setStatus("Rejected")}
        />
        <Chip
          variant={status === "Error" ? "contained" : "outlined"}
          color={status === "Error" ? "primary" : "default"}
          label="Error"
          onClick={() => setStatus("Error")}
        />
        <Chip
          variant={status === "Approved" ? "contained" : "outlined"}
          label="Approved"
          color={status === "Approved" ? "primary" : "default"}
          onClick={() => setStatus("Approved")}
        />
        <Chip
          variant={status === "Submitted" ? "contained" : "outlined"}
          label="Submitted"
          color={status === "Submitted" ? "primary" : "default"}
          onClick={() => setStatus("Submitted")}
        />
        <Chip
          variant={status === "Complete" ? "contained" : "outlined"}
          label="Complete"
          color={status === "Complete" ? "primary" : "default"}
          onClick={() => setStatus("Complete")}
        />
      </Stack>

      {error && (
        <Alert severity="error">{error?.response?.data?.message}</Alert>
      )}
      {fileName && (
        <Typography variant="h6" align="center">
          {fileName}
        </Typography>
      )}

      <DataGridPremium
        getRowId={(row) => row.id}
        autoHeight
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        rows={rows}
      />
    </>
  );
};

export default Index;
