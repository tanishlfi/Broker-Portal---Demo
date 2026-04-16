import {
  Alert,
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
  DialogActions,
  CircularProgress,
  TextField,
  Box,
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
import GetCancelationReasons from "../_components/GetCancelationReasons";
import RejectEdit from "../_components/RejectEdit";
import { Policy } from "@mui/icons-material";
import axios from "axios";
import { rmaAPI } from "src/AxiosParams";
import { useUser } from "@auth0/nextjs-auth0/client";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import * as Yup from "yup";

const updatePolicyStatus = async (policyData) => {
  return axios.post(
    `${rmaAPI}/clc/api/Policy/PolicyIntegration/PolicyStatusAmendment`,
    policyData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

const CancelRequestDialog = ({
  request,
  setRequest,
  UpdateEditRequest,
  accessToken,
  setRefreshTrigger,
}) => {
  // console.log("request", request);

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { cancellationReasons } = GetCancelationReasons();
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const { user } = useUser();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmOpen = () => {
    setOpenConfirm(true);
  };

  const handleConfirmClose = () => {
    setOpenConfirm(false);
  };

  const handleSubmit = async (values) => {
    // get the value of policyCancelReasonId from the form and do a lookup to set policyCancelReasonEnum
    const reason = cancellationReasons.find(
      (reason) => reason.id === values.policyCancelReasonId,
    );

    // console.log("values", values);
    // console.log("reason", reason);

    const data = {
      ...request,
      requestStatus: "Submitted",
      requestStatusNote: "Submitted for approval",
      requestedBy: values.requestedBy,
      requestDescription: values.requestDescription,
      PolicyData: {
        ...request.PolicyData,
        policyCancelReasonId: values.policyCancelReasonId,
        policyCancelReasonEnum: reason.description,
      },
    };

    await UpdateEditRequest.mutate(data);
    handleClose();
  };

  const AcceptCancelFunction = async () => {
    try {
      setLoading(true);

      // get the value of policyCancelReasonId from the form and do a lookup to set policyCancelReasonEnum
      const reason = cancellationReasons.find(
        (reason) => reason.id === request?.PolicyData?.policyCancelReasonId,
      );

      const effectiveDate = request?.PolicyData?.EffectiveFrom;

      // console.log("request", request);

      // Call policy status API
      await updatePolicyStatus({
        PolicyNumber: request?.PolicyData?.PolicyNumber,
        PolicyId: request?.PolicyData?.PolicyId,
        PolicyStatus: "Cancelled",
        EffectiveFrom: effectiveDate,
        policyCancelReasonEnum: reason.description.replace(/\s/g, ""),
      });

      const data = {
        ...request,
        requestStatus: "Complete",
        requestStatusNote: "Cancellation Approved",
      };

      await UpdateEditRequest.mutate(data);
      setRefreshTrigger((prev) => !prev);
      handleClose();
    } catch (error) {
      console.error("Error updating policy:", error);
      // Add error handling UI feedback here
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    AcceptCancelFunction();
    handleConfirmClose();
  };

  const RejectCancelFunction = ({ reason }) => {
    const data = {
      ...request,
      requestDescription:
        typeof request.requestDescription !== "string"
          ? JSON.stringify(request.requestDescription)
          : request.requestDescription,
      requestStatus: "Rejected",
      requestStatusNote: reason,
    };
    UpdateEditRequest.mutate(data);
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
      <React.Fragment>
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <CircularProgress />
          </div>
        )}
        <Card
          sx={{
            mb: 2,
            borderStyle: "solid",
            borderColor:
              request?.requestStatus === "Approved"
                ? "success.main"
                : request?.requestStatus === "Rejected"
                ? "error.main"
                : request?.requestStatus === "Submitted"
                ? "warning.main"
                : "info.main",
            borderWidth: 1,
          }}
          action={<Chip label={request?.requestStatus} />}
        >
          <CardActionArea onClick={handleClickOpen}>
            <CardHeader
              title={
                <Stack>
                  <ChangeCircleIcon />
                  <Typography variant="h5">Cancellation Request</Typography>
                  <Typography variant="body2">
                    Request Type: {request?.requestType}
                  </Typography>
                  <Typography variant="h6">
                    Cancellation Reason:{" "}
                    {request?.PolicyData?.policyCancelReasonEnum}
                  </Typography>
                  <Typography variant="body2">
                    Requested By: {request?.requestedBy}
                  </Typography>
                  <Typography variant="body2">
                    Approver: {request?.approverId}
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
              <Typography variant="h6">Cancel Policy Request</Typography>
            </Stack>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Formik
              initialValues={{
                ...request,
                EffectiveFrom: request?.PolicyData?.EffectiveFrom,
                policyCancelReasonId: request?.PolicyData?.policyCancelReasonId,
                requestType: request.requestType?.split(",") || [],
                requestedBy: request.requestedBy || "",
                requestDescription: (() => {
                  try {
                    return request.requestDescription
                      ? JSON.parse(request.requestDescription)
                      : [{ type: "paragraph", children: [{ text: "" }] }];
                  } catch (e) {
                    return [{ type: "paragraph", children: [{ text: "" }] }];
                  }
                })(),
              }}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
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
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="requestType-label">
                            Request Type
                          </InputLabel>
                          <Select
                            labelId="requestType-label"
                            id="requestType"
                            name="requestType"
                            label="Request Type"
                            multiple
                            value={values.requestType || []}
                            // onChange={(e) => {
                            //   setFieldValue("requestType", e.target.value);
                            // }}
                            renderValue={(selected) =>
                              Array.isArray(selected) ? selected.join(", ") : ""
                            }
                            disabled
                          >
                            <MenuItem value="Cancel Policy">
                              Cancel Policy
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="requestedBy"
                          label="Requested By"
                          fullWidth
                          helperText="Enter the name of the person requesting the cancellation"
                          disabled={["Submitted", "Approved"].includes(
                            request?.requestStatus,
                          )}
                          onChange={(e) => {
                            setFieldValue("requestedBy", e.target.value);
                          }}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <FormControl
                          sx={{
                            width: "350px",
                          }}
                        >
                          <InputLabel id="select_cancellation_reason">
                            Select Cancellation Reason
                          </InputLabel>
                          <Select
                            labelId="select_cancellation_reason"
                            id="selectCancellationReason"
                            name="policyCancelReasonId"
                            value={
                              Number(values.policyCancelReasonId) ||
                              request?.PolicyData?.policyCancelReasonId
                            }
                            label="Select Cancellation Reason"
                            onChange={(e) => {
                              setFieldValue(
                                "policyCancelReasonId",
                                e.target.value,
                              );
                            }}
                            required
                            disabled={["Submitted", "Approved"].includes(
                              request?.requestStatus,
                            )}
                          >
                            {cancellationReasons.map((reason) => {
                              // if ([ ].includes(reason.description)) {
                              return (
                                <MenuItem key={reason.id} value={reason.id}>
                                  {reason.description}
                                </MenuItem>
                              );
                              // }
                            })}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              views={["year", "month"]}
                              openTo="month"
                              label="Cancellation Date"
                              value={values.EffectiveFrom}
                              renderInput={(params) => (
                                <TextField {...params} />
                              )}
                              onChange={(newValue) => {
                                let date = dayjs(newValue);

                                date = date.endOf("month");

                                setFieldValue("EffectiveFrom", date);
                              }}
                              readOnly
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="h6" color="text.secondary">
                          Request Details
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Please provide a detailed description of the changes
                          you would like to make to the policy.
                        </Typography>
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
                              setFieldValue(
                                "requestDescription",
                                JSON.stringify(value),
                              )
                            }
                            readOnly={["Submitted", "Approved"].includes(
                              request?.requestStatus,
                            )}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Card
                          sx={{
                            width: "100%",
                          }}
                          variant="outlined"
                        >
                          <CardContent
                            sx={{
                              width: "100%",
                            }}
                          >
                            <Field name="attachments" component={FileInput} />
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            p: 2,
                          }}
                        >
                          {request?.requestStatus === "Submitted" &&
                            request?.approverId === user.email && (
                              <>
                                <>
                                  <Button
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    onClick={handleConfirmOpen}
                                    color="success"
                                  >
                                    Accept Cancellation
                                  </Button>

                                  <Dialog
                                    open={openConfirm}
                                    onClose={handleConfirmClose}
                                  >
                                    <DialogTitle>
                                      Confirm Cancellation
                                    </DialogTitle>
                                    <DialogContent>
                                      Are you sure you want to accept this
                                      cancellation request?
                                    </DialogContent>
                                    <DialogActions>
                                      <Button
                                        onClick={handleConfirmClose}
                                        color="primary"
                                      >
                                        No
                                      </Button>
                                      <Button
                                        onClick={handleConfirm}
                                        color="primary"
                                        variant="contained"
                                        disabled={loading}
                                        startIcon={
                                          loading ? (
                                            <CircularProgress size={24} />
                                          ) : null
                                        }
                                      >
                                        {loading ? "Processing" : "Yes"}
                                      </Button>
                                    </DialogActions>
                                  </Dialog>

                                  <RejectEdit
                                    RejectEditFunction={RejectCancelFunction}
                                    isCancellation={true}
                                  >
                                    Reject Cancellation
                                  </RejectEdit>
                                </>
                              </>
                            )}

                          {
                            // if request?.requestStatus === "Rejected" add button to resubmit request
                            // save updated values for cancellation reason and request description
                            request?.requestStatus === "Rejected" && (
                              <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                color="warning"
                                type="submit"
                              >
                                Resubmit Request
                              </Button>
                            )
                          }
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

export default CancelRequestDialog;

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
