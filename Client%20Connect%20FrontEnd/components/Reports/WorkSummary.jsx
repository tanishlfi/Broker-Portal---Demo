import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Chip,
  Stack,
  Alert,
  Portal,
  LinearProgress,
} from "@mui/material";
import {
  DataGridPremium,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";

const WorkSummary = ({}) => {
  const accessToken = useToken();
  const router = useRouter();
  const { user } = useUser();

  let URL = `${nodeSa}/onboarding/reports/workload`;

  const getWorkload = useQuery(
    `getWorkLoad`,
    async () => {
      return await axios.get(`${URL}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      refetchInterval: 15000,
      // onSuccess: (data) => {
      //   console.log("data", data);
      // },
    },
  );

  const columns = [
    {
      field: "ProviderName",
      headerName: "Scheme",
      width: 300,
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 300,
    },
    {
      field: "policies",
      headerName: "Policies",
      width: 200,
    },
    {
      field: "Draft",
      headerName: "Draft",
      width: 100,
    },
    {
      field: "Processing",
      headerName: "Processing",
      width: 100,
    },
    {
      field: "Error",
      headerName: "Error",
      width: 100,
    },
    {
      field: "Duplicate",
      headerName: "Duplicate",
      width: 100,
    },
    {
      field: "Submitted",
      headerName: "Submitted",
      width: 100,
    },
    {
      field: "Accepted",
      headerName: "Accepted",
      width: 100,
    },
    {
      field: "Rejected",
      headerName: "Rejected",
      width: 100,
    },
    {
      field: "Completed",
      headerName: "Completed",
      width: 100,
    },
    {
      field: "Removed",
      headerName: "Removed",
      width: 100,
    },
  ];

  // if getWorkload is success and data is not empty add row Id
  if (getWorkload.isSuccess && getWorkload?.data?.data?.data?.length > 0) {
    getWorkload?.data?.data?.data.map((item, index) => {
      item.id = index + 1;
    });
  }

  return (
    <div>
      <h1>Work Summary</h1>
      {getWorkload.isLoading && <LinearProgress />}
      <Stack sx={{ mt: 4 }}>
        {getWorkload.isSuccess &&
          getWorkload?.data?.data?.data &&
          getWorkload?.data?.data?.data?.length > 0 && (
            <div
              style={{
                height: 750,
                width: "94vw",
              }}
            >
              <DataGridPremium
                getRowId={(row) => row.id}
                // autoHeight
                rows={getWorkload?.data?.data?.data}
                columns={columns}
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
                  // sorting: {
                  //   sortModel: [{ field: "createdAt", sort: "desc" }],
                  // },
                }}
                pageSizeOptions={[5, 10, 25]}
              />
            </div>
          )}
        {getWorkload.isSuccess && !getWorkload?.data?.data?.success && (
          <Alert severity="info">No work allocated</Alert>
        )}
      </Stack>
    </div>
  );
};

export default WorkSummary;
