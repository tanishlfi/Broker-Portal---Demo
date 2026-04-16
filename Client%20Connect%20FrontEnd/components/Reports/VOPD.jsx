import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Chip,
  Stack,
  Alert,
  Portal,
  LinearProgress,
  Box,
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
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

const VOPD = ({}) => {
  const accessToken = useToken();
  const router = useRouter();
  const { user } = useUser();

  let URL = `${nodeSa}/onboarding/reports/vopd`;

  const getVOPD = useQuery(
    `getVOPD`,
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
      onSuccess: (data) => {
        console.log("data", data);
      },
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

  const valueFormatter = (value) => `${value}`;
  const series = [
    {
      dataKey: "members",
      label: "Members",
      valueFormatter,
    },
    { dataKey: "validIds", label: "Valid IDs", valueFormatter },
    { dataKey: "VopdVerified", label: "VOPD Verified", valueFormatter },
    { dataKey: "deceased", label: "Deceased", valueFormatter },
  ];

  if (getVOPD.isSuccess && getVOPD?.data?.data?.data?.length > 0) {
    getVOPD?.data?.data?.data.map((item, index) => {
      item.id = index + 1;
    });
  }

  const chartSetting = {
    yAxis: [
      {
        label: "No of Ids",
      },
    ],
    // width: 500,
    // height: 300,
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: "translate(-20px, 0)",
      },
    },
  };

  return (
    <div>
      <h1>VOPD Summary</h1>
      {getVOPD.isLoading && <LinearProgress />}
      <Stack sx={{ mt: 4 }}>
        {getVOPD.isSuccess &&
          getVOPD?.data?.data?.data &&
          getVOPD?.data?.data?.data?.length > 0 && (
            <>
              <Box sx={{ height: "60vh", mt: 4, width: "80vw" }}>
                <BarChart
                  dataset={getVOPD?.data?.data?.data}
                  xAxis={[{ scaleType: "band", dataKey: "ProviderName" }]}
                  series={series}
                  {...chartSetting}
                />
              </Box>
            </>
          )}
        {getVOPD.isSuccess && !getVOPD?.data?.data?.success && (
          <Alert severity="info">No VOPD</Alert>
        )}
      </Stack>
    </div>
  );
};

export default VOPD;
