import {
  Button,
  Grid,
  Stack,
  Alert,
  Typography,
  TextField,
} from "@mui/material";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import SwitchWrapper from "components/FormComponents.jsx/SwitchWrapper";
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
import MemberNotes from "components/FormComponents.jsx/MemberNotes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
const BeneficiaryFormEdits = ({ data, edit, setMembers, diff }) => {
  const [newDocument, setNewDocument] = React.useState({});

  return (
    <>
      <Formik
        initialValues={{
          id: data ? data?.id : uuidv4(),
          client_type: "beneficiary",
          title: data ? data?.title : "",
          firstName: data ? data?.firstName : "",
          surname: data ? data.surname : "",
          idNumber: data ? data?.idNumber : "",
          vopdResponse: data?.vopdResponse || "",
          dateOfBirth: data?.dateOfBirth ? dayjs(data.dateOfBirth) : "",
          idTypeId: data ? data?.idTypeId : 1,
          supportDocument: data?.supportDocument || [],
          cellNumber: data ? data?.cellNumber : "",
          emailAddress: data ? data?.emailAddress : "",
          preferredCommunicationTypeId: data
            ? data?.preferredCommunicationTypeId
            : "",
          tellNumber: data ? data?.tellNumber : "",
          rolePlayerId: data?.rolePlayerId || "",
          gender: data ? data?.gender : "",
          PolicyMember: {
            memberTypeId: 6,
            memberType: "Beneficiary",
            status: edit ? "isEdited" : "New",
            isBeneficiary: true,
            benefitId: 0,
            benefit: "N/A",
            statedBenefit: 0,
            statedBenefitId: 0,
            ...data?.PolicyMember,
          },

          // rolePlayerAddresses: [],
        }}
        enableReinitialize={true}
        validationSchema={Yup.object({
          firstName: Yup.string().required("Required"),
          surname: Yup.string().required("Required"),

          // preferredCommunicationTypeId: Yup.string().nullable(),

          cellNumber: Yup.string()
            .nullable()
            .when("preferredCommunicationTypeId", {
              is: (val) => String(val) === "2" || String(val) === "3",
              then: (schema) => schema.required("Phone number is required"),
            }),

          emailAddress: Yup.string()
            .nullable()
            .when("preferredCommunicationTypeId", {
              is: (val) => String(val) === "1",
              then: (schema) =>
                schema
                  .email("Invalid email address")
                  .required(
                    "Email address is required if preferred communication is email",
                  ),
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
                  (item) => item.id === newValues.id,
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
        }}
      >
        {({ values, dirty, setFieldValue }) => {
          // console.log(errors);
          return (
            <Form>
              <ExceptionsHandler data={values} setFieldValue={setFieldValue} />
              <Button
                disabled={dirty ? false : true}
                type="submit"
                size="large"
                sx={{ mt: 2 }}
                variant="contained"
              >
                Save
              </Button>
              <Grid sx={{ my: 2, borderTop: 1, borderColor: "primary.main" }}>
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
                    <>
                      <SupportDocuments
                        label="Upload support Document"
                        document_type="supportDocument"
                      />
                    </>

                    <DownloadFileButton documents={values?.supportDocument} />
                  </Grid>

                  {values.idTypeId !== 1 && (
                    <>
                      <Grid item xs={4}>
                        <DOBPicker
                          name="dateOfBirth"
                          disabled={disabledFields?.dateOfBirth}
                          label="Date of Birth"
                        />
                        {diff?.dateOfBirth && (
                          <DiffAlert
                            from={diff.dateOfBirth.from}
                            to={diff.dateOfBirth.to}
                          />
                        )}
                      </Grid>
                      <Grid item xs={2}>
                        <SelectWrapper
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
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                <Grid item xs={5}>
                  <TextfieldWrapper name="firstName" label="First Name" />
                  {diff?.firstName && (
                    <DiffAlert
                      from={diff.firstName.from}
                      to={diff.firstName.to}
                    />
                  )}
                </Grid>
                <Grid item xs={5}>
                  <TextfieldWrapper name="surname" label="Last Name" />
                  {diff?.surname && (
                    <DiffAlert from={diff.surname.from} to={diff.surname.to} />
                  )}
                </Grid>
              </Grid>
              <Grid sx={{ my: 2, borderTop: 1, borderColor: "primary.main" }}>
                <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                  Contact Details
                </Typography>
              </Grid>
              <Grid container sx={{ pt: 2 }} spacing={2}>
                <Grid item xs={6}>
                  <PreferredCommunicationSelect
                    name="preferredCommunicationTypeId"
                    label="Preferred Communication"
                  />
                  {diff?.preferredCommunicationTypeId && (
                    <DiffAlert
                      from={diff.preferredCommunicationTypeId.from}
                      to={diff.preferredCommunicationTypeId.to}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    type="number"
                    name="cellNumber"
                    label="Mobile Number"
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
                    type="number"
                    name="tellNumber"
                    label="Telephone Number"
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
                    type="email"
                    name="emailAddress"
                    label="Email Address"
                  />
                  {diff?.emailAddress && (
                    <DiffAlert
                      from={diff.emailAddress.from}
                      to={diff.emailAddress.to}
                    />
                  )}
                </Grid>
              </Grid>

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

export default BeneficiaryFormEdits;
