import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListSubheader,
  Paper,
  Skeleton,
  Stack,
  TableCell,
} from "@mui/material";
import * as React from "react";
import Typography from "@mui/material/Typography";
import useToken from "hooks/useToken";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import { useParams } from "next/navigation";
import ContentItem from "components/Containers/ContentItem";

import AlertPopup from "components/Bits/AlertPopup";
import PageHeader from "components/Bits/PageHeader";
import AllocateUserRole from "components/User/AllocateUserRole";

import { Form, Formik } from "formik";
import SelectSchemeMultiSelect from "components/User/SelectSchemeMultiSelect";
import ManageUserConnections from "components/User/ManageUserConnections";

export default function ViewUser() {
  const accessToken = useToken();
  const userId = useParams()?.userId;

  const getUserById = useQuery(
    `getUserById${userId}`,
    async () => {
      let response = await axios.get(`${nodeSa}/auth0/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data;
    },
    {
      enabled: !!accessToken && userId ? true : false,
    }
  );

  console.log(getUserById);

  const getUserRoles = useQuery(
    `getUserRoles${userId}`,
    async () => {
      let response = await axios.get(
        `${nodeSa}/auth0/roles/user/${getUserById?.data?.data?.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    {
      enabled: !!accessToken && getUserById?.data?.data?.user_id ? true : false,
    }
  );

  return (
    <Stack sx={{ pb: 20 }}>
      <PageHeader
        title="Manage User"
        subTitle="User"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "User Management",
            href: `/Users`,
          },
          {
            title: "User",
            href: `/UserManagement/${userId}`,
          },
        ]}
      />

      {getUserById.isLoading && (
        <Stack>
          <Skeleton sx={{ m: 0, p: 0 }} height={150} width={400} />
          <Skeleton sx={{ m: 0, p: 0 }} height={400} />
          <Skeleton sx={{ m: 0, p: 0 }} height={400} />
          <Skeleton sx={{ m: 0, p: 0 }} height={400} />
        </Stack>
      )}

      <CardHeader
        avatar={
          <Avatar
            sx={{ width: 56, height: 56 }}
            src={getUserById?.data?.data?.picture}
          />
        }
        title={
          <Typography variant="h6">{getUserById?.data?.data?.name}</Typography>
        }
        subheader={`user_id: ${getUserById?.data?.data?.user_id}`}
      />

      <Grid container>
        <Grid item xs={12}>
          <ViewUserDetails user={getUserById?.data?.data} />
          <Divider sx={{ my: 2 }} />

          <ManageUserRole
            user={getUserById?.data?.data}
            userRole={getUserRoles?.data?.data[0]?.id}
          />
          <Divider sx={{ my: 2 }} />

          <ManageUserConnections user={getUserById?.data?.data} />
        </Grid>
      </Grid>
    </Stack>
  );
}

const ViewUserDetails = ({ user }) => {
  return (
    <Card variant="outlined">
      <CardHeader title="User Details" />
      <Grid container>
        <Grid item lg={4} md={6} sm={12}>
          <List>
            <ContentItem title="Name" value={user?.name} />
            <ContentItem title="Nickname" value={user?.nickname} />
          </List>
        </Grid>
        <Grid item lg={4} md={6} sm={12}>
          <List>
            <ContentItem title="Email" value={user?.email} />
            <ContentItem
              title="Primary Identity Provider"
              value={user?.identities[0]?.provider}
            />
          </List>
        </Grid>
        <Grid item lg={4} md={6} sm={12}>
          <List>
            {user?.created_at && (
              <ContentItem
                title="Signed Up"
                value={
                  new Date(user?.created_at).toLocaleDateString() +
                  ", " +
                  new Date(user?.created_at).toLocaleTimeString()
                }
              />
            )}
            {user?.last_login && (
              <ContentItem
                title="Last Login"
                value={
                  new Date(user?.last_login).toLocaleDateString() +
                  ", " +
                  new Date(user?.last_login).toLocaleTimeString()
                }
              />
            )}
          </List>
        </Grid>
      </Grid>
    </Card>
  );
};

const ManageUserRole = ({ user, userRole }) => {
  const accessToken = useToken();

  const queryClient = useQueryClient();

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

  const AllocateRoleToUser = useMutation(
    `AllocateRoleToUser`,
    async (data) => {
      let response = await axios.put(
        `${nodeSa}/auth0/roles/user/${user.user_id}`,
        data,
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
      onSuccess: () => {
        queryClient.invalidateQueries(`getUserRoles${user?.user_id}`);
      },
    }
  );

  if (userRole) {
    return (
      <Card variant="outlined">
        <CardHeader
          title="User Role"
          // action={<Button>Change User Role</Button>}
        />
        <List>
          <ContentItem
            title="Role Name"
            value={
              getAllRoles?.data?.data?.find((role) => role.id === userRole)
                ?.name
            }
          />
          <ContentItem
            title="Role Description"
            value={
              getAllRoles?.data?.data?.find((role) => role.id === userRole)
                ?.description
            }
          />
        </List>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="User Role" />
      <AllocateUserRole
        AllocateRoleToUser={AllocateRoleToUser}
        roles={getAllRoles?.data?.data}
      />
      <Alert severity="warning">
        <Typography variant="body2">
          This user does not have a role assigned to them.
        </Typography>
      </Alert>

      <AlertPopup
        open={AllocateRoleToUser?.isSuccess}
        severity="success"
        message="Role Added"
      />
      <AlertPopup
        open={AllocateRoleToUser?.isError}
        severity="error"
        message="Role Failed"
      />
    </Card>
  );
};

const Connections = ({ user, userRole }) => {
  const accessToken = useToken();
  const queryClient = useQueryClient();

  const [selectedBroker, setSelectedBroker] = React.useState(null);
  const [selectedScheme, setSelectedScheme] = React.useState([]);

  const [allocate, setAllocation] = React.useState(false);

  const AllocateUserDetails = useMutation(
    `AllocateUserDetails${user?.user_id}`,

    async (data) => {
      let response = await axios.patch(
        `${nodeSa}/auth0/user/${user?.user_id}`,
        data,
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
      onSuccess: () => {
        queryClient.invalidateQueries(`getUserMetaData${user?.user_id}`);
      },
    }
  );

  const HandleSubmit = () => {
    // let subData = {
    //   user_metadata: {
    //     ...user?.user_metadata,
    //     BrokerageIds: [...user?.user_metadata?.BrokerageIds],
    //     SchemeIds: [
    //       ...user?.user_metadata?.SchemeIds,
    //       selectedScheme.map((x) => x.policyId),
    //     ],
    //   },
    // };

    // AllocateConnections.mutate(subData);

    // AllocateUserDetails.mutate({ user_metadata });

    setSelectedBroker(null);
    setSelectedScheme(null);
  };

  return (
    <Card>
      <CardHeader
        title="Connections"
        // action={
        //   <AllocateBroker
        //     HandleSubmit={HandleSubmit}
        //     select={selectedBroker}
        //     setSelect={setSelectedBroker}
        //   />
        // }
      />

      <CardContent>
        {user?.user_metadata?.BrokerageIds?.length > 0 && (
          <>
            {user?.user_metadata &&
              user?.user_metadata?.BrokerageIds?.length > 0 &&
              user?.user_metadata?.BrokerageIds?.map((row, index) => (
                <Stack key={index}>
                  <ViewBrokerDetails id={row} />

                  {userRole?.id === "rol_aBjjCZa6cHimVK0s" && (
                    <Formik
                      initialValues={{
                        user_metadata: [
                          {
                            SchemeIds: [],
                          },
                        ],
                      }}
                      onSubmit={async (values) => {
                        let newValues = {
                          ...values,
                          user_metadata: {
                            ...user.user_metadata,
                            SchemeIds: [
                              ...user.user_metadata.SchemeIds,
                              ...values.user_metadata.SchemeIds.map(
                                (x) => x.policyId
                              ),
                            ],
                          },
                        };

                        AllocateUserDetails.mutate(newValues);
                      }}>
                      {({ setFieldValue }) => {
                        return (
                          <Form>
                            {user?.user_metadata?.SchemeIds && (
                              <SelectSchemeMultiSelect
                                filterSchemes={user?.user_metadata?.SchemeIds}
                                id={row}
                                setSelect={setFieldValue}
                              />
                            )}

                            <Button
                              type="submit"
                              variant="contained"
                              onClick={HandleSubmit}>
                              Submit
                            </Button>
                          </Form>
                        );
                      }}
                    </Formik>
                  )}
                  {user?.user_metadata?.BrokerageIds?.length > 0 && (
                    <>
                      {user?.user_metadata &&
                        user?.user_metadata?.SchemeIds?.length > 0 &&
                        user?.user_metadata?.SchemeIds?.map((row, index) => (
                          <Stack key={index}>
                            <ViewSchemeDetails id={row} />
                          </Stack>
                        ))}
                    </>
                  )}
                </Stack>
              ))}
          </>
        )}
      </CardContent>

      <AlertPopup
        open={AllocateUserDetails?.isSuccess}
        severity="success"
        message="Connection Added"
      />
      <AlertPopup
        open={AllocateUserDetails?.isError}
        severity="error"
        message="Connection Failed"
      />
    </Card>
  );
};

const ViewBrokerDetails = ({ id }) => {
  const accessToken = useToken();

  const { data, isLoading, error, isError, isRefetching } = useQuery(
    `broker${id}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Broker/Brokerage/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <>
      <List
        dense
        sx={{
          width: "100%",
        }}
        subheader={
          <ListSubheader color="inherit" variant="outlined" component={Paper}>
            Broker Details
          </ListSubheader>
        }>
        <Stack direction="row">
          <ContentItem title="Name" value={data?.data?.name} />
          <ContentItem title="FSP Number" value={data?.data?.fspNumber} />
        </Stack>

        <Stack direction="row">
          <ContentItem title="Registration Number" value={data?.data?.regNo} />
          <ContentItem
            title="Legal Capacity"
            value={data?.data?.legalCapacity}
          />
        </Stack>
        <Stack direction="row">
          <ContentItem title="Company Type" value={data?.data?.companyType} />
          <ContentItem title="Status" value={data?.data?.status} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="faxNo" value={data?.data?.faxNo} />
          <ContentItem title="telNo" value={data?.data?.telNo} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="fspWebsite" value={data?.data?.fspWebsite} />
          <ContentItem title="finYearEnd" value={data?.data?.finYearEnd} />
        </Stack>

        <ContentItem
          title="medicalAccreditationNo"
          value={data?.data?.medicalAccreditationNo}
        />
      </List>
    </>
  );
};

const ViewSchemeDetails = ({ id }) => {
  const accessToken = useToken();

  const GetPolicyById = useQuery(
    `GetPolicyById${id}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Policy/Policy/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  return (
    <>
      {" "}
      {GetPolicyById?.isLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <Stack spacing={2} sx={{ pb: 2 }}>
          <Card>
            <List
              dense
              sx={{
                width: "100%",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Policy Details
                </ListSubheader>
              }>
              <ContentItem
                title="Policy ID"
                value={GetPolicyById?.data?.data?.policyId}
              />
              <ContentItem
                title="Brokerage Name"
                value={GetPolicyById?.data?.data?.brokerageName}
              />
              <ContentItem
                title="Policy Number"
                value={GetPolicyById.data?.data?.policyNumber}
              />
            </List>
          </Card>
        </Stack>
      )}
    </>
  );
};
