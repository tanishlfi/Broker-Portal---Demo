import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
} from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import BrokerCreateUser from "components/User/BrokerCreateUser";
import CreateUser from "components/User/CreateUser";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";

const UserManagement = () => {
  const accessToken = useToken();
  const router = useRouter();

  const { id } = router.query;

  const getAuth0Users = useQuery(
    `getAuth0BrokerUsers`,
    () => {
      return axios.get(`${nodeSa}/auth0/brokerUser/${id}`, {
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
        <BrokerCreateUser id={id} />
      </Stack>
      {getAuth0Users.isLoading ? (
        <LinearProgress />
      ) : (
        <>
          {getAuth0Users?.data?.data?.data &&
          getAuth0Users?.data?.data?.data?.length > 0 ? (
            <DataGridPremium
              autoHeight
              slots={{ toolbar: GridToolbar }}
              getRowId={(row) => row.user_id}
              rows={getAuth0Users?.data?.data?.data}
              columns={[
                {
                  field: "View",
                  headerName: "View",
                  width: 150,

                  renderCell: (params) => (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        router.push(
                          `/BrokerManager/UserManagement/${id}/User/${params.row.user_id}`
                        );
                      }}>
                      View User
                    </Button>
                  ),
                },
                {
                  field: "Role",
                  headerName: "Role",
                  width: 250,

                  renderCell: (params) => <GetUserRoles user={params.row} />,
                },
                { field: "name", headerName: "Name", width: 200 },
                { field: "email", headerName: "Email", width: 200 },
                { field: "last_login", headerName: "Last Login", width: 200 },
                {
                  field: "logins_count",
                  headerName: "Login Count",
                  width: 120,
                },
                { field: "created_at", headerName: "Created At", width: 200 },
                { field: "updated_at", headerName: "Updated At", width: 200 },
                { field: "last_ip", headerName: "Last IP", width: 200 },
                {
                  field: "email_verified",
                  headerName: "Email Verified",
                  width: 200,
                },
                { field: "user_id", headerName: "User ID", width: 200 },
                { field: "nickname", headerName: "Nickname", width: 200 },
                { field: "picture", headerName: "Picture", width: 200 },
                { field: "identities", headerName: "Identities", width: 200 },
              ]}
            />
          ) : (
            <div>No Users</div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;

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
