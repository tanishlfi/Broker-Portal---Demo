import React from "react";
import useToken from "../../../hooks/useToken";
import { useQuery } from "react-query";
import axios from "axios";
import { nodeSa } from "../../../src/AxiosParams";
import { useRouter } from "next/router";
import PageHeader from "../../../components/Bits/PageHeader";
import { Button, Chip, Stack } from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import AppPolicyStatusChip from "../../../components/Bits/AppPolicyStatusChip";

const NewSchemeList = () => {
  const accessToken = useToken();

  const router = useRouter();

  const getAllNewSchemes = useQuery(
    "getAllNewSchemes",
    () => {
      return axios.get(`${nodeSa}/brokerscheme/newSchemes`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  const schemes = getAllNewSchemes?.data?.data?.data;

  const columns = [
    {
      field: "Manage Scheme",
      headerName: "Manage Scheme",
      flex: 1,
      renderCell: (params) => (
        <Button
          onClick={() => onRowClick(params)}
          variant="contained"
          color="primary">
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

  const onRowClick = (row) => {
    router.push(
      `/BrokerManager/SchemaManagement/${row?.row?.BrokerageId}/CreateNewSchemeApplication/${row?.row?.id}/?currentStep=5`
    );
  };

  return (
    <div>
      <PageHeader title="New Schemes" />

      <Stack direction="row" sx={{ my: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push("/SchemeOnboarding/CreateNewScheme")}>
          Create New Scheme
        </Button>
      </Stack>
      <>
        {schemes && schemes.length > 0 && (
          <DataGridPremium
            autoHeight
            getRowId={(row) => row.id}
            columns={columns}
            rows={schemes}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            initialState={{
              ...schemes.initialState,
              sorting: {
                ...schemes.initialState?.sorting,
                sortModel: [{ field: "status", sort: "desc" }],
              },
            }}
          />
        )}
      </>
    </div>
  );
};

export default NewSchemeList;
