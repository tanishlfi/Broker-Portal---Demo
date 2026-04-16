import { useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Button,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import ErrorContainer from "components/Bits/ErrorContainer";
import PageHeader from "components/Bits/PageHeader";
import { StyledTableCell } from "components/Bits/TableCellAndTableRow";
// import BrokerAddUsers from "components/Broker/BrokerAddUser";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const Index = () => {
  const router = useRouter();

  const { id } = router.query;

  const accessToken = accessToken();

  const { data, isLoading, error, isError, isRefetching } = useQuery(
    `broker${id}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Broker/Brokerage/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
  );

  console.log(data?.data?.representatives);

  return (
    <div>
      <PageHeader
        title="Broker Users"
        subTitle="Manage Broker Users"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Representatives",
            href: "/Reps",
          },
        ]}
      />

      <ErrorContainer error={error} isError={isError} />

      {isLoading ? (
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
          {/* <Stack sx={{ my: 4 }} direction="row" justifyContent="flex-end">
            <BrokerAddUsers brokerId={id} />
          </Stack> */}
          <TableContainer>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>First Name</StyledTableCell>
                  <StyledTableCell>Id Number</StyledTableCell>
                  <StyledTableCell>Code</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data?.data?.representatives &&
                  data.data?.representatives.map((row) => (
                    <TableRow
                      hover
                      sx={{
                        cursor: "pointer",
                      }}
                      key={row.id}
                      onClick={() =>
                        router.push({
                          pathname: `/Brokers/${id}/Reps/${row.id}`,
                        })
                      }
                    >
                      <TableCell component="th" scope="row">
                        {row.firstName}
                      </TableCell>
                      <TableCell>{row.idNumber}</TableCell>
                      <TableCell>{row.code}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default Index;
