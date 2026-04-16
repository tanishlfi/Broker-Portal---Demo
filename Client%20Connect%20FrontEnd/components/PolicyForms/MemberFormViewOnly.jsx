import React from "react";
import { Formik, Form, Field } from "formik";
import {
  Alert,
  Grid,
  Stack,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadFileButton from "components/Bits/DownloadFileButton";
import customGridSeperator from "components/customStyles/gridSeperator";
import SwitchWrapper from "components/FormComponents.jsx/SwitchWrapper";

const MemberFormViewOnly = ({ data, isEdit, preferredCommunicationMethod }) => {
  console.log("data", data);
  return (
    <>
      <Formik
        initialValues={{
          id: data ? data?.id : uuidv4(),
          client_type: "main_member",
          confirmed: data?.confirmed || false,
          title: data?.title || "",
          firstName: data?.firstName || "",
          surname: data?.surname || "",
          idNumber: data?.idNumber || "",
          vopdResponse: data?.vopdResponse || "",
          dateOfBirth: data?.dateOfBirth
            ? dayjs(data.dateOfBirth).format("DD-MM-YYYY")
            : "",
          idTypeId: data?.idTypeId || 1,
          isVopdVerified: data?.isVopdVerified || false,
          dateVopdVerified: data?.dateVopdVerified || "",
          cellNumber: data?.cellNumber || "",
          emailAddress: data?.emailAddress || "",
          preferredCommunicationTypeId:
            data?.preferredCommunicationTypeId || "",
          tellNumber: data?.tellNumber || "",
          gender: data?.gender || "",
          addressTypeId: 1,
          addressLine1: data?.address_line_1 || "",
          addressLine2: data?.address_line_2 || "",
          city: data?.city || "",
          province: data?.province || "",
          postalCode: data?.postal_code || "",
          countryId: data?.country || "",
          rolePlayerId: data?.rolePlayerId || "",
          notes: data?.notes || [],
          AstuteResponse: data?.AstuteResponse || "",

          PolicyMember: {
            startDate: data?.PolicyMember.startDate
              ? dayjs(data?.PolicyMember.startDate).format("DD-MM-YYYY")
              : "",
            endDate: data?.PolicyMember.endDate
              ? dayjs(data?.PolicyMember.endDate).format("DD-MM-YYYY")
              : "",
            memberTypeId: 1,
            isBeneficiary: true,
            isStudying: data?.PolicyMember.isStudying || false,
            isDisabled: data?.PolicyMember.isDisabled || false,
            status: isEdit ? "isEdited" : "New",
            statedBenefitId: data?.PolicyMember.statedBenefitId || "",
            statedBenefit: data?.PolicyMember.statedBenefit || "",
          },
          ...data,
          // rolePlayerAddresses: [],
        }}
        enableReinitialize={true}
      >
        {({ values, dirty, setFieldValue, errors }) => {
          return (
            <Form>
              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left">
                  Personal Details
                </Typography>
              </Grid>

              <Grid sx={{ my: 2 }} container>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="idTypeId"
                      label="User ID Type"
                      value={
                        values.idTypeId === 1
                          ? "SA ID"
                          : values.idTypeId === 2
                          ? "Passport"
                          : ""
                      }
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>

                  <>
                    {values.idTypeId === 1 && (
                      <>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            type="number"
                            name="idNumber"
                            label="ID Number"
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </Grid>
                        {
                          // hidden field for vopd response
                        }
                        <Field type="hidden" name="vopdResponse" />
                        <Grid item xs={2}>
                          {values.isVopdVerified && (
                            <Alert severity="info">VOPD Complete</Alert>
                          )}
                        </Grid>
                      </>
                    )}

                    {values.idTypeId === 2 && (
                      <>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            name="idNumber"
                            label="Passport Number"
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </>

                  <Grid item xs={12}>
                    <DownloadFileButton documents={values?.supportDocument} />
                  </Grid>

                  {values.idTypeId !== 1 && (
                    <>
                      <Grid item xs={4}>
                        <DOBPicker
                          name="dateOfBirth"
                          label="Date of Birth"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextfieldWrapper
                          name="gender"
                          label="Gender"
                          values={
                            values.gender === 1
                              ? "Male"
                              : values.gender === 2
                              ? "Female"
                              : ""
                          }
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    </>
                  )}
                  {data?.AstuteResponse && (
                    <>
                      <Grid item xs={6}>
                        <Accordion
                          sx={{
                            borderColor: "primary.main",
                            borderStyle: "solid",
                            borderWidth: 1,
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                          >
                            <Typography>
                              {" "}
                              VOPD Response: {data?.AstuteResponse?.status}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Card>
                              <Stack>
                                <>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    idNumber : {data?.AstuteResponse?.idNumber}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    dateOfBirth:{" "}
                                    {data?.AstuteResponse?.dateOfBirth}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    dateOfDeath:{" "}
                                    {data?.AstuteResponse?.dateOfDeath}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    firstName: {data?.AstuteResponse?.firstName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    surname: {data?.AstuteResponse?.surname}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    maritalStatus:{" "}
                                    {data?.AstuteResponse?.maritalStatus}
                                  </Typography>
                                </>
                              </Stack>
                            </Card>
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="firstName"
                    label="First Name"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="surname"
                    label="Surname"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                  Benefit Details
                </Typography>
              </Grid>

              <Grid sx={{ pt: 2 }} container spacing={2}>
                <Grid sx={{ pt: 2 }} item xs={6}>
                  <TextfieldWrapper
                    InputProps={{
                      readOnly: true,
                    }}
                    name="PolicyMember.statedBenefit"
                    label="Benefit"
                  />
                </Grid>
              </Grid>

              <Grid sx={{ pt: 2 }} container spacing={2}>
                <Grid sx={{ pt: 2 }} item xs={6}>
                  <TextfieldWrapper
                    InputProps={{
                      readOnly: true,
                    }}
                    name="PolicyMember.startDate"
                    label="Start Date"
                  />
                </Grid>
                {data.PolicyMember.endDate && (
                  <Grid sx={{ pt: 2 }} item xs={6}>
                    <TextfieldWrapper
                      InputProps={{
                        readOnly: true,
                      }}
                      name="PolicyMember.endDate"
                      label="End Date"
                    />
                  </Grid>
                )}
              </Grid>
              <Grid sx={{ pt: 2 }} container spacing={2}>
                <Grid sx={{ pt: 2 }} item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.PolicyMember.isStudying}
                        disabled={true}
                      />
                    }
                    label="Is Student"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.PolicyMember.isDisabled}
                        disabled={true}
                      />
                    }
                    label="Is Disabled"
                  />
                </Grid>
              </Grid>

              <Stack sx={{ mt: 2 }} direction="row" justifyContent="flex-end">
                <SwitchWrapper
                  value={values.PolicyMember.isBeneficiary ? true : false}
                  name="PolicyMember.isBeneficiary"
                  label="Beneficiary"
                />
              </Stack>
              {
                // if the member is a main member or beneficiary, show the contact details
                (values.client_type === "Main Member" ||
                  values.PolicyMember.isBeneficiary) && (
                  <>
                    <Grid sx={customGridSeperator}>
                      <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                        Contact Details
                      </Typography>
                    </Grid>
                    {console.log(
                      "preferredCommunicationMethod",
                      preferredCommunicationMethod,
                    )}
                    <Grid container sx={{ pt: 2 }} spacing={2}>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="preferredCommunicationTypeId"
                          label="Preferred Communication"
                          InputProps={{
                            readOnly: true,
                          }}
                          // set value to the description of the preferred communication type
                          value={
                            preferredCommunicationMethod.filter(
                              (item) =>
                                item.id === values.preferredCommunicationTypeId,
                            )[0]?.description
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          type="number"
                          name="cellNumber"
                          label="Mobile Phone Number"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          type="number"
                          name="tellNumber"
                          label="Telephone Number"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="emailAddress"
                          label="Email Address"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid sx={{ pt: 2 }} container spacing={2}>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="addressLine1"
                          label="Address Line 1"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="addressLine2"
                          label="Address Line 2"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="city"
                          label="City"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="province"
                          label="Province"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="postalCode"
                          label="Postal Code"
                          type="number"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </>
                )
              }
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default MemberFormViewOnly;
