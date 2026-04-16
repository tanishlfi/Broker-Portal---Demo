import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import useToken from "hooks/useToken";
import { Grid } from "@mui/material";
import { Form, Formik } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";

import AlertPopup from "components/Bits/AlertPopup";
import { useRouter } from "next/router";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateUser({ roles }) {
  const [open, setOpen] = React.useState(false);

  function generateRandomPassword(length) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }

  const router = useRouter();

  const accessToken = useToken();

  const CreateUser = useMutation(
    `CreateUSer`,
    async (data) => {
      let response = await axios.post(`${nodeSa}/auth0/user`, data, {
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen}>
        Create New User
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Create New User
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Close
            </Button>
          </Toolbar>
        </AppBar>

        <AlertPopup
          open={CreateUser.isError}
          severity="error"
          message={CreateUser.error?.response?.data?.error?.msg}
        />
        <AlertPopup
          open={CreateUser.isSuccess}
          severity="success"
          message="User Created Successfully"
        />

        <Grid container display="flex" justifyContent="center">
          <Grid item xs={8}>
            <Formik
              initialValues={{
                email: "",
                name: "",
                // password: generateRandomPassword(12),
                connection: "email",
                verify_email: false,
                email_verified: false,
                user_metadata: {
                  BrokerageIds: [],
                  SchemeIds: [],
                },
              }}
              onSubmit={async (values) => {
                CreateUser.mutate(values, {
                  onSuccess: (data) => {
                    router.push(`/Users/ViewUser/${data?.data?.user_id}`);
                  },
                });
              }}>
              {({ isSubmitting, values }) => {
                return (
                  <Form>
                    <Grid
                      spacing={2}
                      sx={{ mt: 4 }}
                      container
                      display="flex"
                      justifyContent="center">
                      <Grid item xs={12}>
                        <TextfieldWrapper
                          name="email"
                          label="Email"
                          type="email"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="name"
                          label="name"
                          type="text"
                        />
                      </Grid>

                      <Grid item xs={6}></Grid>

                      <Grid item sx={{ mt: 3, mb: 6 }} xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="secondary"
                          disabled={isSubmitting || CreateUser.isLoading}
                          fullWidth>
                          {isSubmitting || CreateUser.isLoading
                            ? "Submitting..."
                            : "Submit"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                );
              }}
            </Formik>
          </Grid>
        </Grid>
      </Dialog>
    </div>
  );
}

// {
//     "email": "string",
//     "phone_number": "string",
//     "user_metadata": {},
//     "blocked": false,
//     "email_verified": false,
//     "phone_verified": false,
//     "app_metadata": {},
//     "given_name": "string",
//     "family_name": "string",
//     "name": "string",
//     "nickname": "string",
//     "picture": "string",
//     "user_id": "string",
//     "connection": "string",
//     "password": "string",
//     "verify_email": false,
//     "username": "string"
//   }
