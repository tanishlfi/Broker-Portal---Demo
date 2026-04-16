import { Box, Portal, Stack, Typography } from "@mui/material";
import {
  DataGridPremium,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import CreateNewBrokerUser from "components/NewBrokerComponents/CreateNewBrokerUser";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";

const NewBrokerOnboarding = () => {
  const accessToken = useToken();
  const router = useRouter();

  // get Users by Role id rol_tj4jFUvK15VZglWd

  const { data, isLoading, error, isError } = useQuery(
    `UsersByRole`,
    () =>
      axios.get(`${nodeSa}/auth0/getUsersByRole/rol_tj4jFUvK15VZglWd`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  const onRowClick = (id) => {
    console.log("onRowClick");
    router.push(`/NewBrokerOnboarding/${id}?currentStep=0`);
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Broker by User
          </Typography>
          <GridToolbarQuickFilter />
        </Portal>
        <CustomToolbar {...props} />
      </React.Fragment>
    );
  }

  return (
    <div>
      <PageHeader
        title="Broker Onboarding"
        subTitle="Add New Broker"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Broker Onboarding",
            href: "/NewBrokerOnboarding",
          },
        ]}
      />

      <Stack sx={{ mb: 3 }} direction="row" justifyContent="flex-end">
        <CreateNewBrokerUser />
      </Stack>

      {isLoading && <div>Loading...</div>}

      <Stack
        sx={{
          width: "100%",
          height: "100vh",
        }}>
        <Box id="filter-panel" />
        {data?.data?.data && data?.data?.data?.length > 0 && (
          <DataGridPremium
            disableExport
            onRowClick={(params) => onRowClick(params.id)}
            getRowId={(row) => row.id}
            slots={{
              toolbar: MyCustomToolbar,
            }}
            columns={[
              { field: "name", headerName: "Name", width: 200 },
              { field: "email", headerName: "Email", width: 400 },
            ]}
            rows={data?.data?.data?.map((item) => {
              return {
                id: item.user_id,
                name: item.name,
                email: item.email,
              };
            })}
          />
        )}
      </Stack>
    </div>
  );
};

export default NewBrokerOnboarding;
