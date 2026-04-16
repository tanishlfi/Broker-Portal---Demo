import * as React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { Grid, Alert } from "@mui/material";
import { Form, Formik } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import SelectUser from "./SelectUser";
import PageHeader from "components/Bits/PageHeader";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import useToken from "hooks/useToken";
import { useMutation } from "react-query";
import axios from "axios";
import AlertPopup from "components/Bits/AlertPopup";
import { nodeSa } from "src/AxiosParams";
import * as Yup from "yup";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateNotification() {
  const [open, setOpen] = React.useState(false);

  const accessToken = useToken();

  const sendNotification = useMutation(
    ["send Notification"],
    (data) => {
      return axios.post(`${nodeSa}/notifications`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          setOpen(false);
        }, 1000);
      },
    }
  );

  const { user } = useUser();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Create Notification
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
              Create Notification
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Cancel
            </Button>
          </Toolbar>
        </AppBar>
        <Grid sx={{ mt: 3 }} container justifyContent="center">
          <Grid item xs={8}>
            <PageHeader
              title="Create Notification"
              subTitle="Create Notification"
              breadcrumbs={[
                { title: "Create Notification", href: "/tasks-manager" },
              ]}
            />
            <Formik
              initialValues={{
                from_user_email: user?.email,
                to_user_email: "",
                variant: "app",
                title: "",
                message: "",
                type: "",
                read: "",
                link: "",
              }}
              validationSchema={Yup.object().shape({
                to_user_email: Yup.string().required("User is required"),
                title: Yup.string().required("Title is required"),
                message: Yup.string().required("Message is required"),
                type: Yup.string().required("Type is required"),
              })}
              onSubmit={(values) => {
                let newValues = {
                  ...values,
                  read: false,
                };

                sendNotification.mutate(newValues);
              }}>
              {({ setFieldValue, values }) => {
                return (
                  <Form>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <SelectUser
                          setSelect={(value) =>
                            setFieldValue("to_user_email", value)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextfieldWrapper name="title" label="Title" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextfieldWrapper name="message" label="Message" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <SelectWrapper
                          name="type"
                          label="Type"
                          options={[
                            { value: "info", label: "Info" },
                            { value: "success", label: "Success" },
                            { value: "warning", label: "Warning" },
                            { value: "error", label: "Error" },
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} sm={12}>
                        <Button
                          type="submit"
                          disabled={sendNotification.isLoading}
                          color="primary"
                          variant="contained">
                          Submit
                        </Button>

                        {sendNotification.error?.response?.data?.err.errors.map(
                          (err, index) => {
                            return (
                              <Alert
                                sx={{ mt: 1 }}
                                severity="error"
                                key={index}>
                                {err}
                              </Alert>
                            );
                          }
                        )}
                      </Grid>
                    </Grid>
                  </Form>
                );
              }}
            </Formik>
          </Grid>
        </Grid>

        <AlertPopup
          open={sendNotification.isSuccess}
          message="Notification Sent"
          severity="success"
        />
        <AlertPopup
          open={sendNotification.isError}
          message={sendNotification.error?.response?.data?.message || "Error"}
          severity="error"
        />

        <></>
      </Dialog>
    </React.Fragment>
  );
}

// from_user_email: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   to_user_email: {
//     type: DataTypes.TEXT,
//   },
//   variant: {
//     type: DataTypes.TEXT,
//     isIn: [["app", "email"]],
//     allowNull: false,
//     defaultValue: "app",
//   },
//   title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   message: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   type: {
//     type: DataTypes.ENUM,
//     values: ["info", "success", "warning", "error"],
//     allowNull: false,
//   },
//   read: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   link: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
