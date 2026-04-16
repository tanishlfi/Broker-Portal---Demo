import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { Grid } from "@mui/material";
import { Form, Formik } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import MySlateEditor from "./MySlateEditor";
import PageHeader from "components/Bits/PageHeader";
import DateFieldWrapper from "components/FormComponents.jsx/DateFieldWrapper";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import useToken from "hooks/useToken";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";
import SelectUser from "./SelectUser";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import { useUser } from "@auth0/nextjs-auth0/client";
import AlertPopup from "components/Bits/AlertPopup";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EditTask({ data }) {
  const [open, setOpen] = React.useState(false);

  const { user, isLoading } = useUser();

  const accessToken = useToken();

  const queryClient = useQueryClient();

  const getUsersByRole = useQuery(
    [`userByRole`],
    () => {
      return axios.get(`${nodeSa}/auth0/getUsersByRole/rol_a8MRb4O1C1urJxGV`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  const EditTask = useMutation(
    [`editTask`, data?.id],
    (sub) => {
      return axios.patch(`${nodeSa}/tasks/${data?.id}`, sub, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`getTask `, data?.id],
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
    };

    delete newValues.broker;
    delete newValues.scheme;

    EditTask.mutate(newValues, {
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
      <AlertPopup
        open={EditTask.isSuccess}
        severity="success"
        message="Task Edited Successfully"
      />
      <AlertPopup
        open={EditTask.isError}
        severity="error"
        message={EditTask?.error?.response?.data?.message}
      />

      <Button variant="outlined" onClick={handleClickOpen}>
        Edit Task
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
              Edit Task
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Cancel
            </Button>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} justifyContent="center">
          <Grid sx={{ mt: 2 }} item xs={8}>
            <PageHeader title="Edit Task" />
          </Grid>

          <Grid item xs={8}>
            <Formik
              initialValues={{
                title: data?.title || "",
                description: data?.description || "",
                body: data?.body || [
                  { type: "paragraph", children: [{ text: "" }] },
                ],
                assignee: data?.assignee || "",
                dueDate: data?.dueDate || "",
                status: data?.status || "",
                priority: data?.priority || "",
                createdBy: user?.email,
                assignee: data?.assignee || "",
                status: data?.status || "",
                broker: data?.broker || "",
                scheme: data?.scheme || "",
              }}
              onSubmit={handleSubmit}>
              {({ values, setFieldValue }) => {
                return (
                  <Form>
                    <Grid sx={{ mb: 14 }} container spacing={2}>
                      <Grid item xs={12}>
                        <SelectUser
                          getUsersByRole={getUsersByRole}
                          select={values.assignee}
                          setSelect={(value) =>
                            setFieldValue("assignee", value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldWrapper name="title" label="Title" required />
                      </Grid>

                      <Grid item xs={12}>
                        <TextfieldWrapper
                          name="description"
                          label="Description"
                          required
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <SelectWrapper
                          name="priority"
                          label="Priority"
                          required
                          options={[
                            { label: "Low", value: "info" },
                            { label: "Medium", value: "warning" },
                            { label: "High", value: "error" },
                          ]}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <DateFieldWrapper
                          minDate={new Date()}
                          views={["month", "day"]}
                          name="dueDate"
                          label="Due Date"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <MySlateEditor
                          value={values.body}
                          onChange={(value) => setFieldValue("body", value)}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <SelectBroker
                          select={values.broker}
                          setSelect={(value) => setFieldValue("broker", value)}
                        />
                      </Grid>
                      {values.broker?.id && (
                        <Grid item xs={12}>
                          <SelectScheme
                            id={values.broker?.id}
                            select={values.scheme}
                            setSelect={(value) =>
                              setFieldValue("scheme", value)
                            }
                          />
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Button
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
