import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

import { Field, Form, Formik } from "formik";
import TextfieldWrapper from "../../../components/FormComponents.jsx/TextFieldWrapper";
import MySlateEditor from "../../../components/TasksComponents/MySlateEditor";
import { styled } from "@mui/material/styles";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import FolderIcon from "@mui/icons-material/Folder";
import AlertPopup from "../../../components/Bits/AlertPopup";
import DownloadFileButton from "../../../components/Bits/DownloadFileButton";
import { useTheme } from "@emotion/react";
import * as Yup from "yup";

const EditRequestDialog = ({ request, setRequest, noEdit = false }) => {
  const [open, setOpen] = React.useState(false);

  const [saved, setSaved] = React.useState(false);

  let theme = useTheme();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setSaved(false);
    setOpen(false);
  };

  const handleSubmit = (values) => {
    setSaved(false);

    setRequest((prev) => {
      return {
        ...prev,
        requestDescription: JSON.stringify(values.requestDescription),
        requestType: values.requestType.join(","),
        attachments: values.attachments,
      };
    });
    setSaved(true);
    handleClose();
  };

  const statusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "warning";
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <AlertPopup
        open={saved}
        severity="warning"
        message="Updated - Remember to Save Policy"
      />
      <React.Fragment>
        <Card
          sx={{
            mb: 2,
            borderStyle: "solid",
            borderColor:
              request?.requestStatus === "Approved"
                ? "success.main"
                : request?.requestStatus === "Rejected"
                ? "error.main"
                : request?.requestStatus === "Edit"
                ? "info.main"
                : "warning.main",
            borderWidth: 1,
          }}
          action={<Chip label={request?.requestStatus} />}
        >
          <CardActionArea onClick={handleClickOpen}>
            <CardHeader
              title={
                <Stack>
                  <ChangeCircleIcon />
                  <Typography variant="h6">Change Request</Typography>
                  <Typography variant="body2">
                    Request Type: {request?.requestType}
                  </Typography>
                  <Typography variant="body2">
                    Requested By: {request?.requestedBy}
                  </Typography>
                  <Typography variant="body2">
                    Request Created By: {request?.createdBy}
                  </Typography>
                </Stack>
              }
              action={
                <Stack spacing={1}>
                  <Chip
                    label={request?.requestStatus}
                    color={statusColor(request?.requestStatus)}
                  />

                  {request?.requestStatus === "Rejected" && (
                    <Alert severity="error">{request?.requestStatusNote}</Alert>
                  )}
                </Stack>
              }
            />
          </CardActionArea>
        </Card>
        <Dialog
          maxWidth="xl"
          fullWidth
          open={open}
          onClose={handleClose}
          aria-labelledby="Edit Req dialog"
          aria-describedby="Edit Req dialog"
        >
          <DialogTitle>
            <Stack spacing={2} direction="row" alignItems="center">
              <ChangeCircleIcon />
              <Typography variant="h6">Edit Request 1</Typography>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Formik
              initialValues={{
                ...request,
                requestType: request.requestType?.split(",") || [],
                requestDescription: request.requestDescription
                  ? JSON.parse(request.requestDescription)
                  : [{ type: "paragraph", children: [{ text: "" }] }],
              }}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
                // requires at least one request type
                requestType: Yup.array().min(1, "Required"),
                // requestedBy: Yup.string().required("Required"),
                requestDescription: Yup.array().test(
                  "not-empty",
                  "Request description is required",
                  (value) => {
                    if (!value || !Array.isArray(value)) return false;
                    return value.some((block) => {
                      if (!block?.children || !Array.isArray(block.children))
                        return false;
                      return block.children.some(
                        (child) => child?.text?.trim().length > 0,
                      );
                    });
                  },
                ),
                requestedBy: Yup.string().required("Required"),
              })}
              onSubmit={(values) => {
                handleSubmit(values);
              }}
            >
              {({ values, setFieldValue, errors }) => {
                // let totalSize = values.attachments.reduce(
                //   (acc, curr) => acc + curr.size / 1024 / 1024,
                //   0
                // );

                return (
                  <Form>
                    <Card>
                      <CardHeader
                        sx={{ pb: 0, mb: 0 }}
                        title={<Typography>Action Request</Typography>}
                        subheader={
                          <Typography variant="caption" color="GrayText">
                            Please provide the details of the request you would
                            like to make to the policy
                          </Typography>
                        }
                      />
                      <Divider sx={{ my: 1 }} />
                      <CardContent>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <FormControl fullWidth>
                              <InputLabel id="requestType-label">
                                Request Type
                              </InputLabel>
                              <Select
                                disabled={noEdit}
                                labelId="requestType-label"
                                id="requestType"
                                name="requestType"
                                multiple
                                label="Request Type"
                                value={values.requestType || []}
                                onChange={(e) => {
                                  setFieldValue("requestType", e.target.value);
                                }}
                                renderValue={(selected) => selected.join(", ")}
                              >
                                <MenuItem value="Add member">
                                  Add member
                                </MenuItem>
                                <MenuItem value="Update member">
                                  Update member
                                </MenuItem>
                                <MenuItem value="Update cover level">
                                  Update cover level
                                </MenuItem>
                                <MenuItem value="Update address details">
                                  Update address details
                                </MenuItem>
                                <MenuItem value="Remove member">
                                  Remove member
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              disabled={noEdit}
                              name="requestedBy"
                              label="Requested By"
                              fullWidth
                              helperText="Enter the name of the person requesting the cancellation"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Stack>
                              <Typography sx={{ mb: 0 }}>
                                Request Details
                              </Typography>

                              <Typography
                                sx={{ mb: 1 }}
                                variant="caption"
                                color="GrayText"
                              >
                                Please provide a detailed description of the
                                changes you would like to make to the policy.
                              </Typography>
                              {errors.requestDescription && (
                                <Typography variant="caption" color="error">
                                  {errors.requestDescription}
                                </Typography>
                              )}
                            </Stack>
                            <Box
                              sx={{
                                my: 1,
                                // add red border if there is an error
                                border: errors.requestDescription
                                  ? "1px solid red"
                                  : "none",
                              }}
                            >
                              <MySlateEditor
                                value={values.requestDescription}
                                onChange={(value) =>
                                  setFieldValue("requestDescription", value)
                                }
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Card sx={{ p: 1 }} variant="outlined">
                              <CardHeader
                                sx={{ mb: 0, pb: 0.5 }}
                                title={
                                  <Typography>Supporting documents</Typography>
                                }
                                subheader={
                                  <Typography
                                    variant="caption"
                                    color="GrayText"
                                  >
                                    See attached supporting documents
                                  </Typography>
                                }
                              />
                              <Box sx={{ mb: 1 }}></Box>
                              <Stack
                                sx={{
                                  border: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                {request?.attachments &&
                                  request?.attachments?.length > 0 && (
                                    <DownloadFileButton
                                      documents={request?.attachments}
                                    />
                                  )}
                              </Stack>
                            </Card>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    <Grid container sx={{ p: 1, mt: 3 }}>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            onClick={handleClose}
                            color="inherit"
                            variant="outlined"
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={
                              noEdit || request.requestStatus === "Complete"
                            }
                            fullWidth
                            type="submit"
                            color="primary"
                            variant="contained"
                          >
                            Save
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Form>
                );
              }}
            </Formik>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    </>
  );
};

export default EditRequestDialog;

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FileInput = ({ field, form }) => {
  const handleChange = (event) => {
    // set all the files

    const files = event.target.files[0];

    let Afiles = [...field.value, files];

    // setFile(files);
    form.setFieldValue("attachments", Afiles);
  };

  const removeFile = (index) => {
    let Afiles = field.value.filter((file, i) => i !== index);

    form.setFieldValue("attachments", Afiles);
  };

  return (
    <>
      {field.value &&
        field.value.length > 0 &&
        field.value.map((file, index) => {
          return (
            <ListItem
              key={index}
              sx={{ m: 0, pt: 1 }}
              alignItems="flex-start"
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => {
                    removeFile(index);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <FolderIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      Document Name
                    </Typography>
                  </>
                }
                secondary={
                  <>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body1"
                      color="text.primary"
                    >
                      {file.name}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          );
        })}

      <Button
        fullWidth
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
      >
        Upload file
        <VisuallyHiddenInput type="file" onChange={handleChange} />
      </Button>
    </>
  );
};
