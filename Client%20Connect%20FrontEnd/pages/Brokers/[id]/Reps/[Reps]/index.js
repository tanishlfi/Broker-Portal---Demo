import { Alert, Button } from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import LoadingTable from "components/Bits/LoadingTable";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const RepresentativeId = () => {
  const router = useRouter();
  const { id, Reps } = router.query;

  const accessToken = useToken();

  const { data, isLoading, error, isError, isRefetching } = useQuery(
    `brokerUser${Reps}`,
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/RolePlayer/RolePlayerPolicy/GetPoliciesByRepresentativeId/${Reps}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    { useErrorBoundary: true },
  );

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 200,
    },
    { field: "policyId", headerName: "policy Id", width: 200 },
    { field: "policyOwner", headerName: "policy Owner", width: 200 },
    { field: "productOption", headerName: "Scheme Name", width: 300 },
    {
      field: "edit",
      headerName: "Edit",
      width: 300,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              router.push(
                `/BrokerManager/Representative/${id}/policies/${Reps}/policy/${params.row.policyId}`,
              )
            }
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const rows = data?.data?.map((row, index) => ({
    id: index + 1,
    policyId: row.policyId,
    productOption: row?.productOption?.name,
    policyOwner: row?.policyOwner?.displayName,
    edit: row.policyId,
  }));

  return (
    <div>
      <PageHeader
        title="Representative"
        subTitle="Manage Representative Policies"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Brokers",
            href: "/Brokers",
          },
          {
            title: `${id}`,
            href: `/Brokers/${id}`,
          },
          {
            title: `Representatives`,
            href: `/Brokers/${id}/Representative`,
          },
          {
            title: `${Reps}`,
            href: `/Brokers/${id}/Representative/${Reps}`,
          },
        ]}
      />

      {isError && <Alert severity="error">{error.message}</Alert>}

      {isRefetching && (
        <Alert sx={{ mb: 2 }} variant="outlined" severity="info">
          Refetching
        </Alert>
      )}

      {isLoading ? (
        <LoadingTable />
      ) : (
        <>
          <DataGridPremium
            autoHeight
            slots={{ toolbar: GridToolbar }}
            rows={rows}
            columns={columns}
          />

          {/* <TableContainer>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Policy Id</StyledTableCell>
                  <StyledTableCell>Product Option</StyledTableCell>
                  <StyledTableCell>policyOwner</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data?.data &&
                  data.data?.map((row) => (
                    <TableRow
                      hover
                      sx={{
                        cursor: "pointer",
                      }}
                      key={row.policyId}
                      onClick={() =>
                        router.push({
                          pathname: `/BrokerManager/Representative/${id}/policies/${policyId}/policy/${row.policyId}`,
                        })
                      }>
                      <TableCell component="th" scope="row">
                        {row.policyId}
                      </TableCell>
                      <TableCell>{row?.productOption?.name}</TableCell>
                      <TableCell>{row?.policyOwner?.displayName}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer> */}
        </>
      )}
    </div>
  );
};

export default RepresentativeId;
