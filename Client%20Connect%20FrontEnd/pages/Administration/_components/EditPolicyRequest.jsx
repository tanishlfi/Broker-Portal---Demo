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
  Box,
  Stack,
  Divider,
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
import * as Yup from "yup";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EditPolicyRequest({ policyDetails, MainMembers }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const { user } = useUser();

  const accessToken = useToken();

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
        router.push(`/Administration/Policies/${data?.data?.data?.id}`);
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

    formData.append("requestType", values.requestType);
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

    formData.append("coverAmount", MainMembers?.PolicyMember?.benefitAmount);

    formData.append("mainMemberId", MainMembers?.idNumber);

    EditRequest.mutate(formData);
  };

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" onClick={handleClickOpen}>
        Edit Policy
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
              Edit Policy Request
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
                sx={{ mb: 0, pb: 0 }}
                title={<Typography>Policy Details</Typography>}
              />
              <Divider sx={{ my: 1 }} />

              <CardContent sx={{ mt: 0, pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Stack>
                      <Typography variant="caption" color="GrayText">
                        Brokerage
                      </Typography>
                      <Typography variant="caption">
                        {policyDetails.brokerageName}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="caption" color="GrayText">
                        Scheme
                      </Typography>
                      <Typography variant="caption">
                        {policyDetails.providerName}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="caption" color="GrayText">
                        Policy Number
                      </Typography>
                      <Typography variant="caption">
                        {policyDetails.policyNumber}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={6}>
                    <Stack>
                      <Typography variant="caption" color="GrayText">
                        Main Member
                      </Typography>
                      <Typography variant="caption">
                        {`${MainMembers?.firstName} ${MainMembers?.surname}`}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="caption" color="GrayText">
                        ID Number
                      </Typography>
                      <Typography variant="caption">
                        {MainMembers?.idNumber}
                      </Typography>
                    </Stack>
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
                requestType: [],
                requestedBy: "",
              }}
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
                // console.log("errors", errors);
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
                                labelId="requestType-label"
                                error={errors.requestType ? true : false}
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
                              {errors.requestType && (
                                <Typography variant="caption" color="error">
                                  {errors.requestType}
                                </Typography>
                              )}
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
                                title={<Typography>Attachments</Typography>}
                                subheader={
                                  <Typography
                                    variant="caption"
                                    color="GrayText"
                                  >
                                    Please attach any supporting documents
                                  </Typography>
                                }
                              />
                              <Box sx={{ mb: 1 }}></Box>
                              <Field name="attachments" component={FileInput} />
                            </Card>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    <Grid container sx={{ p: 1, mb: 10, mt: 3 }}>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            disabled={EditRequest.isLoading}
                            onClick={handleClose}
                            color="inherit"
                            variant="outlined"
                          >
                            Cancel
                          </Button>
                          {EditRequest.isLoading ? (
                            <>
                              <Button
                                fullWidth
                                disabled
                                type="submit"
                                color="primary"
                                variant="contained"
                              >
                                ...Submitting
                              </Button>
                            </>
                          ) : (
                            <Button
                              fullWidth
                              disabled={EditRequest.isLoading}
                              type="submit"
                              color="primary"
                              variant="contained"
                            >
                              Submit
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Form>
                );
              }}
            </Formik>
          </Grid>
        </Grid>
        <AlertPopup
          open={EditRequest.isError}
          severity="error"
          message={
            EditRequest.error?.response?.data?.message || "An error occured"
          }
        />
      </Dialog>
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
