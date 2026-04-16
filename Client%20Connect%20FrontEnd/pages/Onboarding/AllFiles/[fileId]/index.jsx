import {
  LinearProgress,
  Button,
  Chip,
  Alert,
  Portal,
  Box,
  Stack,
} from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import AlertPopup from "components/Bits/AlertPopup";
import ViewFileCard from "components/Containers/ViewFileCard";
import { useUser } from "@auth0/nextjs-auth0/client";

const Policies = () => {
  const [file, setFile] = useState(null);
  const router = useRouter();
  const { user } = useUser();

  const accessToken = useToken();

  const theWindow = typeof window !== "undefined" && window;
  const [marked, setMarked] = React.useState([]);
  const [submitted, setSubmitted] = React.useState([]);
  const [ready, setReady] = React.useState([]);
  const [status, setStatus] = React.useState("");
  const { fileId } = router.query;

  if (!file && fileId) {
    setFile(fileId);
  }

  let URL = `${nodeSa}/onboarding/policies?fileId=${fileId}`;

  if (status) {
    URL = `${URL}&status=${status}`;
  }

  const getPolicies = useQuery(
    `getMyFiles${file}${status}`,
    async () => {
      return await axios.get(`${URL}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken && !!file,
    }
  );

  const { refetch } = getPolicies;

  useEffect(() => {
    if (status) {
      refetch();
    }
  }, [status, refetch]);

  const ChangeStatusOfMarkedPolicies = useMutation(
    async (data) => {
      return await axios.post(
        `${nodeSa}/onboarding/policies/bulkUpdateStatus`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    },
    {
      onSuccess: () => {
        getPolicies.refetch();
      },
    }
  );

  const changeStatus = async (marked, status) => {
    console.log({
      policyIds: marked,
      status,
    });

    ChangeStatusOfMarkedPolicies.mutate({
      policyIds: marked,
      status,
    });
  };

  const columns = [
    {
      field: "Manage Policy",
      headerName: "Manage Policy",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            {params.row.id ? (
              <Button
                onClick={() => handleRowClick(params)}
                variant="contained"
                color={
                  userAccess || user?.user === params.row.createdBy
                    ? "primary"
                    : "inherit"
                }
              >
                {!userAccess && !(user?.user === params.row.createdBy)
                  ? "View"
                  : "Manage"}
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

    { field: "policyMember", headerName: "Main Member ID", width: 150 },
    // combine firstName and surname
    {
      field: "fullName",
      headerName: "Main Member",
      width: 250,
    },
    { field: "createdAt", headerName: "Created At", width: 200 },
  ];

  const rows = getPolicies?.data?.data.data
    ? getPolicies?.data?.data.data?.map((row) => {
        const policyMainMember = row.members.find(
          (member) => member.memberTypeId === 1
        );
        return {
          id: row.id,
          status: row.status,
          statusNote: row.statusNote,
          providerId: row.providerId,
          brokerageName: row.brokerageName,
          providerName: row.providerName,
          policyMember: policyMainMember?.idNumber,
          fullName: `${policyMainMember?.firstName} ${policyMainMember?.surname}`,
          fromFile: row?.File?.orgFileName,
          fileName: row?.File?.orgFileName,
          createdAt: new Date(row.createdAt).toLocaleString(),
          exceptionCount: row.exceptionCount,
          createdBy: row.createdBy,
          approverId: row.approverId,
        };
      })
    : [];

  const userAccess = user?.rmaAppUserMetadata?.Modules?.some(
    (module) => module?.PolicyAdministrator?.Enabled === true
  );

  const handleRowClick = (params) => {
    let path;
    if (!params.row || !params.row.id) return;

    if (userAccess) {
      path = `/Onboarding/Policies/${params.row.id}`;
    } else if (
      user?.user === params.row.createdBy &&
      ["Draft", "Error", "Rejected"].includes(params.row.status)
    ) {
      path = `/Onboarding/Policies/${params.row.id}`;
    } else {
      path = `/Onboarding/Policies/viewOnly/${params.row.id}`;
    }
    router.push(path);
  };

  return (
    <>
      <PageHeader
        title="Onboarding"
        subTitle={`My File`}
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `All Files`,
            href: `/Onboarding/AllFiles`,
          },
          {
            title: `File`,
            href: `/Onboarding/AllFiles/${fileId}`,
          },
        ]}
      />
      <ViewFileCard fileId={fileId} />
      <Stack
        sx={{ my: 2 }}
        spacing={1}
        direction="row"
        justifyContent="space-between"
      >
        <div>
          {submitted && submitted.length > 0 && (
            <Button
              onClick={() => {
                changeStatus(submitted, "Approved");
              }}
              color="secondary"
              variant="contained"
            >
              Approve Submitted Policies
            </Button>
          )}
          {ready && ready.length > 0 && (
            <Button
              onClick={() => {
                changeStatus(ready, "Submitted");
              }}
              color="secondary"
              variant="contained"
            >
              Submit Ready Policies
            </Button>
          )}
        </div>
        <div>
          <Chip
            variant={status === "" ? "contained" : "outlined"}
            label="Reset"
            color={status === "" ? "primary" : "default"}
            onClick={() => {
              theWindow.location.reload();
              setStatus("");
            }}
          />

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
            variant={status === "Error" ? "contained" : "outlined"}
            color={status === "Error" ? "primary" : "default"}
            label="Error"
            onClick={() => setStatus("Error")}
          />
          <Chip
            variant={status === "Duplicate" ? "contained" : "outlined"}
            color={status === "Duplicate" ? "primary" : "default"}
            label="Duplicate"
            onClick={() => setStatus("Duplicate")}
          />
          <Chip
            variant={status === "Submitted" ? "contained" : "outlined"}
            label="Submitted"
            color={status === "Submitted" ? "primary" : "default"}
            onClick={() => setStatus("Submitted")}
          />
          <Chip
            variant={status === "Approved" ? "contained" : "outlined"}
            label="Approved"
            color={status === "Approved" ? "primary" : "default"}
            onClick={() => setStatus("Approved")}
          />
          <Chip
            variant={status === "Rejected" ? "contained" : "outlined"}
            color={status === "Rejected" ? "primary" : "default"}
            label="Rejected"
            onClick={() => setStatus("Rejected")}
          />
          <Chip
            variant={status === "Complete" ? "contained" : "outlined"}
            label="Complete"
            color={status === "Complete" ? "primary" : "default"}
            onClick={() => setStatus("Complete")}
          />
        </div>
      </Stack>
      {getPolicies?.isLoading && <LinearProgress />}
      {getPolicies.isError && (
        <Alert severity="error">{getPolicies.error.message}</Alert>
      )}
      <Box id="filter-panel" />
      {rows && rows.length > 0 && (
        <div
          style={{
            height: 750,
            width: "94vw",
          }}
        >
          <DataGridPremium
            rows={rows}
            columns={columns}
            // virtualization}
            pagination
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            initialState={{
              filter: {
                filterModel: {
                  items: [],
                  quickFilterExcludeHiddenColumns: true,
                },
              },
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>
      )}
      {getPolicies.isSuccess && rows && rows.length === 0 && (
        <Alert severity="info">No Policies Found</Alert>
      )}
      <AlertPopup
        open={ChangeStatusOfMarkedPolicies.isSuccess}
        severity="success"
        message="Policies Approved"
      />
      <AlertPopup
        open={ChangeStatusOfMarkedPolicies.isError}
        severity="error"
        message={ChangeStatusOfMarkedPolicies?.error?.response?.data?.message}
      />
    </>
  );
};

export default Policies;
