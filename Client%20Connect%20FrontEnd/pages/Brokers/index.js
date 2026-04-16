import { useOidcAccessToken } from "@axa-fr/react-oidc";
import axios from "axios";
import React from "react";
import PageHeader from "../../components/Bits/PageHeader";
import { useQuery } from "react-query";
import { Alert, Box, Button, Portal } from "@mui/material";
import { useRouter } from "next/router";
import { rmaAPI } from "src/AxiosParams";
import LoadingTable from "components/Bits/LoadingTable";
import {
  DataGridPremium,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import useToken from "hooks/useToken";

const getBrokers = (accessToken) => {
  return axios.get(`${rmaAPI}/clc/api/Broker/Brokerage`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}

function MyCustomToolbar(props) {
  return (
    <React.Fragment>
      <Portal container={() => document.getElementById("filter-panel")}>
        <GridToolbarQuickFilter />
      </Portal>
      <CustomToolbar {...props} />
    </React.Fragment>
  );
}

const Index = ({ props }) => {
  const router = useRouter();

  const accessToken = useToken();

  const { data, isLoading, isError, error } = useQuery(
    "brokers",
    () => getBrokers(accessToken),
    {
      enabled: !!accessToken,
    }
  );

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "View Broker",
      headerName: "View Broker",
      width: 140,
      renderCell: (params) => {
        const obj = params.row;
        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              router.push({
                pathname: `/Brokers/${obj.id}`,
              })
            }>
            View Broker
          </Button>
        );
      },
    },
    {
      field: "View Schemes",
      headerName: "View Schemes",
      width: 140,
      renderCell: (params) => {
        const obj = params.row;
        return (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() =>
              router.push({
                pathname: `/Brokers/${obj.id}/Schemes`,
              })
            }>
            View Schemes
          </Button>
        );
      },
    },

    { field: "fspNumber", headerName: "FSP Number", width: 130 },
    { field: "name", headerName: "Name", width: 500 },
    { field: "regNo", headerName: "Reg No", width: 170 },
    {
      field: "startDate",
      headerName: "startDate",
      width: 130,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
    },
    { field: "isActive", headerName: "Active", width: 130 },
    { field: "isAuthorised", headerName: "Authorised", width: 130 },
    { field: "code", headerName: "code", width: 130 },
    { field: "createdBy", headerName: "createdBy", width: 130 },
  ];

  const handleNavigate = (obj) => {
    console.log(obj.id);
  };

  return (
    <>
      <PageHeader
        title="Brokers"
        subTitle="Manage Brokers"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Brokers",
            href: "/Brokers",
          },
        ]}
      />

      {isError && <Alert severity="error">{error?.message}</Alert>}
      {isLoading ? (
        <LoadingTable />
      ) : (
        <>
          <Box id="filter-panel" />
          <Box
            sx={{
              height: 900,
            }}>
            {data?.data && data?.data?.length > 0 && (
              <DataGridPremium
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
                  sorting: {
                    sortModel: [{ field: "id", sort: "asc" }],
                  },
                }}
                rows={data?.data}
                columns={columns}
              />
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default Index;
