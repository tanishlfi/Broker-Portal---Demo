import { getAccessToken } from "@auth0/nextjs-auth0";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Button, Chip, Skeleton, Stack, Alert } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import axios from "axios";
import ErrorContainer from "components/Bits/ErrorContainer";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const Schema = () => {
  const router = useRouter();
  const accessToken = useToken();
  const { id, fileName } = router.query;

  const fetchScheme = async () => {
    const response = await axios.get(
      `${rmaAPI}/clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  };

  const fetchPolicyStatuses = async () => {
    const response = await axios.get(`${rmaAPI}/clc/api/Policy/PolicyStatus`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  };

  const { data, isLoading, error, isError } = useQuery(
    [`scheme${id}`, accessToken],
    fetchScheme,
    {
      enabled: !!accessToken && !!id,
    },
  );

  const policyStatuses = useQuery("PolicyStatuses", fetchPolicyStatuses, {
    enabled: !!accessToken,
  });

  const rows = data?.map((row) => ({
    id: row.policyId,
    policyId: row.policyId,
    displayName: row.displayName,
    policyStatusId: row.policyStatusId,
  }));

  const columns = [
    {
      field: "View Scheme",
      headerName: "View Scheme",
      width: 200,
      editable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            router.push(
              `/BrokerManager/SchemaManagement/${id}/Schema/${params.row.policyId}`,
            );
          }}
        >
          View Scheme
        </Button>
      ),
    },
    {
      field: "policyId",
      headerName: "Policy Id",
      width: 200,
      editable: false,
    },
    {
      field: "displayName",
      headerName: "Display Name",
      width: 400,
      editable: false,
    },
    {
      field: "policyStatusId",
      headerName: "Policy Status Id",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const status = policyStatuses.data?.find(
          (status) => status.id === params.row.policyStatusId,
        );
        return (
          <Chip
            label={status?.name}
            variant="outlined"
            color={status?.name === "Active" ? "success" : "error"}
          />
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Broker Scheme Management"
        subTitle="Manage Broker Schemes"
        breadcrumbs={[
          { title: "Home", href: "/" },
          {
            title: `Schema Management ${id}`,
            href: `/BrokerManager/SchemaManagement/${id}`,
          },
        ]}
      />

      <ErrorContainer error={error} isError={isError} />

      {isLoading || policyStatuses.isLoading ? (
        <Stack spacing={0.2}>
          {[...Array(20)].map((_, index) => (
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
              initialState={{
                sorting: {
                  sortModel: [{ field: "policyStatusId", sort: "asc" }],
                },
              }}
            />
          ) : (
            <Alert>No Schemes Found</Alert>
          )}
        </>
      )}
    </div>
  );
};

export default Schema;
