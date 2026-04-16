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

const ExceptionsReport = ({}) => {
  const accessToken = useToken();
  const router = useRouter();
  const { user } = useUser();

  let URL = `${nodeSa}/onboarding/reports/policyErrors`;

  const getErrors = useQuery(
    `getErrors`,
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
      field: "policies",
      headerName: "Child Policies",
      width: 120,
    },
    {
      field: "members",
      headerName: "Members",
      width: 120,
    },
    {
      field: "Issues",
      headerName: "Issues",
      width: 120,
    },
    {
      field: "issuePercentage",
      headerName: "Issue Percentage",
      width: 150,
      valueGetter: (params) => {
        if (params.row.members === 0) {
          return "N/A";
        }
        const issues = params.row.Issues || 0;
        const members = params.row.members || 1; // Avoid division by zero
        return ((issues / members) * 100).toFixed(2) + "%";
      },
    },
    {
      field: "VOPDmismatch",
      headerName: "VOPD Mismatch",
      width: 120,
    },
    {
      field: "deceased",
      headerName: "Deceased",
      width: 120,
    },
    {
      field: "benefitAllocation",
      headerName: "Benefit Allocation",
      width: 120,
    },
    {
      field: "memberType",
      headerName: "Member Type",
      width: 120,
    },
    {
      field: "other",
      headerName: "Other",
      width: 120,
    },
  ];

  // if getWorkload is success and data is not empty add row Id
  if (getErrors.isSuccess && getErrors?.data?.data?.data?.length > 0) {
    getErrors?.data?.data?.data.map((item, index) => {
      item.id = index + 1;
    });
  }

  return (
    <div>
      <h1>Exceptions Report</h1>
      {getErrors.isLoading && <LinearProgress />}
      <Stack sx={{ mt: 4 }}>
        {getErrors.isSuccess &&
          getErrors?.data?.data?.data &&
          getErrors?.data?.data?.data?.length > 0 && (
            <div
              style={{
                height: 750,
                width: "94vw",
              }}
            >
              <DataGridPremium
                getRowId={(row) => row.id}
                // autoHeight
                rows={getErrors?.data?.data?.data}
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
        {getErrors.isSuccess && !getErrors?.data?.data?.success && (
          <Alert severity="info">No exceptions</Alert>
        )}
      </Stack>
    </div>
  );
};

export default ExceptionsReport;
