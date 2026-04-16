import {
  LinearProgress,
  Button,
  Chip,
  Alert,
  Portal,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import {
  DataGridPremium,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import AlertPopup from "components/Bits/AlertPopup";
import RejectPolicyDialog from "components/PolicyForms/RejectPolicyDialog";
import EditRequestStatusChip from "../_components/EditRequestStatusChip";
import ViewRequestDialog from "../_components/ViewRequestDialog";

function MyCustomToolbar(props) {
  return (
    <React.Fragment>
      <Portal container={() => document.getElementById("filter-panel")}>
        <GridToolbarQuickFilter />
      </Portal>
      <GridToolbar {...props} />
    </React.Fragment>
  );
}

const Policies = ({ loading }) => {
  const router = useRouter();

  const handleSelectionChange = (selectionModel) => {
    // Update the state with the new selection model
    setSelectedRows(selectionModel);
  };

  const accessToken = useToken();

  const theWindow = typeof window !== "undefined" && window;

  const [submitted, setSubmitted] = React.useState([]);
  const [ready, setReady] = React.useState([]);
  const [status, setStatus] = React.useState("");
  const { fileId } = router.query;

  let URL = `${nodeSa}/edit/requests`;

  if (status) {
    URL = URL + `&status=${status}`;
  }

  const getPolicies = useQuery(
    "GetAllRequests",
    async () => {
      return await axios.get(`${URL}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      // onSuccess: (data) => {
      //   console.log("data", data);
      // },
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
        `${nodeSa}/edit/policies/bulkUpdateStatus`,
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

  const markSubmitted = (id) => {
    setSubmitted((marked) => [...marked, id]);
  };

  const unMarkSubmitted = (id) => {
    setMarked((marked) => marked.filter((item) => item !== id));
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
                color="primary">
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
      field: "View Request Dialog",
      headerName: "View Request Dialog",
      width: 150,
      renderCell: (params) => {
        return (
          <>{params.row ? <ViewRequestDialog request={params.row} /> : <></>}</>
        );
      },
    },

    {
      field: "requestStatus",
      headerName: "Request Status",
      width: 130,
      renderCell: (params) => {
        //Edit , Submitted, Rejected, Complete\, Cancelled/Removed
        return (
          <EditRequestStatusChip requestStatus={params.row.requestStatus} />
        );
      },
    },

    {
      field: "providerName",
      headerName: "Scheme / Representative",
      width: 250,
    },
    { field: "brokerageName", headerName: "Brokerage", width: 250 },
    { field: "MainMemberId", headerName: "Main Member ID", width: 150 },

    {
      field: "fullName",
      headerName: "Main Member",
      width: 250,
    },

    {
      field: "expiryDate",
      headerName: "Expire Date",
      width: 150,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString("en-GB");
      },
    },

    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString("en-GB");
      },
    },

    {
      field: "rejectPolicy",
      headerName: "Reject Policy",
      width: 70,

      renderCell: (params) => {
        return (
          <RejectPolicyDialog
            policy={params.row}
            ChangeRequest={ChangeStatusOfMarkedPolicies}
          />
        );
      },
    },
  ];

  const rows = getPolicies?.data?.data.data
    ? getPolicies?.data?.data.data?.map((row) => {
        return {
          ...row,
          id: row.id,
          requestType: row.requestType,
          requestStatus: row.requestStatus,
          providerId: row.PolicyData?.ParentPolicyNumber,
          brokerageName: row.PolicyData?.brokerage,
          providerName: row.PolicyData?.scheme,

          fullName: row.PolicyData?.mainMember,
          MainMemberId: row.PolicyData?.mainMemberId,
          fromFile: row?.File?.orgFileName,
          fileName: row?.File?.orgFileName,
          createdAt: new Date(row.createdAt).toLocaleString(),
        };
      })
    : [];

  const handleRowClick = (params) => {
    if (params.row.requestType === "Cancel policy") {
      router.push(`/Administration/Cancel/${params.row.id}`);
    } else {
      router.push(`/Administration/Policies/${params.row.id}`);
    }
  };

  return (
    <>
      <PageHeader
        title="Administration"
        subTitle={`Edits`}
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `All Edits`,
            href: `/Administration/Policies`,
          },
        ]}
      />

      <Stack
        sx={{ my: 2 }}
        spacing={1}
        direction="row"
        justifyContent="space-between">
        <div>
          {submitted && submitted.length > 0 && (
            <Button
              onClick={() => {
                changeStatus(submitted, "Approved");
              }}
              color="secondary"
              variant="contained">
              Approve Submitted Policies
            </Button>
          )}
          {ready && ready.length > 0 && (
            <Button
              onClick={() => {
                changeStatus(ready, "Submitted");
              }}
              color="secondary"
              variant="contained">
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
            variant={status === "Edit" ? "contained" : "outlined"}
            label="Edit"
            color={status === "Edit" ? "primary" : "default"}
            onClick={() => setStatus("Edit")}
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
            variant={status === "Submitted" ? "contained" : "outlined"}
            label="Submitted"
            color={status === "Submitted" ? "primary" : "default"}
            onClick={() => setStatus("Submitted")}
          />
          <Chip
            variant={status === "Rejected" ? "contained" : "outlined"}
            color={status === "Rejected" ? "primary" : "default"}
            label="Rejected"
            onClick={() => setStatus("Rejected")}
          />
          <Chip
            variant={status === "Approved" ? "contained" : "outlined"}
            label="Approved"
            color={status === "Approved" ? "primary" : "default"}
            onClick={() => setStatus("Approved")}
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
            height: 900,
            width: "94vw",
          }}>
          {fileId && getPolicies.data?.data?.data[0].File?.orgFileName && (
            <Typography variant="h6" align="center">
              {getPolicies.data?.data?.data[0].File?.orgFileName}
            </Typography>
          )}
          <DataGridPremium
            rows={rows}
            columns={columns}
            virtualization
            slots={{
              toolbar: MyCustomToolbar,
            }}
            initialState={{
              filter: {
                filterModel: {
                  items: [],
                  quickFilterExcludeHiddenColumns: true,
                },
              },
            }}
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
