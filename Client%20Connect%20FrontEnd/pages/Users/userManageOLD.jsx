import { getAccessToken } from "@auth0/nextjs-auth0";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Stack,
  LinearProgress,
  Autocomplete,
  Typography,
  Divider,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  DataGridPremium,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  LicenseInfo,
} from "@mui/x-data-grid-premium";
import axios from "axios";
import AlertPopup from "components/Bits/AlertPopup";
import ErrorContainer from "components/Bits/ErrorContainer";
import PageHeader from "components/Bits/PageHeader";
import { StyledTableCell } from "components/Bits/TableCellAndTableRow";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import * as Yup from "yup";

const getBrokers = (accessToken) => {
  return axios.get(`${rmaAPI}/clc/api/Broker/Brokerage`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const UserManagement = ({ accessToken }) => {
  const router = useRouter();

  // LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_KEY);

  const brokers = useQuery("brokers", () => getBrokers(accessToken));

  const { data, error, isError, isLoading, isRefetching, isFetching } =
    useQuery("GetAllUsers", () =>
      axios.get(`${rmaAPI}/sec/api/User`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

  const GetCDABrokerRoles = useQuery(`GetCDABrokerRoles`, () => {
    return axios.get(`${rmaAPI}/sec/api/Role/GetCDABrokerRoles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  });

  const CreateNewUserRequest = useMutation(
    "AddNewUser",
    (data, accessToken) => {
      return axios.post(
        `${rmaAPI}/sec/api/UserRegistration/CreateUserV2`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
  );

  const EditUserRequest = useMutation("EditUser", (data) => {
    return axios.put(`${rmaAPI}/sec/api/User`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  });

  const EditUserFunc = (data) => {
    EditUserRequest.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries("GetAllUsers");
      },
    });
  };

  const CreateNewUserFunc = (data) => {
    CreateNewUserRequest.mutate(data, accessToken, {
      onSuccess: () => {
        queryClient.invalidateQueries("GetAllUsers");
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

  const EditUserButton = (response) => {
    let row = response.formattedValue;
    return (
      <strong>
        <EditUser
          user={row}
          EditUserFunc={EditUserFunc}
          EditUserRequest={EditUserRequest}
        />
      </strong>
    );
  };

  const DisableEnableUserButton = (response) => {
    let row = response.formattedValue;
    return (
      <strong>
        <DeleteUser
          user={row}
          EditUserFunc={EditUserFunc}
          EditUserRequest={EditUserRequest}
        />
      </strong>
    );
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "displayName",
      headerName: "Display Name",
      width: 180,
    },
    {
      field: "name",
      headerName: "Name",
      width: 180,
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
    },
    {
      field: "role",
      headerName: "Role",
      width: 220,
    },
    {
      field: "editUser",
      headerName: "Edit User",
      width: 150,
      renderCell: EditUserButton,
    },
    {
      field: "DisableEnableUser",
      headerName: "Disable/Enable User",
      width: 150,
      renderCell: DisableEnableUserButton,
    },
  ];

  const rows = data?.data.map((row) => {
    return {
      id: row.id,
      displayName: row.displayName,
      name: row.name,
      email: row.email,
      role: GetCDABrokerRoles?.data?.data?.find((x) => x?.id === row.roleId)
        ?.name,

      editUser: row,
      DisableEnableUser: row,
    };
  });

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

      <AlertPopup
        open={CreateNewUserRequest.isSuccess}
        message={"User Created Successfully"}
        severity={"success"}
      />
      <AlertPopup
        open={EditUserRequest.isSuccess}
        message={"User Edited Successfully"}
        severity={"info"}
      />
      <AlertPopup
        open={CreateNewUserRequest.isError}
        message={"Error Creating User"}
        severity={"error"}
      />
      <AlertPopup
        open={EditUserRequest.isError}
        message={"Error Editing User"}
        severity={"error"}
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
          <Stack sx={{ my: 4 }} direction="row" justifyContent="flex-start">
            <AddNewUserDialog
              brokers={brokers}
              CreateNewUserFunc={CreateNewUserFunc}
              accessToken={accessToken}
              CreateNewUserRequest={CreateNewUserRequest}
              GetCDABrokerRoles={GetCDABrokerRoles}
            />
          </Stack>

          {/* {(isFetching || isRefetching) && <LinearProgress />} */}

          <div style={{ height: "80vh", width: "100%" }}>
            <DataGridPremium
              rows={rows}
              columns={columns}
              disableSelectionOnClick
              slots={{
                toolbar: CustomToolbar,
                loadingOverlay: LinearProgress,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;

const AddNewUserDialog = ({
  CreateNewUserFunc,
  accessToken,
  CreateNewUserRequest,
  GetCDABrokerRoles,
  brokers,
}) => {
  const [open, setOpen] = React.useState(false);
  const [openAutoComplete, setOpenAutoComplete] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClickOpen}>
        Add New User
      </Button>
      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              UserContact: {
                Email: "",
              },
              Name: "",
              Surname: "",
              UserProfileTypeId: 3,
              BrokerageId: "",
              RoleName: "",
              Password: "",
              confirmPassword: "",

              PortalType: 4,
            }}
            validationSchema={Yup.object({
              Name: Yup.string().required("Required"),
              Surname: Yup.string().required("Required"),
              UserContact: Yup.object().shape({
                Email: Yup.string()
                  .email("Invalid email address")
                  .required("Required"),
              }),
              Password: Yup.string()
                .min(8, "Must be at least 8 characters")
                .required("Required"),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref("Password"), null], "Passwords must match")
                .required("Required"),
              RoleName: Yup.string().required("Required"),
              BrokerageId: Yup.string().required("Required"),
            })}
            onSubmit={(values) => {
              // CreateNewUserFunc(values);

              setTimeout(() => {
                handleClose();
              }, 1000);
            }}
          >
            {({ values, setFieldValue, errors }) => {
              return (
                <Form>
                  <Stack sx={{ my: 4 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextfieldWrapper name="Name" label="Name" />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper name="Surname" label="Surname" />
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldWrapper
                          name="UserContact.Email"
                          label="Email"
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextfieldWrapper
                          type="password"
                          name="Password"
                          label="Password"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          type="password"
                          error={
                            values.Password !== values.confirmPassword
                              ? true
                              : false
                          }
                          name="confirmPassword"
                          label="ConfirmPassword"
                        />
                      </Grid>

                      {/* <Grid item xs={6}>
                        {IdTypes.isLoading ? (
                          <Skeleton
                            variant="rectangular"
                            animation="wave"
                            width={"auto"}
                            height={50}
                          />
                        ) : (
                          <SelectWrapper
                            name="UserProfileTypeId"
                            label="User ID Type"
                            options={
                              IdTypes.data
                                ? IdTypes.data.data.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                  }))
                                : []
                            }
                          />
                        )}
                      </Grid> */}
                      <Grid item xs={6}>
                        {GetCDABrokerRoles.isLoading ? (
                          <Skeleton
                            variant="rectangular"
                            animation="wave"
                            width={"auto"}
                            height={50}
                          />
                        ) : (
                          <SelectWrapper
                            name="RoleName"
                            label="Select User Role"
                            options={
                              GetCDABrokerRoles?.data?.data
                                ? GetCDABrokerRoles?.data?.data.map((item) => ({
                                    value: item.name,
                                    label: item.name,
                                  }))
                                : []
                            }
                          />
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {brokers.isLoading ? (
                          <Skeleton
                            variant="rectangular"
                            animation="wave"
                            width={"auto"}
                            height={50}
                          />
                        ) : (
                          <>
                            <Autocomplete
                              id="Select Broker"
                              fullWidth
                              open={openAutoComplete}
                              onOpen={() => {
                                setOpenAutoComplete(true);
                              }}
                              onClose={() => {
                                setOpenAutoComplete(false);
                              }}
                              isOptionEqualToValue={(option, value) =>
                                `${option.id} ${option.name}` ===
                                `${value.id} ${value.name}`
                              }
                              getOptionLabel={(option) =>
                                `${option.id} ${option.name}`
                              }
                              options={brokers?.data?.data}
                              loading={brokers.isLoading}
                              onChange={(event, newValue) => {
                                setFieldValue("BrokerageId", newValue?.id);
                              }}
                              renderOption={(props, option) => (
                                <div {...props}>
                                  <Stack direction="row" spacing={2}>
                                    <Typography>{option.id}</Typography>
                                    <Typography color="primary.dark">
                                      {option.name}
                                    </Typography>
                                  </Stack>
                                  <Divider />
                                </div>
                              )}
                              renderInput={(params) => {
                                return (
                                  <TextField
                                    {...params}
                                    label="Select Broker"
                                    InputProps={{
                                      ...params.InputProps,
                                      endAdornment: (
                                        <React.Fragment>
                                          {brokers.isLoading ? (
                                            <CircularProgress
                                              color="inherit"
                                              size={20}
                                            />
                                          ) : null}
                                          {params.InputProps.endAdornment}
                                        </React.Fragment>
                                      ),
                                    }}
                                  />
                                );
                              }}
                            />

                            {/* <SelectWrapper
                              name="BrokerageId"
                              label="Select Broker"
                              options={
                                brokers?.data?.data
                                  ? brokers?.data?.data.map((item) => ({
                                      value: item.id,
                                      label: item.name,
                                    }))
                                  : []
                              }
                            /> */}
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mt: 2 }}
                        >
                          <Button
                            onClick={() => {
                              handleClose();
                            }}
                            variant="contained"
                            color="warning"
                          >
                            Cancel
                          </Button>
                          {CreateNewUserRequest.isLoading ? (
                            <Button
                              disabled={true}
                              variant="contained"
                              color="secondary"
                            >
                              Submitting
                            </Button>
                          ) : (
                            <Button
                              type="submit"
                              variant="contained"
                              color="secondary"
                            >
                              Submit
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Stack>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EditUser = ({ EditUserFunc, user, EditUserRequest }) => {
  const [open2, setOpen2] = React.useState(false);

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  return (
    <>
      <Button color="warning" onClick={handleClickOpen2}>
        Edit User
      </Button>
      <Dialog fullWidth maxWidth="md" open={open2} onClose={handleClose2}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              email: user?.email || "",
              userName: user?.userName || "",
              roleId: user?.roleId || "",
              roleName: user?.roleName || "",
              displayName: user?.displayName || "",
              permissionIds: [524, 535],
              authenticationTypeId: user?.authenticationTypeId || "",
              portalTypeId: user?.portalTypeId || "",
              id: user?.id || "",
              createdBy: user?.createdBy || "",
              modifiedBy: user?.modifiedBy || "",
            }}
            onSubmit={(values) => {
              EditUserFunc(values);
              setTimeout(() => {
                handleClose2();
              }, 1000);
            }}
          >
            {({ values }) => (
              <Form>
                <Stack sx={{ my: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextfieldWrapper name="userName" label="User Name" />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="displayName"
                        label="Display Name"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextfieldWrapper name="email" label="Email" />
                    </Grid>
                  </Grid>
                </Stack>
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mt: 2 }}
                  >
                    <Button
                      onClick={() => {
                        handleClose2();
                      }}
                      variant="contained"
                      color="warning"
                    >
                      Cancel
                    </Button>
                    {EditUserRequest.isLoading ? (
                      <Button
                        disabled={true}
                        variant="contained"
                        color="secondary"
                      >
                        Submitting
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                      >
                        Submit
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

const DeleteUser = ({ EditUserFunc, user, EditUserRequest }) => {
  const [open3, setOpen3] = React.useState(false);

  const handleClickOpen3 = () => {
    setOpen3(true);
  };

  const handleClose3 = () => {
    setOpen3(false);
  };

  return (
    <>
      <Button
        color={user?.isActive ? "error" : "success"}
        onClick={handleClickOpen3}
      >
        {user?.isActive ? "Disable User" : "Enable User"}
      </Button>
      <Dialog fullWidth maxWidth="md" open={open3} onClose={handleClose3}>
        <DialogTitle>
          {user?.isActive ? "Disable User" : "Enable User"}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              email: user?.email || "",
              userName: user?.userName || "",
              roleId: user?.roleId || "",
              roleName: user?.roleName || "",
              displayName: user?.displayName || "",
              permissionIds: [524, 535],
              authenticationTypeId: user?.authenticationTypeId || "",
              portalTypeId: user?.portalTypeId || "",
              id: user?.id || "",
              createdBy: user?.createdBy || "",
              modifiedBy: user?.modifiedBy || "",
              isActive: !user?.isActive,
            }}
            onSubmit={(values) => {
              EditUserFunc(values);
              setTimeout(() => {
                handleClose3();
              }, 1000);
            }}
          >
            {({ values, errors }) => {
              console.log(errors);
              return (
                <Form>
                  <Stack sx={{ my: 4 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          disabled
                          name="userName"
                          label="User Name"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          disabled
                          name="displayName"
                          label="Display Name"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldWrapper disabled name="email" label="Email" />
                      </Grid>
                    </Grid>
                  </Stack>
                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 2 }}
                    >
                      <Button
                        onClick={() => {
                          handleClose3();
                        }}
                        variant="contained"
                        color="warning"
                      >
                        Cancel
                      </Button>
                      {EditUserRequest.isLoading ? (
                        <Button
                          disabled={true}
                          variant="contained"
                          color="secondary"
                        >
                          Submitting
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          variant="contained"
                          color={user?.isActive ? "error" : "success"}
                        >
                          {user?.isActive ? "Disable User" : "Enable User"}
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export async function getServerSideProps(ctx) {
  const { accessToken } = await getAccessToken(ctx.req, ctx.res);

  return { props: { accessToken } };
}
