import {
  LinearProgress,
  Button,
  Chip,
  Alert,
  Portal,
  Box,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import {
  DataGridPremium,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AlertPopup from "components/Bits/AlertPopup";
import RemovePolicyDialog from "components/PolicyForms/RemovePolicyDialog";
import ViewFileCard from "components/Containers/ViewFileCard";
import { useUser } from "@auth0/nextjs-auth0/client";

const Policies = ({ loading }) => {
  const [file, setFile] = useState(null);
  const router = useRouter();
  const { user, isLoading } = useUser();

  const handleSelectionChange = (selectionModel) => {
    // Update the state with the new selection model
    setSelectedRows(selectionModel);
  };

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
      // onSuccess: (data) => {
      //   console.log("data", data);
      // },
    },
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
        },
      );
    },
    {
      onSuccess: () => {
        getPolicies.refetch();
      },
    },
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

  const markSubmitted = (id) => {
    setSubmitted((marked) => [...marked, id]);
  };

  const unMarkSubmitted = (id) => {
    setSubmitted((marked) => marked.filter((item) => item !== id));
  };

  const markReady = (id) => {
    setReady((marked) => [...marked, id]);
  };

  const unMarkReady = (id) => {
    setReady((marked) => marked.filter((item) => item !== id));
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
                disabled={loading}
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
        if (
          params.row.status === "Submitted" &&
          params.row.approverId === user.user
        ) {
          return (
            <Stack direction="row">
              <AppPolicyStatusChip status={params.row.status} />
              {submitted && submitted.includes(params.row.id) ? (
                <IconButton
                  color="warning"
                  onClick={() => {
                    unMarkSubmitted(params.row.id);
                  }}
                >
                  <CheckBoxIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    markSubmitted(params.row.id);
                  }}
                >
                  <CheckBoxOutlineBlankIcon />
                </IconButton>
              )}
            </Stack>
          );
        } else if (params.row.status === "Ready") {
          return (
            <Stack direction="row">
              <AppPolicyStatusChip status={params.row.status} />
              {ready && ready.includes(params.row.id) ? (
                <IconButton
                  color="warning"
                  onClick={() => {
                    unMarkReady(params.row.id);
                  }}
                >
                  <CheckBoxIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
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
    // {
    //   field: "providerName",
    //   headerName: "Scheme / Representative",
    //   width: 250,
    // },
    // { field: "brokerageName", headerName: "Brokerage", width: 300 },
    { field: "policyMember", headerName: "Main Member ID", width: 150 },
    // combine firstName and surname
    {
      field: "fullName",
      headerName: "Main Member",
      width: 250,
    },
    { field: "createdAt", headerName: "Created At", width: 200 },
    // { field: "fileName", headerName: "File Name", width: 250 },
    // {
    //   field: "rejectPolicy",
    //   headerName: "Remove",
    //   width: 100,

    //   renderCell: (params) => {
    //     // don't show remove button if policy set to Complete
    //     if (params.row.status === "Complete") {
    //       return <></>;
    //     }
    //     return (
    //       <RemovePolicyDialog
    //         policy={params.row}
    //         ChangeRequest={ChangeStatusOfMarkedPolicies}
    //       />
    //     );
    //   },
    // },
  ];

  const rows = getPolicies?.data?.data.data
    ? getPolicies?.data?.data.data?.map((row) => {
        const policyMainMember = row.members.find(
          (member) => member.memberTypeId === 1,
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

  const handleRowClick = (params) => {
    // if (["Draft", "Error", "Rejected"].includes(params.row.status)) {
    //   router.push(`/Onboarding/Policies/${params.row.id}`);
    // } else {
    router.push(`/Onboarding/Policies/viewOnly/${params.row.id}`);
    // }
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
          {/* {fileId && getPolicies.data?.data?.data[0].File?.orgFileName && (
            <Typography variant="h6" align="center">
              {getPolicies.data?.data?.data[0].File?.orgFileName}
            </Typography>
          )} */}
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
