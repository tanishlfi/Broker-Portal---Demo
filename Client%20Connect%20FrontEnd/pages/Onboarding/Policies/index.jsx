import {
  LinearProgress,
  Button,
  Chip,
  Alert,
  Stack,
  IconButton,
  Typography,
  Card,
  TextField,
  Pagination,
  Box,
} from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useUser } from "@auth0/nextjs-auth0/client";

function MyCustomToolbar(props) {
  return (
    <Box>
      <GridToolbar {...props} />
    </Box>
  );
}

const Policies = ({ loading }) => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const userAccess = user?.rmaAppUserMetadata?.Modules?.some(
    (module) => module?.PolicyAdministrator?.Enabled === true
  );

  const [paginationModel, setPaginationModel] = useState({
    page: 0, // DataGrid's page is 0-indexed
    pageSize: 10,
  });

  const accessToken = useToken();

  const theWindow = typeof window !== "undefined" && window;

  const [submitted, setSubmitted] = React.useState([]);
  const [ready, setReady] = React.useState([]);
  const [status, setStatus] = React.useState("");
  const [search, setSearch] = useState(""); // State for the search input

  // Base URL for the API
  const baseApiUrl = `${nodeSa}/onboarding/policies`;

  const getPolicies = useQuery(
    // Updated queryKey to include all relevant filter/pagination states
    [
      "getAllPolicies",
      {
        status,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        search, // Add search to queryKey
      },
    ],
    async ({ queryKey }) => {
      // Destructure parameters from queryKey
      const [_keyName, paramsObj] = queryKey;
      const {
        status: currentStatus,
        page,
        pageSize,
        search: currentSearch,
      } = paramsObj;

      const queryParams = new URLSearchParams();

      if (currentSearch) {
        queryParams.append("idNumber", currentSearch);
      }

      if (currentStatus) {
        queryParams.append("status", currentStatus);
      }

      queryParams.append("page", String(page + 1));
      queryParams.append("limit", String(pageSize));

      const queryString = queryParams.toString();
      const FinalURL = `${baseApiUrl}${queryString ? `?${queryString}` : ""}`;

      const response = await axios.get(FinalURL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    },
    {
      enabled: !!accessToken,
      keepPreviousData: true,
    }
  );

  const policiesData = getPolicies.data?.data || [];
  const totalRowCount = getPolicies.data?.count || 0;

  const { refetch } = getPolicies;

  // useEffect(() => {
  //   if (status) {
  //     if (search) setSearch("");
  //   }
  // }, [status, search]);

  const markReady = (id) => {
    setReady((marked) => [...marked, id]);
  };

  const unMarkReady = (id) => {
    setReady((marked) => marked.filter((item) => item !== id));
  };

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
                disabled={isLoading}
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
        if (params.row.status === "Submitted") {
          return (
            <Stack direction="row">
              <AppPolicyStatusChip status={params.row.status} />
            </Stack>
          );
        } else if (params.row.status === "Ready") {
          return (
            <Stack direction="row" alignItems="center">
              <AppPolicyStatusChip status={params.row.status} />
              {ready && ready.includes(params.row.id) ? (
                <IconButton
                  color="warning"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    unMarkReady(params.row.id);
                  }}
                >
                  <CheckBoxIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    markReady(params.row.id);
                  }}
                >
                  <CheckBoxOutlineBlankIcon />
                </IconButton>
              )}
            </Stack>
          );
        }
        return <AppPolicyStatusChip status={params.row.status} />;
      },
    },
    {
      field: "providerName",
      headerName: "Scheme / Representative",
      width: 250,
    },
    {
      field: "brokerageName",
      headerName: "Brokerage",
      width: 300,
    },
    { field: "policyMember", headerName: "Main Member ID", width: 150 },
    {
      field: "fullName",
      headerName: "Main Member",
      width: 250,
    },
    { field: "createdAt", headerName: "Created At", width: 200 },
    { field: "createdBy", headerName: "created By", width: 200 },
    { field: "fileName", headerName: "File Name", width: 250 },
  ];

  const rows = policiesData
    ? policiesData.map((row) => {
        const policyMainMember = row.members?.find(
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
          fullName: `${policyMainMember?.firstName || ""} ${
            policyMainMember?.surname || ""
          }`,
          fromFile: row?.File?.orgFileName,
          fileName: row?.file?.orgFileName || row?.File?.orgFileName, // Check both potential structures
          createdAt: new Date(row.createdAt).toLocaleString(),
          exceptionCount: row.exceptionCount,
          createdBy: row.createdBy,
        };
      })
    : [];

  const handleStatusChipClick = (newStatus) => {
    if (search) setSearch("");
    setStatus(newStatus);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const changeStatus = (ids, newStatusValue) => {
    if (newStatusValue === "Approved") setSubmitted([]);
    if (newStatusValue === "Submitted") setReady([]);
    refetch();
  };

  return (
    <>
      <PageHeader
        title="New Policies Created by Brokers"
        subTitle="Manage policies created by brokers."
      />
      <Card variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Search Policies by ID Number
        </Typography>
        <TextField
          label="Search by ID Number"
          variant="outlined"
          fullWidth
          value={search} // Controlled component
          onChange={(event) => setSearch(event.target.value)}
          sx={{ mb: 2 }}
        />
      </Card>
      <Stack
        sx={{ my: 2 }}
        spacing={1}
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap" // Allow chips to wrap on smaller screens
      >
        <div>
          {submitted && submitted.length > 0 && (
            <Button
              onClick={() => {
                changeStatus(submitted, "Approved");
              }}
              color="secondary"
              variant="contained"
              sx={{ mr: 1 }}
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
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            variant={status === "" ? "contained" : "outlined"}
            label="All (Reset)"
            color={status === "" ? "primary" : "default"}
            onClick={handleResetFilters}
          />
          {[
            "Draft",
            "Processing",
            "Error",
            "Duplicate",
            "Submitted",
            "Approved",
            "Rejected",
            "Complete",
            "Expired",
          ].map((s) => (
            <Chip
              key={s}
              variant={status === s ? "contained" : "outlined"}
              label={s}
              color={status === s ? "primary" : "default"}
              onClick={() => handleStatusChipClick(s)}
            />
          ))}
        </Stack>
      </Stack>
      {getPolicies?.isFetching && <LinearProgress sx={{ mb: 1 }} />}{" "}
      {getPolicies.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getPolicies.error?.response?.data?.message ||
            getPolicies.error.message ||
            "An error occurred while fetching policies."}
        </Alert>
      )}
      {getPolicies.isSuccess && policiesData && (
        <>
          {getPolicies.isSuccess &&
            !getPolicies.data?.success &&
            !getPolicies.data?.data && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {getPolicies.data?.message || "No Policies Found"}
              </Alert>
            )}
          {getPolicies.isSuccess &&
            policiesData.length === 0 &&
            totalRowCount === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No policies match the current filters.
              </Alert>
            )}
          <Box
            sx={{
              height: 750,
              width: "100%",
              overflowX: "hidden",
            }}
          >
            <DataGridPremium
              rows={rows}
              columns={columns}
              paginationMode="server"
              rowCount={totalRowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={(newModel) =>
                setPaginationModel(newModel)
              }
              hideFooter
              pageSizeOptions={[5, 10, 20, 50, 100]}
              loading={getPolicies.isFetching}
              autoHeight={false}
              sx={{
                width: "100%",
                overflowX: "auto",
                "& .MuiDataGrid-columnHeaders": {
                  minWidth: "100%",
                },
              }}
              slots={{
                toolbar: MyCustomToolbar,
              }}
            />
          </Box>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
            }}
          >
            <Pagination
              count={Math.ceil(totalRowCount / paginationModel.pageSize)}
              page={paginationModel.page + 1}
              onChange={(event, value) =>
                setPaginationModel((prev) => ({
                  ...prev,
                  page: value - 1,
                }))
              }
              color="primary"
              showFirstButton
              showLastButton
              size="large"
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Policies;
