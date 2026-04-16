import {
  Button,
  Grid,
  Stack,
  Alert,
  Typography,
  Card,
  CardContent,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import dayjs from "dayjs";
import { Form, Formik, Field } from "formik";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import ExceptionsHandler from "./ExceptionsHandler";
import DiffAlert from "components/FormComponents.jsx/DiffAlert";
import SupportDocuments from "./SupportDocuments";
import DownloadFileButton from "components/Bits/DownloadFileButton";
import AlertPopup from "components/Bits/AlertPopup";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const BeneficiaryForm = ({ data, edit, setMembers, diff, handleClose }) => {
  const [newDocument, setNewDocument] = React.useState({});

  return (
    <>
      <Formik
        initialValues={{
          ...data,
          id: data ? data?.id : uuidv4(),
          client_type: "Beneficiary",
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
          notes: data?.notes || [],
          supportDocument: data?.supportDocument || [],
          memberTypeId: 6,
          isBeneficiary: true,
          status: "New",

          ...data,

          // rolePlayerAddresses: [],
        }}
        enableReinitialize={true}
        validationSchema={Yup.object({
          idTypeId: Yup.string().required("Required"),
          firstName: Yup.string().required("Required"),
          surname: Yup.string().required("Required"),
          idNumber: Yup.string().when("idTypeId", {
            is: "1",
            then: Yup.string()
              .required("Id Number is required")
              .matches(
                /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
                "SA Id Number seems to be invalid"
              ),
            otherwise: Yup.string().required("Required"),
          }),

          preferredCommunicationTypeId: Yup.string().nullable(),

          cellNumber: Yup.string()
            .nullable()
            .matches(
              /^0[6-8][0-9]{8}$/,
              "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
            )
            .when("preferredCommunicationTypeId", {
              is: (val) => String(val) === "2" || String(val) === "3",
              then: (schema) => schema.required("Phone number is required"),
            }),

          emailAddress: Yup.string()
            .nullable()
            .email("Invalid email format")
            .when("preferredCommunicationTypeId", {
              is: (val) => String(val) === "1",
              then: (schema) => schema.required("Email address is required"),
            }),

          // age cannot be more than 65 Or less than 18
          // dateOfBirth validation only for non SA ID, where idTypeId is not 1
          dateOfBirth: Yup.date().when("idTypeId", {
            is: (idTypeId) => idTypeId !== "1",
            then: Yup.date().required("Required"),
          }),
        })}
        onSubmit={(values) => {
          let newValues = {
            ...values,
          };

          // if idTypeId is 1 calculate dob and gender from idNumber
          if (values.idTypeId === 1 && !values.dateOfBirth) {
            const dob = values.idNumber.toString().substring(0, 6);

            // get 4 numbers after first 6 digits
            const genderVal = parseInt(values.idNumber.toString().substr(5, 4));

            newValues = {
              ...newValues,
              dateOfBirth: dayjs(dob, "YYMMDD").toDate(),
              gender: genderVal >= 5000 ? 1 : 2,
            };
          }

          edit
            ? setMembers((members) => {
              const index = members.findIndex(
                (item) => item.id === newValues.id
              );
              members[index] = newValues;

              return [...members];
            })
            : setMembers((members) => {
              // this works
              // console.log("members2", [...members, newValues]);
              // remove id from newValues
              return [...members, newValues];
            });

          handleClose();
        }}
      >
        {({ values, dirty, setFieldValue, isSubmitted }) => {
          // console.log(errors);
          return (
            <Form>
              <ExceptionsHandler data={values} setFieldValue={setFieldValue} />
              <AlertPopup
                open={isSubmitted}
                message={
                  edit
                    ? "Beneficiary details have been updated successfully."
                    : "Beneficiary has been added successfully."
                }
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Button
                  disabled={dirty ? false : true}
                  type="submit"
                  size="large"
                  variant="contained"
                >
                  Save
                </Button>
                <Typography
                  variant="body1"
                  sx={{ height: "100%", ml: 2 }}
                  textAlign={"center"}
                  color="text.secondary"
                >
                  Beneficiary
                </Typography>
                <Box></Box>
              </Stack>
              <Card sx={{ mb: 1 }} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography>Personal Details</Typography>
                      </Stack>
                    </Grid>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                      <Grid item xs={4}>
                        <SelectWrapper
                          name="idTypeId"
                          size="small"
                          label="User ID Type"
                          options={[
                            {
                              value: 1,
                              label: "SA ID",
                            },
                            {
                              value: 2,
                              label: "Passport",
                            },
                          ]}
                        />
                      </Grid>

                      <>
                        {values.idTypeId === 1 && (
                          <>
                            <Grid item xs={6}>
                              <TextfieldWrapper
                                name="idNumber"
                                size="small"
                                label="ID Number"
                              />
                            </Grid>
                            {
                              // hidden field for vopd response
                            }
                            <Field type="hidden" name="vopdResponse" />
                            <Grid item xs={2}>
                              {!values.isVopdVerified ? (
                                <VopdRequest />
                              ) : (
                                <Alert severity="info">VOPD Complete</Alert>
                              )}
                            </Grid>
                          </>
                        )}

                        {values.idTypeId === 2 && (
                          <>
                            <Grid item xs={6}>
                              <TextfieldWrapper
                                size="small"
                                name="idNumber"
                                label="Passport Number"
                              />
                            </Grid>
                          </>
                        )}
                      </>

                      <Grid item xs={4}>
                        <SupportDocuments
                          label="Upload Support Document"
                          document_type="Support Document"
                          newDocument={newDocument}
                          setNewDocument={setNewDocument}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <DownloadFileButton
                          documents={values?.supportDocument}
                        />
                      </Grid>

                      {values.idTypeId !== 1 && (
                        <>
                          <Grid item xs={4}>
                            <DOBPicker
                              size="small"
                              name="dateOfBirth"
                              label="Date of Birth"
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <SelectWrapper
                              size="small"
                              name="gender"
                              label="Gender"
                              options={[
                                {
                                  value: 1,
                                  label: "Male",
                                },
                                {
                                  value: 2,
                                  label: "Female",
                                },
                              ]}
                            />
                          </Grid>
                        </>
                      )}
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          size="small"
                          name="firstName"
                          label="First Name"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          size="small"
                          name="surname"
                          label="Surname"
                        />
                      </Grid>
                      {data?.vopdResponse && (
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
                                  VOPD Response: {data?.vopdResponse?.status}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Card>
                                  <Stack>
                                    <>
                                      <Typography
                                        variant="caption"
                                        sx={{ p: 2 }}
                                      >
                                        idNumber :{" "}
                                        {data?.vopdResponse?.idNumber}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ p: 2 }}
                                      >
                                        dateOfBirth:{" "}
                                        {data?.vopdResponse?.dateOfBirth}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ p: 2 }}
                                      >
                                        dateOfDeath:{" "}
                                        {data?.vopdResponse?.dateOfDeath}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ p: 2 }}
                                      >
                                        firstName:{" "}
                                        {data?.vopdResponse?.firstName}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ p: 2 }}
                                      >
                                        surname: {data?.vopdResponse?.surname}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ p: 2 }}
                                      >
                                        maritalStatus:{" "}
                                        {data?.vopdResponse?.maritalStatus}
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
                </CardContent>
              </Card>

              <Card sx={{ mb: 1 }} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography> Contact Details</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <PreferredCommunicationSelect
                        size="small"
                        name="preferredCommunicationTypeId"
                        label="Preferred Communication"
                      />

                      {diff?.preferredCommunicationTypeId && (
                        <DiffAlert
                          from={
                            diff.preferredCommunicationTypeId.from === 1
                              ? "Email"
                              : diff.preferredCommunicationTypeId.from === 2
                                ? "Phone"
                                : diff.preferredCommunicationTypeId.from === 3
                                  ? "SMS"
                                  : diff.preferredCommunicationTypeId.from === 4
                                    ? "Post"
                                    : ""
                          }
                          to={
                            diff.preferredCommunicationTypeId.to === 1
                              ? "Email"
                              : diff.preferredCommunicationTypeId.to === 2
                                ? "Phone"
                                : diff.preferredCommunicationTypeId.to === 3
                                  ? "SMS"
                                  : diff.preferredCommunicationTypeId.to === 4
                                    ? "Post"
                                    : ""
                          }
                        />
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="cellNumber"
                        label="Mobile Phone Number"
                        size="small"
                      />
                      {diff?.cellNumber && (
                        <DiffAlert
                          from={diff.cellNumber.from}
                          to={diff.cellNumber.to}
                        />
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="tellNumber"
                        label="Telephone Number"
                        size="small"
                      />
                      {diff?.tellNumber && (
                        <DiffAlert
                          from={diff.tellNumber.from}
                          to={diff.tellNumber.to}
                        />
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="emailAddress"
                        label="Email Address"
                        size="small"
                      />
                      {diff?.emailAddress && (
                        <DiffAlert
                          from={diff.emailAddress.from}
                          to={diff.emailAddress.to}
                        />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <Button
                disabled={!dirty}
                type="submit"
                size="large"
                sx={{ mt: 2 }}
                variant="contained"
              >
                Save
              </Button>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default BeneficiaryForm;
