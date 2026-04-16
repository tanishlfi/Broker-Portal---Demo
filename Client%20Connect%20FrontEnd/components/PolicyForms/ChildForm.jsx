import React, { useState, useCallback } from "react";
import { Formik, Form, useFormikContext, Field } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import {
  Grid,
  Button,
  Stack,
  Typography,
  Alert,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  LinearProgress,
} from "@mui/material";
import * as Yup from "yup";
import dayjs from "dayjs";
import SwitchWrapper from "components/FormComponents.jsx/SwitchWrapper";
import { v4 as uuidv4 } from "uuid";
// import AddDocument from "components/FormComponents.jsx/AddDocument";
import DownloadFileButton from "components/Bits/DownloadFileButton";
import { nodeSa } from "src/AxiosParams";
import DiffAlert from "components/FormComponents.jsx/DiffAlert";
import useToken from "hooks/useToken";
import ChildStudentDisabledSelect from "components/FormComponents.jsx/ChildStudentDisabledSelect";
import ExceptionsHandler from "./ExceptionsHandler";
import styled from "@emotion/styled";
import SupportDocuments from "./SupportDocuments";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import MemberNotes from "components/FormComponents.jsx/MemberNotes";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import WaitingPeriodInfo from "components/FormComponents.jsx/NotificationWaitingPeriod";
import customGridSeperator from "components/customStyles/gridSeperator";

const ChildForm = ({
  edit = false,
  setMembers,
  data,
  handleClose = () => {},
  diff,
  policyInceptionDate,
  waitingPeriod,
  maxCover,
  benefits,
}) => {
  // filter benefits on DependantBenefitRules where coverMemberType === Child
  const filteredBenefits = benefits.DependantBenefitRules
    ? benefits.DependantBenefitRules.filter(
        (benefit) => benefit.coverMemberType === "Child"
      )
    : [];
  return (
    <>
      <Formik
        initialValues={{
          id: data ? data?.id : uuidv4(),
          firstName: data?.firstName || "",
          surname: data?.surname || "",
          idNumber: data?.idNumber || "",
          vopdResponse: data?.vopdResponse || null,
          dateOfBirth: data?.dateOfBirth,
          idTypeId: data?.idTypeId || "",
          cellNumber: data?.cellNumber || "",
          emailAddress: data?.emailAddress || "",
          preferredCommunicationTypeId:
            data?.preferredCommunicationTypeId || "",
          tellNumber: data?.tellNumber || "",
          gender: data?.gender || "",
          isStudent: data?.isStudent ? true : false,
          isDisabled: data?.isDisabled ? true : false,
          rolePlayerId: data?.rolePlayerId || "",
          supportDocument: data?.supportDocument || [],
          ...data?.PolicyMember,
          PolicyMember: {
            memberTypeId: 3,
            isBeneficiary: data?.PolicyMember?.isBeneficiary || false,
            status: edit ? "isEdited" : "New",
            statedBenefitId: data?.PolicyMember.statedBenefitId || "",
            statedBenefit: data?.PolicyMember.statedBenefit || "",
            PreviousInsurerPolicyNumber:
              data?.PolicyMember.PreviousInsurerPolicyNumber || "",
            PreviousInsurerJoinDate:
              data?.PolicyMember.PreviousInsurer &&
              data?.PolicyMember.PreviousInsurerJoinDate
                ? dayjs(data?.PolicyMember.PreviousInsurerJoinDate).format(
                    "DD-MM-YYYY"
                  )
                : "",
            PreviousInsurerCancellationDate:
              data?.PolicyMember.PreviousInsurer &&
              data?.PolicyMember.PreviousInsurerCancellationDate
                ? dayjs(
                    data?.PolicyMember.PreviousInsurerCancellationDate
                  ).format("DD-MM-YYYY")
                : "",
            PreviousInsurer: data?.PolicyMember.PreviousInsurer || "",
            PreviousInsurerCoverAmount:
              data?.PolicyMember.PreviousInsurerCoverAmount || 0,
            ...data?.PolicyMember,
          },
          // rolePlayerAddresses: [],
        }}
        // enableReinitialize={true}
        validationSchema={validationObj}
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

          // set stated benefit if statedBenefitId is set
          if (filteredBenefits && values.PolicyMember.statedBenefitId) {
            const selectedBenefit = filteredBenefits.find(
              (x) => x.id === values.PolicyMember.statedBenefitId
            );
            newValues.PolicyMember.statedBenefit = selectedBenefit?.benefit;
          }

          edit
            ? setMembers((members) => {
                const index = members.findIndex(
                  (item) => item.id === newValues.id
                );
                members[index] = newValues;
                return [...members];
              })
            : setMembers((members) => [...members, newValues]);

          handleClose();
        }}>
        {({ values, dirty, setFieldValue }) => {
          return (
            <Form>
              <ExceptionsHandler data={values} setFieldValue={setFieldValue} />
              <Button
                disabled={dirty ? false : true}
                type="submit"
                size="large"
                sx={{ mt: 2 }}
                variant="contained">
                Save
              </Button>
              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left">
                  Personal Details
                </Typography>
              </Grid>
              <Grid sx={{ mt: 2 }} container>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ChildStudentDisabledSelect />
                    {diff?.isStudent && (
                      <DiffAlert
                        from={diff.isStudent.from}
                        to={diff.isStudent.to}
                      />
                    )}
                    {diff?.isDisabled && (
                      <DiffAlert
                        from={diff.isDisabled.from}
                        to={diff.isDisabled.to}
                      />
                    )}
                  </Grid>

                  <Grid item xs={4}>
                    <SelectWrapper
                      name="idTypeId"
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
                    {diff?.idTypeId && (
                      <DiffAlert
                        from={
                          diff.idTypeId.from === 1
                            ? "SA ID"
                            : diff.idTypeId.from === 2
                            ? "Passport"
                            : "Other"
                        }
                        to={
                          diff.idTypeId.to === 1
                            ? "SA ID"
                            : diff.idTypeId.to === 2
                            ? "Passport"
                            : "Other"
                        }
                      />
                    )}
                  </Grid>

                  <>
                    {values.idTypeId === 1 && (
                      <>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            name="idNumber"
                            // disabled={disabledFields?.idNumber}
                            label="ID Number"
                          />
                          {diff?.idNumber && (
                            <DiffAlert
                              from={diff.idNumber.from}
                              to={diff.idNumber.to}
                            />
                          )}
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
                            name="idNumber"
                            label="Passport Number"
                          />
                          {diff?.idNumber && (
                            <DiffAlert
                              from={diff.idNumber.from}
                              to={diff.idNumber.to}
                            />
                          )}
                        </Grid>
                        <Grid item xs={4}>
                          <DOBPicker
                            name="dateOfBirth"
                            label="Date of Birth"
                            minDate={
                              values.isStudent === true
                                ? dayjs().subtract(24, "years")
                                : values.isDisabled === true
                                ? dayjs().subtract(99, "years")
                                : dayjs().subtract(21, "years")
                            }
                            maxDate={dayjs().subtract(0, "years")}
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
                          {diff?.gender && (
                            <DiffAlert
                              from={diff.gender.from}
                              to={diff.gender.to}
                            />
                          )}
                        </Grid>
                      </>
                    )}
                  </>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                <Grid item xs={12}>
                  <>
                    <SupportDocuments
                      label="Upload Support Document"
                      document_type="Support Document"
                    />
                  </>

                  <DownloadFileButton documents={values?.supportDocument} />
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

              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                  Benefit Details
                </Typography>
              </Grid>

              <Grid sx={{ pt: 2 }} container spacing={2}>
                <Grid item xs={6}>
                  {
                    // if benefits are available run select else show text "Benefits will be run during processing"
                    filteredBenefits && filteredBenefits.length > 0 ? (
                      <FormControl fullWidth>
                        <InputLabel id="select-statedbenefit">
                          Benefit
                        </InputLabel>
                        <Select
                          labelId="select-statedbenefit"
                          id="select_id"
                          value={values.PolicyMember.statedBenefitId}
                          label="Benefit"
                          onChange={(event) => {
                            setFieldValue(
                              "PolicyMember.statedBenefitId",
                              event.target.value
                            );
                            const selectedBenefit = filteredBenefits.find(
                              (x) => x.id === event.target.value
                            );
                            setFieldValue(
                              "PolicyMember.statedBenefit",
                              selectedBenefit?.benefit
                            );
                          }}>
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {filteredBenefits &&
                            filteredBenefits?.map((item, index) => {
                              return (
                                <MenuItem key={index} value={item.id}>
                                  {item.benefit}
                                </MenuItem>
                              );
                            })}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography>
                        Benefits will be run during processing
                      </Typography>
                    )
                  }
                </Grid>
                {values.PolicyMember.benefit && (
                  <Grid sx={{ pt: 2 }} item xs={6}>
                    <TextfieldWrapper
                      disabled={true}
                      name="PolicyMember.benefit"
                      label="Benefit on file"
                    />
                  </Grid>
                )}
              </Grid>

              <Stack sx={{ mt: 2 }} direction="row" justifyContent="flex-end">
                <SwitchWrapper
                  value={values.PolicyMember.isBeneficiary ? true : false}
                  name="PolicyMember.isBeneficiary"
                  label="Beneficiary"
                />
              </Stack>

              {
                // hidden field for stated benefit
              }
              <Field type="hidden" name="PolicyMember.statedBenefit" />

              {values.PolicyMember.isBeneficiary && (
                <>
                  <Grid sx={customGridSeperator}>
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
                </>
              )}

              {(values.isStudent || values.isDisabled) &&
                (!document || values.supportDocument.length > 0) && (
                  <>
                    <Alert severity="info">
                      <Stack direction="row">
                        <Typography variant="body1">
                          Please upload supporting documents
                        </Typography>
                      </Stack>
                    </Alert>
                  </>
                )}

              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                  Previous Insurer Details
                </Typography>
              </Grid>

              <Grid container sx={{ pt: 2 }} spacing={2}>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="PolicyMember.PreviousInsurer"
                    label="Previous Insurer"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="PolicyMember.PreviousInsurerPolicyNumber"
                    label="Previous Insurer Policy Number"
                  />
                </Grid>
              </Grid>
              <Grid container sx={{ pt: 2 }} spacing={2}>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="PolicyMember.PreviousInsurerCoverAmount"
                    label="Previous Insurer Cover Amount"
                  />
                </Grid>
              </Grid>

              <Grid container sx={{ pt: 2, mb: 2 }} spacing={2}>
                <Grid item xs={6}>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="en-gb">
                    <DatePicker
                      views={["year", "month", "day"]}
                      openTo="day"
                      label="Previous Insurer Join Date"
                      name="PolicyMember.PreviousInsurerJoinDate"
                      value={
                        values.PolicyMember.PreviousInsurerJoinDate === ""
                          ? null
                          : values.PolicyMember.PreviousInsurerJoinDate
                      }
                      onChange={(newValue) => {
                        setFieldValue(
                          "PolicyMember.PreviousInsurerJoinDate",
                          newValue
                        );
                      }}
                      variant="inline"
                      inputVariant="outlined"
                      fullWidth
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="en-gb">
                    <DatePicker
                      views={["year", "month", "day"]}
                      openTo="day"
                      label="Previous Insurer Cancellation Date"
                      name="PolicyMember.PreviousInsurerCancellationDate"
                      value={
                        values.PolicyMember.PreviousInsurerCancellationDate ===
                        ""
                          ? null
                          : values.PolicyMember.PreviousInsurerCancellationDate
                      }
                      onChange={(newValue) => {
                        setFieldValue(
                          "PolicyMember.PreviousInsurerCancellationDate",
                          newValue
                        );
                      }}
                      variant="inline"
                      inputVariant="outlined"
                      fullWidth
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>

              <Grid sx={{ my: 2 }}>
                <WaitingPeriodInfo
                  PreviousInsurerJoinDate={
                    values.PolicyMember.PreviousInsurerJoinDate
                  }
                  PreviousInsurerCancellationDate={
                    values.PolicyMember.PreviousInsurerCancellationDate
                  }
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                />
              </Grid>

              {/* <Grid
                item
                xs={12}
                sx={{ my: 2, borderTop: 1, borderColor: "primary.main" }}
              >
                <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                  Member Notes
                </Typography>
                <MemberNotes name="notes" />
              </Grid> */}

              <Button
                disabled={!dirty}
                type="submit"
                size="large"
                sx={{ mt: 2 }}
                variant="contained">
                Save
              </Button>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default ChildForm;

const validationObj = Yup.object({
  idTypeId: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  surname: Yup.string().required("Required"),

  preferredCommunicationTypeId: Yup.string().nullable(),

  cellNumber: Yup.string()
    .nullable()
    .matches(
      /^0[6-8][0-9]{8}$/,
      "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
    )
    .when("preferredCommunicationTypeId", {
      is: "3",
      then: Yup.string().required("Mobile phone number is required"),
    }),

  emailAddress: Yup.string()
    .nullable()
    .email("Invalid email format")
    .when("preferredCommunicationTypeId", {
      is: "1",
      then: Yup.string().required("Email address is required"),
    }),

  idNumber: Yup.string().when("idType", {
    is: `1`,
    then: Yup.string()
      .required("Required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid"
      ),
    otherwise: Yup.string().required("Required"),
  }),

  // age cannot be more than 65 Or less than 18
  // dateOfBirth validation only for non SA ID, where idTypeId is not 1
  dateOfBirth: Yup.date().when("idTypeId", {
    is: (idTypeId) => idTypeId !== "1",
    then: Yup.date().required("Required"),
  }),

  // supportDocument: Yup.array()
  //   .when("isStudent", {
  //     is: true,
  //     then: Yup.array()
  //       .required("Support documents are required for students")
  //       .min(1, "At least one support document is required for students"),
  //     otherwise: Yup.array().notRequired(),
  //   })
  //   .when("isDisabled", {
  //     is: true,
  //     then: Yup.array()
  //       .required("Support documents are required for disabled Child Member")
  //       .min(
  //         1,
  //         "At least one support document is required for disabled Child Member"
  //       ),
  //     otherwise: Yup.array().notRequired(),
  //   }),
});

const Input = styled("input")({
  display: "none",
});
