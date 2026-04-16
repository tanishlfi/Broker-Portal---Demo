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

const ApproverWorkSummary = ({}) => {
  const accessToken = useToken();
  const router = useRouter();
  const { user } = useUser();

  let URL = `${nodeSa}/onboarding/reports/approverWorkload`;

  const getWorkload = useQuery(
    `approverWorkload`,
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
      field: "BrokerageName",
      headerName: "Brokerage",
      width: 300,
    },
    {
      field: "Scheme",
      headerName: "Scheme",
      width: 300,
    },
    {
      field: "fileName",
      headerName: "File",
      width: 300,
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 300,
    },
    {
      field: "approverId",
      headerName: "Approver",
      width: 300,
    },
    {
      field: "policies",
      headerName: "Policies",
      width: 200,
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
      <h1>Approver Summary</h1>
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
                  sorting: {
                    sortModel: [{ field: "approverId", sort: "asc" }],
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
              />
            </div>
          )}
        {getWorkload.isSuccess && !getWorkload?.data?.data?.success && (
          <Alert severity="info">No qpprovals allocated</Alert>
        )}
      </Stack>
    </div>
  );
};

export default ApproverWorkSummary;
