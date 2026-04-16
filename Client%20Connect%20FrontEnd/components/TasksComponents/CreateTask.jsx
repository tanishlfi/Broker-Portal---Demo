import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import {
  Grid,
  Stack,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import MySlateEditor from "./MySlateEditor";
import PageHeader from "components/Bits/PageHeader";
import FileInput from "./FileInput";
import FolderIcon from "@mui/icons-material/Folder";
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

export default function CreateTasks() {
  const [open, setOpen] = React.useState(false);

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
    },
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
    // Assuming newValues.files is an array of file objects
    data.append("file", newValues.files);

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
      <Button color="secondary" variant="contained" onClick={handleClickOpen}>
        Create A new Task
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
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
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Create A new Task
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Cancel
            </Button>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} justifyContent="center">
          <Grid sx={{ mt: 2 }} item xs={8}>
            <PageHeader
              title="Create A new Task"
              subTitle="Create A new Task"
              breadcrumbs={[
                { title: "Create A new Task", href: "/tasks-manager" },
              ]}
            />
          </Grid>

          <Grid item xs={8}>
            <Formik
              initialValues={{
                title: "",
                description: "",
                body: [{ type: "paragraph", children: [{ text: "" }] }],
                assignee: "",
                dueDate: new Date(),
                status: "new",
                priority: "",
                createdBy: user?.email,
                assignee: "",
                files: "",
                status: "new",
                broker: "",
                scheme: "",
                approverId: "",
              }}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => {
                console.log(values);
                return (
                  <Form>
                    <Grid sx={{ mb: 14 }} container spacing={2}>
                      <Grid item xs={12}>
                        <SelectUser
                          select={values.assignee}
                          setSelect={(value) =>
                            setFieldValue("assignee", value)
                          }
                          selectTitle="Assignee"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextfieldWrapper name="title" label="Title" required />
                      </Grid>

                      <Grid item xs={12}>
                        {/* <TextfieldWrapper
                          name="description"
                          label="Description"
                          required
                        /> */}
                        {
                          // selector that allows you to select the type of task
                          // task are Onboarding of Scheme Members, Onboarding of individual life, Amendment of cover, Amendment of lifes, Cancellation, Amendment of contact details, Amentment of bank details, Amendment of beneficiaries
                        }
                        <SelectWrapper
                          name="description"
                          label="Description"
                          required
                          options={[
                            {
                              label: "Onboarding of Scheme Members",
                              value: "Onboarding of Scheme Members",
                            },
                            {
                              label: "Onboarding of individual life",
                              value: "Onboarding of individual life",
                            },
                            {
                              label: "Amendment of cover",
                              value: "Amendment of cover",
                            },
                            {
                              label: "Amendment of lifes",
                              value: "Amendment of lifes",
                            },
                            { label: "Cancellation", value: "Cancellation" },
                            {
                              label: "Amendment of contact details",
                              value: "Amendment of contact details",
                            },
                            {
                              label: "Amendment of bank details",
                              value: "Amendment of bank details",
                            },
                            {
                              label: "Amendment of beneficiaries",
                              value: "Amendment of beneficiaries",
                            },
                            {
                              label: "Other",
                              value: "Other",
                            },
                          ]}
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
                        <SelectUser
                          select={values.approverId}
                          setSelect={(value) =>
                            setFieldValue("approverId", value)
                          }
                          selectTitle="Approver"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MySlateEditor
                          value={values.body}
                          onChange={(value) => setFieldValue("body", value)}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Stack>
                          <Field name="files" component={FileInput} />
                        </Stack>
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
                          disabled={CreateNewTask.isLoading}
                          type="submit"
                          color="primary"
                          variant="contained"
                        >
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
