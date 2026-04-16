import React, { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useRouter } from "next/router";
import useToken from "hooks/useToken";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";

const ListOfSchemes = () => {
  const router = useRouter();
  const { id } = router.query;
  const accessToken = useToken();

  const [gridKey, setGridKey] = useState(0);
  const [status, setStatus] = useState("");

  console.log("getting the id: ", id);

  const { data, isLoading, refetch, error, isFetching } = useQuery(
    "getALlSchemes",
    async () => {
      return await axios.get(`${nodeSa}/brokerscheme/scheme/${id}/broker`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: accessToken ? true : false,
    }
  );

  useEffect(() => {
    const handleResize = () => {
      setGridKey((prev) => prev + 1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (status) {
      refetch();
    }
  }, [status, refetch]);

  const columns = [
    {
      field: "Manage Scheme",
      headerName: "Manage Scheme",
      flex: 1,
      renderCell: (params) => (
        <Button
          onClick={() => handleRowClick(params)}
          variant="contained"
          color="primary"
          disabled={params.row.status !== "Draft"}
        >
          Manage
        </Button>
      ),
    },
    { field: "DisplayName", headerName: "Display Name", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        return <AppPolicyStatusChip status={params.row.status} />;
      },
    },
    { field: "RepresentativeId", headerName: " Representative ID", flex: 1 },
    { field: "TellNumber", headerName: "Contact Number", flex: 1 },
    { field: "CreatedBy", headerName: "Created by", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
  ];

  const rows = data?.data.data
    ? data?.data.data?.map((row) => ({
        id: row.id,
        DisplayName: row.DisplayName,
        status: row.status,
        RepresentativeId: row.RepresentativeId,
        TellNumber: row.TellNumber,
        CreatedBy: row.CreatedBy,
        createdAt: row.createdAt,
      }))
    : [];
  console.log("getting user id: ");
  console.log("getting params row id: ", data?.data.data?.id);

  const handleRowClick = (params) => {
    console.log("table params: ", params);
    router.push(
      `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${params.row.id}?currentStep=5`
    );
  };

  return (
    <>
      {(isLoading || isFetching) && <LinearProgress />}

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

      <DataGridPremium
        autoHeight
        key={gridKey}
        getRowId={(row) => row.id}
        columns={columns}
        rows={rows}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />
    </>
  );
};

export default ListOfSchemes;
