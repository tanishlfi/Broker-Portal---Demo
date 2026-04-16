import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Card,
  TextField,
} from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import CreateUser from "components/User/CreateUser";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";

const NewUsers = () => {
  const accessToken = useToken();

  const router = useRouter();

  const [search, setSearch] = useState("");
  const handleSearch = (e) => setSearch(e.target.value);

  const getAuth0Users = useQuery(
    `getAuth0Users`,
    () => {
      return axios.get(`/api/UserManagement/GetAllUsers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  const getAllRoles = useQuery(
    `getAllRoles`,
    async () => {
      let response = await axios.get(`${nodeSa}/auth0/roles`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data;
    },
    {
      enabled: !!accessToken,
    }
  );

  let users = getAuth0Users?.data?.data?.data;

  const searchedUser =
    users?.filter((u) => {
      const fullName = `${u.name} ${u.surname}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    }) || [];

  const rows = searchedUser?.map((user) => ({
    ...user,
    id: user.id,
  }));

  return (
    <div>
      <PageHeader
        title="Manage Users"
        subTitle="Manage Broker Users"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "User Management",
            href: `/Users`,
          },
        ]}
      />

      <Stack sx={{ mb: 3 }}>
        <CreateUser roles={getAllRoles?.data?.data} />
      </Stack>

      <Stack mb={3}>
        <TextField
          name="search"
          label="Search"
          variant="outlined"
          onChange={handleSearch}
          fullWidth
        />
      </Stack>

      {getAuth0Users.isLoading ? (
        <LinearProgress />
      ) : (
        <>
          {rows && rows?.length > 0 ? (
            <Card>
              <Stack sx={{ height: "90vh", width: "100%" }}>
                <DataGridPremium
                  slots={{ toolbar: GridToolbar }}
                  getRowId={(row) => row.user_id}
                  rows={rows}
                  columns={[
                    {
                      field: "View",
                      headerName: "View",
                      width: 150,
                      renderCell: (params) => (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => {
                            router.push(
                              `/Users/ViewUser/${params.row.user_id}`
                            );
                          }}
                        >
                          View User
                        </Button>
                      ),
                    },
                    // {
                    //   field: "nickname",
                    //   headerName: "Nickname",
                    //   flex: 1,
                    // },
                    { field: "name", headerName: "Name", flex: 1 },
                    {
                      field: "Role",
                      headerName: "Role",
                      flex: 1,
                      renderCell: (params) => (
                        <GetUserRoles user={params.row} />
                      ),
                    },

                    { field: "email", headerName: "Email", flex: 1 },
                    {
                      field: "blocked",
                      headerName: "blocked",
                      flex: 1,

                      renderCell: (params) => (
                        <Chip
                          color={params.value ? "error" : "success"}
                          label={params.value ? "Blocked" : "Active"}
                        />
                      ),
                    },
                    {
                      field: "last_login",
                      headerName: "Last Login",
                      flex: 1,
                      valueFormatter: (params) => {
                        return params.value
                          ? new Date(params.value).toLocaleDateString("en-GB") +
                              " " +
                              new Date(params.value).toLocaleTimeString("en-GB")
                          : null;
                      },
                    },
                  ]}
                />
              </Stack>
            </Card>
          ) : (
            <div>No Users</div>
          )}
        </>
      )}
    </div>
  );
};

export default NewUsers;

const GetUserRoles = ({ user, roles }) => {
  const accessToken = useToken();

  const getUserRoles = useQuery(
    `getUserRoles${user.user_id}`,
    async () => {
      let response = await axios.get(
        `${nodeSa}/auth0/roles/user/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    {
      enabled: !!accessToken,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
    }
  );

  if (getUserRoles.isLoading) return <CircularProgress />;

  return (
    <div>
      {getUserRoles?.data?.data[0]?.name ? (
        getUserRoles?.data?.data[0]?.name
      ) : (
        <Chip color="error" variant="outlined" label="No Role" />
      )}
    </div>
  );
};

export const getServerSideProps = withPageAuthRequired();
