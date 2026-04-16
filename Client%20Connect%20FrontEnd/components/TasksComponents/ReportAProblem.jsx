import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { Grid, Stack } from "@mui/material";
import { Field, Form, Formik } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import MySlateEditor from "./MySlateEditor";
import PageHeader from "components/Bits/PageHeader";

import useToken from "hooks/useToken";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";
import SelectUser from "./SelectUser";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import { useUser } from "@auth0/nextjs-auth0/client";
import AlertPopup from "components/Bits/AlertPopup";
import { useRouter } from "next/router";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ReportAProblem({ broker, scheme }) {
  const [open, setOpen] = React.useState(false);

  const router = useRouter();

  const { user, isLoading } = useUser();

  const accessToken = useToken();

  const queryClient = useQueryClient();

  const CreateNewTask = useMutation(
    [`CreateTask`],
    (data) => {
      return axios.post(`${nodeSa}/tasks`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          enctype: "multipart/form-data",
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`getAllTasks`],
        });
      },
    }
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (values) => {
    // Process form submission with multiple files

    const newValues = {
      ...values,
      brokerId: values.broker?.id,
      schemeId: values.scheme?.policyId,
      assignee: values.assignee?.email,
    };

    delete newValues.broker;
    delete newValues.scheme;

    const data = new FormData();
    data.append("title", newValues.title);
    data.append("description", newValues.description);
    data.append("body", JSON.stringify(newValues.body));
    data.append("assignee", newValues.assignee);
    data.append("dueDate", newValues.dueDate);
    data.append("status", newValues.status);
    data.append("priority", newValues.priority);
    data.append("createdBy", newValues.createdBy);
    data.append("brokerId", newValues.brokerId);
    data.append("schemeId", newValues.schemeId);

    CreateNewTask.mutate(data, {
      onSuccess: () => {
        setTimeout(() => {
          setOpen(false);
        }, 1000);
      },
    });

    // This will be an array of files
  };

  return (
    <React.Fragment>
      <Button color="warning" onClick={handleClickOpen}>
        Report A Problem
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}>
        <AppBar sx={{ position: "relative" }}>
          <AlertPopup
            open={CreateNewTask.isSuccess}
            severity="success"
            message="Task Created Successfully"
          />
          <AlertPopup
            open={CreateNewTask.isError}
            severity="error"
            message={CreateNewTask?.error?.response?.data?.message}
          />
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Report A Problem
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Cancel
            </Button>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} justifyContent="center">
          <Grid sx={{ mt: 2 }} item xs={8}>
            <PageHeader title="Report A Problem" subTitle="Report A Problem" />
          </Grid>

          <Grid item xs={8}>
            <Formik
              initialValues={{
                title: `User ${user?.email} reported a problem`,
                description: "",
                body: [
                  { type: "paragraph", children: [{ text: router.asPath }] },
                ],
                assignee: "un assigned",
                dueDate: new Date(),
                status: "new",
                priority: "warning",
                createdBy: user?.email,
                assignee: "",
                files: "",
                status: "new",
                broker: "",
                scheme: "",
              }}
              onSubmit={handleSubmit}>
              {({ values, setFieldValue }) => {
                console.log(values);
                return (
                  <Form>
                    <Grid sx={{ mb: 14 }} container spacing={2}>
                      <Grid item xs={12}>
                        <TextfieldWrapper
                          name="description"
                          label="Description"
                          required
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <MySlateEditor
                          value={values.body}
                          onChange={(value) => setFieldValue("body", value)}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          disabled={CreateNewTask.isLoading}
                          type="submit"
                          color="primary"
                          variant="contained">
                          Submit
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
    </React.Fragment>
  );
}
