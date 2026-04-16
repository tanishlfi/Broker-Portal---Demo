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
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Box,
} from "@mui/material";

import { Field, Form, Formik } from "formik";

import FolderIcon from "@mui/icons-material/Folder";

import useToken from "hooks/useToken";
import { useMutation } from "react-query";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";

import { useUser } from "@auth0/nextjs-auth0/client";
import AlertPopup from "components/Bits/AlertPopup";
import MySlateEditor from "../../../components/TasksComponents/MySlateEditor";
import { styled } from "@mui/material/styles";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ContentItem from "../../../components/Containers/ContentItem";
import { useRouter } from "next/navigation";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import GetCancelationReasons from "../_components/GetCancelationReasons";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import * as Yup from "yup";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CancelPolicyRequest({ policyDetails, MainMembers }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState(null);

  const { user } = useUser();

  const accessToken = useToken();

  const { cancellationReasons } = GetCancelationReasons();

  // First determine minimum date
  const today = dayjs();
  const isBeforeCutoff = today.date() < 16;
  const minDate = isBeforeCutoff
    ? today.endOf("month")
    : today.add(1, "month").endOf("month");
  const minMinDate = minDate.add(-1, "year").endOf("month");

  // Maximum date is 3 months from minimum date
  const maxDate = minDate.add(6, "month").endOf("month");

  const EditRequest = useMutation(
    [`EditRequest`],
    (data) => {
      return axios.post(`${nodeSa}/edit/requests`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          enctype: "multipart/form-data",
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        // console.log(data?.data?.data?.id);
        router.push(`/Administration/Cancel/${data?.data?.data?.id}`);
      },
      onError: (error) => {
        setSubmitError(error.response.data.message);
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
    //   {
    //     "PolicyMembers": null,
    //     "PolicyMembersOrg": null,
    //     "PolicyId": 292771,

    //     "EffectiveFrom": null,
    //     "policyCancelReasonEnum": null,
    //     "ProductOptionId": null,
    //     "ProductOptionCode": null,
    //     "InstallmentPremium": null,
    //     "coverAmount": null,
    //     "AdminPercentage": null,
    //     "CommissionPercentage": null,
    //     "BinderFeePercentage": null,
    //     "updatedAt": "2024-09-09T13:38:51.922Z",
    //     "updatedBy": "wayne+usermanager@cdasolutions.co.za"
    // }

    let formData = new FormData();

    values.attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    formData.append(
      "requestDescription",
      JSON.stringify(values.requestDescription),
    );

    formData.append("requestedDate", new Date().toISOString());

    formData.append("requestType", "Cancel policy");

    formData.append("requestedBy", values?.requestedBy || "Not Specified");

    formData.append("BrokerageId", policyDetails.brokerageId);

    formData.append("ParentPolicyNumber", policyDetails.providerId);

    formData.append("PolicyId", policyDetails.policyId);

    formData.append("PolicyNumber", policyDetails.policyNumber);

    formData.append("brokerage", policyDetails.brokerageName);

    formData.append("scheme", policyDetails.providerName);
    formData.append("policyStatus", policyDetails.policyStatusId);

    formData.append(
      "mainMember",
      MainMembers?.firstName + " " + MainMembers?.surname,
    );

    formData.append("mainMemberId", MainMembers?.idNumber);

    // check if policyCancelReasonId has been set

    formData.append("policyCancelReasonId", values?.policyCancelReasonId);

    formData.append("EffectiveFrom", values?.EffectiveFrom || minDate);

    // get the value of policyCancelReasonId from the form and do a lookup to set policyCancelReasonEnum
    const reason = cancellationReasons.find(
      (reason) => reason.id === values.policyCancelReasonId,
    );
    // set policyCancelReasonEnum to reason.description removing spaces
    formData.append(
      "policyCancelReasonEnum",
      reason.description,
      // reason.description.replace(/\s/g, ""),
    );
    EditRequest.mutate(formData);
  };

  return (
    <React.Fragment>
      <Button color="warning" variant="contained" onClick={handleClickOpen}>
        Cancel Policy
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
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
              Cancel Policy Request
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Cancel
            </Button>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} justifyContent="center">
          <Grid sx={{ mt: 2 }} item xs={8}>
            <Card>
              <CardHeader
                title="Policy Details"
                subheader="Please review the policy details to ensure you are cancelling the correct policy"
              />

              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {" "}
                    <ContentItem
                      title="Brokerage"
                      value={policyDetails.brokerageName}
                    />
                    <ContentItem
                      title="Scheme"
                      value={policyDetails.providerName}
                    />
                    <ContentItem
                      title="Policy Number"
                      value={policyDetails.policyNumber}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <ContentItem
                      title="Main Member"
                      value={`${MainMembers?.firstName} ${MainMembers?.surname}`}
                    />
                    <ContentItem
                      title="ID Number"
                      value={MainMembers?.idNumber}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={8}>
            <Formik
              initialValues={{
                requestDescription: [
                  { type: "paragraph", children: [{ text: "" }] },
                ],
                attachments: [],
                requestedBy: "",
              }}
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
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors }) => {
                // let totalSize = values.attachments.reduce(
                //   (acc, curr) => acc + curr.size / 1024 / 1024,
                //   0
                // );

                return (
                  <Form>
                    <Grid sx={{ mb: 14 }} container spacing={2}>
                      {
                        // add grid xs={6}
                        // add form control select for requestType to capture the type of request in a multiselect
                        // input name is requestType, type is array
                        // options are
                        // 1. Cancel Policy
                        // input defaults to Cancel Policy and is disabled
                      }
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="requestType-label">
                            Request Type
                          </InputLabel>
                          <Select
                            labelId="requestType-label"
                            id="requestType"
                            name="requestType"
                            multiple
                            value={values.requestType || ["Cancel Policy"]}
                            onChange={(e) => {
                              setFieldValue("requestType", e.target.value);
                            }}
                            renderValue={(selected) => selected.join(", ")}
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
                            value={Number(values.policyCancelReasonId) || ""}
                            label="Select Cancellation Reason"
                            onChange={(e) => {
                              setFieldValue(
                                "policyCancelReasonId",
                                e.target.value,
                              );
                            }}
                            required
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
                      {
                        // add date picker for cancellation date
                        // input name is cancellation date
                        // needs to be last day of the month and date
                      }
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              views={["year", "month"]}
                              openTo="month"
                              maxDate={maxDate}
                              minDate={minMinDate}
                              label="Cancellation Date"
                              value={values.EffectiveFrom || minDate}
                              onChange={(newValue) => {
                                let date = dayjs(newValue);

                                date = date.endOf("month");

                                setFieldValue("EffectiveFrom", date);
                              }}
                              renderInput={(params) => (
                                <TextField {...params} />
                              )}
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
                              setFieldValue("requestDescription", value)
                            }
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

                            {/* {values.attachments.length > 0 && (
                              <>
                                <Typography
                                  sx={{ mt: 2 }}
                                  variant="body2"
                                  color="text.secondary">
                                  Total Size: {totalSize.toFixed(2)}
                                  MB (Max 10MB)
                                </Typography>

                                {Number(totalSize) > 10 ? (
                                  <Alert severity="error">
                                    Total Size of attachments exceeds 10MB
                                  </Alert>
                                ) : (
                                  <> </>
                                )}
                              </>
                            )} */}
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          disabled={EditRequest.isLoading}
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
      <AlertPopup
        open={EditRequest.isError}
        severity="error"
        message={EditRequest.error?.response?.data.message}
        handleClose={() => EditRequest.reset()}
      />
    </React.Fragment>
  );
}

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

// POST /apirma/test/edit/requests HTTP/1.1
// Accept: */*
// User-Agent: Thunder Client (https://www.thunderclient.com)
// Authorization: Bearer ******
// Content-Type: application/json
// Host: localhost:8000
// Content-Length: 1214

// {
//   "requestDescription": "Requested to edit policy",
//   "requestedBy": "John Doe",
//   "requestedDate": "2024-09-01",
//   "requestType": "Edit",
//   "attachments": [
//     {
//       "id": "76b9ee5d-291a-473a-9530-9eb53c1e7b0f",
//       "fileName": "b2b0f1de-03be-4cb3-9e7b-220ca03ec892.xlsx",
//       "documentType": "supporting documents",
//       "orgFileName": "helpdesk.ticket.subtype.xlsx",
//       "createdBy": "lourens+rmaadmin@cdasolutions.co.za",
//       "updatedAt": "2024-09-05T19:37:16.207Z",
//       "createdAt": "2024-09-05T19:37:16.207Z"
//     },
//     {
//       "id": "76b9ee5d-291a-473a-9530-9eb53c1e7b0f",
//       "fileName": "b2b0f1de-03be-4cb3-9e7b-220ca03ec892.xlsx",
//       "documentType": "supporting documents",
//       "orgFileName": "helpdesk.ticket.subtype.xlsx",
//       "createdBy": "lourens+rmaadmin@cdasolutions.co.za",
//       "updatedAt": "2024-09-05T19:37:16.207Z",
//       "createdAt": "2024-09-05T19:37:16.207Z"
//     }
//   ],
//   "PolicyData": {
//     "BrokerageId": 1,
//     "ParentPolicyNumber": 1,
//     "PolicyId": 22344,
//     "PolicyNumber": "01-202008-22344",
//     "brokerage": "some brokerage name",
//     "scheme": "some scheme name",
//     "mainMember": "main member name + surname",
//     "mainMemberId": "8605215005081"
//   }
// }
