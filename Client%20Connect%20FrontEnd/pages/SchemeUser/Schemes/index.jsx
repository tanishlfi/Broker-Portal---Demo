import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import PageHeader from "components/Bits/PageHeader";
import { rmaAPI } from "src/AxiosParams";
import useToken from "hooks/useToken";
import { useQueries } from "react-query";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
const Schemes = () => {
  const { user, isLoading } = useUser();

  const userSchemes = user?.rmaAppUserMetadata?.SchemeIds;

  return (
    <div>
      <PageHeader title="Schemes" />

      {userSchemes && userSchemes.length > 0 ? (
        <UserSchemes userSchemes={userSchemes} />
      ) : (
        <div>No Schemes</div>
      )}
    </div>
  );
};

export default Schemes;

const getEditedPolicyById = (accessToken, policyId) => {
  return axios.get(`${rmaAPI}/clc/api/Policy/Policy/${policyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const UserSchemes = ({ userSchemes }) => {
  const accessToken = useToken();

  const router = useRouter();

  let getUserSchemes = useQueries(
    userSchemes?.map((scheme) => ({
      queryKey: ["scheme", scheme],
      queryFn: async () => {
        const response = await axios.get(
          `${rmaAPI}/clc/api/Policy/Policy/${scheme}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.data;
      },
      enabled: !!accessToken && !!scheme,
    }))
  );

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>View Policy</TableCell>
              <TableCell>Policy Id</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Brokerage Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getUserSchemes.map((row, index) => {
              console.log("Scheme", row);
              if (row.isLoading) {
                return (
                  <TableRow
                    key={index}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}>
                    <TableCell>Loading...</TableCell>
                  </TableRow>
                );
              }
              return (
                <TableRow
                  key={index}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}>
                  <TableCell component="th" scope="row">
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        router.push(
                          `/BrokerManager/SchemaManagement/${row?.data?.brokerageId}/Schema/${row.data?.policyId}`
                        );
                      }}>
                      View Scheme
                    </Button>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.data?.policyId}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.data?.clientName}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.data?.brokerageName}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
