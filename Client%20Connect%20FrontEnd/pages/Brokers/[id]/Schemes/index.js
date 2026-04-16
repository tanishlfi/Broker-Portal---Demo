import { getAccessToken } from "@auth0/nextjs-auth0";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Alert,
  Box,
  Button,
  Chip,
  Portal,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  DataGridPremium,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridToolbar,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import ErrorContainer from "components/Bits/ErrorContainer";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

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

const Schema = () => {
  const router = useRouter();

  const accessToken = useToken();

  const { id, fileName } = router.query;

  const { data, isLoading, error, isError } = useQuery(
    `scheme${id}`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken,
    }
  );

  const policyStatuses = useQuery(
    `PolicyStatuses`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Policy/PolicyStatus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  // console.log("schemes", data?.data);

  const rows = data?.data?.map((row) => {
    return {
      id: row.policyId,
      policyId: row.policyId,
      displayName: row.displayName,
      policyStatusId: row.policyStatusId,
      policyNumber: row.policyNumber,
    };
  });

  const columns = [
    {
      field: "View Scheme",
      headerName: "View Scheme",
      width: 200,
      editable: false,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              router.push(`/Brokers/${id}/Schemes/${params.row.policyId}`);
              // router.push(
              //   `/Administration/EditPolicy?brokerId=${id}&schemeId=${params.row.policyId}`,
              // );
            }}>
            View Scheme
          </Button>
        );
      },
    },

    // {
    //   field: "policyId",
    //   headerName: "Policy Id",
    //   width: 200,
    //   editable: false,
    // },
    {
      field: "displayName",
      headerName: "Display Name",
      width: 400,
      editable: false,
    },
    {
      field: "policyNumber",
      headerName: "Policy Number",
      width: 200,
      editable: false,
    },
    {
      field: "policyStatusId",
      headerName: "Policy Status Id",
      width: 200,
      editable: false,
      renderCell: (params) => {
        return (
          <Chip
            label={
              policyStatuses?.data?.data.find((status) =>
                status.id === params.row.policyStatusId ? status : null
              ).name
            }
            variant="outlined"
            color={
              policyStatuses?.data?.data.find((status) =>
                status.id === params.row.policyStatusId ? status : null
              ).name === "Active"
                ? "success"
                : "error"
            }
          />
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Broker Schema Management"
        subTitle="Manage Broker Schemes"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `Schema Management ${id}`,
            href: `/Brokers/${id}/Schemes`,
          },
        ]}
      />

      <Stack direction="row" justifyContent="flex-end">
        <Button
          sx={{ mb: 2 }}
          variant="contained"
          color="warning"
          disabled
          onClick={() =>
            router.push(
              `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication`
            )
          }>
          Start New Scheme Application
        </Button>
      </Stack>
      <ErrorContainer error={error} isError={isError} />

      <Box id="filter-panel" />

      {isLoading || policyStatuses.isLoading ? (
        <Stack spacing={0.2}>
          {[...Array(20)].map((item, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              animation="wave"
              width={"auto"}
              height={50}
            />
          ))}
        </Stack>
      ) : (
        <>
          {rows && rows.length > 0 ? (
            <DataGridPremium
              rows={rows}
              columns={columns}
              autoHeight
              slots={{
                toolbar: MyCustomToolbar,
              }}
              initialState={{
                sorting: {
                  sortModel: [{ field: "policyStatusId", sort: "asc" }],
                },
                filter: {
                  filterModel: {
                    items: [],
                    quickFilterExcludeHiddenColumns: true,
                  },
                },
              }}
            />
          ) : (
            <Alert severity="info">No Schemes Found</Alert>
          )}
        </>
      )}
    </div>
  );
};

export default Schema;
