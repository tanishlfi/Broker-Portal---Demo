import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Button,
  Divider,
  Grid,
  Stack,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  LinearProgress,
  FormControl,
} from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import SwitchWrapper from "components/FormComponents.jsx/SwitchWrapper";
import WaitingPeriodInfo from "components/FormComponents.jsx/NotificationWaitingPeriod";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DiffAlert from "components/FormComponents.jsx/DiffAlert";
import MemberNotes from "components/FormComponents.jsx/MemberNotes";
import ExceptionsHandler from "./ExceptionsHandler";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SupportDocuments from "./SupportDocuments";
import DownloadFileButton from "components/Bits/DownloadFileButton";
import customGridSeperator from "components/customStyles/gridSeperator";
// import BenefitSelect from "components/FormComponents.jsx/BenefitSelect";
import ChildStudentDisabledSelect from "components/FormComponents.jsx/ChildStudentDisabledSelect";
const OnboardingMemberFormViewOnly = ({
  data,
  setMembers,
  isEdit,
  diff,
  needsConfirmation,
  disabledFields,
  policyInceptionDate,
  waitingPeriod,
  maxCover,
  benefits,
  setUpdatedMainMember,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  console.log("data", data);

  const handleSaveButton = () => {
    setIsSubmitted(true);

    // Clear
  };

  // if benefit statedBenefitId is set, set statedBenefit to the benefit name
  // if (benefits && data?.PolicyMember?.statedBenefitId) {
  //   const selectedBenefit = benefits.find(
  //     (x) => x.benefitId === data.statedBenefitId,
  //   );
  //   data.statedBenefit = selectedBenefit?.benefit;

  // }

  // filter out the benefits that are not coverMemberType === 1
  // const filteredBenefits = benefits?.filter((x) => x.coverMemberType === 1);

  return (
    <>
      <Formik
        initialValues={{
          id: data ? data?.id : uuidv4(),
          client_type: data?.client_type || "",
          confirmed: data?.confirmed || false,
          title: data?.title || "",
          firstName: data?.firstName || "",
          surname: data?.surname || "",
          idNumber: data?.idNumber || "",
          vopdResponse: data?.vopdResponse || "",
          // dateOfBirth: data?.dateOfBirth
          //   ? dayjs(data.dateOfBirth).format("DD-MM-YYYY")
          //   : "",
          dateOfBirth: data?.dateOfBirth || "",
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
          supportDocument: data?.supportDocument || [],
          memberType: data?.client_type,
          memberTypeId:
            data?.memberTypeId || data?.client_type === "Spouse"
              ? 2
              : data?.client_type === "Child"
              ? 3
              : data?.client_type === "Extended Family"
              ? 4
              : 0,
          isBeneficiary: data?.isBeneficiary || false,
          isStudent: data?.isStudent ? true : false,
          isDisabled: data?.isDisabled ? true : false,
          status: "New",
          statedBenefitId: data?.statedBenefitId || "",
          statedBenefit: data?.statedBenefit || "",
          benefitName: data?.benefitName || "",
          PreviousInsurerPolicyNumber: data?.PreviousInsurerPolicyNumber || "",
          PreviousInsurerJoinDate:
            data?.PreviousInsurer &&
            data?.PreviousInsurerJoinDate &&
            data?.PreviousInsurerJoinDate !== ""
              ? dayjs(data?.PreviousInsurerJoinDate)
              : "",
          PreviousInsurerCancellationDate:
            data?.PreviousInsurer &&
            data?.PreviousInsurerCancellationDate &&
            data?.PreviousInsurerCancellationDate !== ""
              ? dayjs(data?.PreviousInsurerCancellationDate)
              : "",
          PreviousInsurer: data?.PreviousInsurer || "",
          PreviousInsurerCoverAmount: data?.PreviousInsurerCoverAmount || 0,
          exceptions: data?.exceptions || [],
          // rolePlayerAddresses: [],
        }}
        enableReinitialize={true}
        validationSchema={validation}
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
          if (benefits && values.statedBenefitId) {
            const selectedBenefit = benefits.find(
              (x) => x.benefitId === values.statedBenefitId,
            );
            newValues.statedBenefit = selectedBenefit?.benefit;
            setUpdatedMainMember(selectedBenefit);
          }

          // if previous insurer join date is set and previous insurer cancellation date is set calculate the difference
          // if (
          //   newValues.PPreviousInsurerJoinDate &&
          //   newValues.PPreviousInsurerCancellationDate
          // ) {
          //   const joinDate = dayjs(
          //     newValues.PPreviousInsurerJoinDate,
          //     "DD-MM-YYYY",
          //   );
          //   const cancelDate = dayjs(
          //     newValues.PPreviousInsurerCancellationDate,
          //     "DD-MM-YYYY",
          //   );

          //   newValues.PPreviousInsurerMonths = cancelDate.diff(
          //     joinDate,
          //     "months",
          //   );
          // }

          isEdit
            ? setMembers((prev) => {
                const index = prev.findIndex((x) => x.id === newValues.id);
                prev[index] = newValues;
                return [...prev];
              })
            : setMembers((prev) => [...prev, newValues]);
        }}
      >
        {({ values, dirty, setFieldValue, errors }) => {
          console.log("values", values.PreviousInsurerCancellationDate);

          return (
            <Form>
              <ExceptionsHandler data={values} setFieldValue={setFieldValue} />

              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left">
                  Personal Details
                </Typography>
              </Grid>

              {
                // show only if memberType is Child
                values.memberType === "Child" && (
                  <Grid item xs={12}>
                    <ChildStudentDisabledSelect disableSelection={true} />
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
                )
              }

              <Grid sx={{ my: 2 }} container>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <SelectWrapper
                      name="idTypeId"
                      label="User ID Type"
                      disabled={disabledFields?.idTypeId}
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
                      inputProps={{ readOnly: true }}
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
                            type="number"
                            name="idNumber"
                            disabled={disabledFields?.idNumber}
                            label="ID Number"
                            inputProps={{ readOnly: true }}
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
                            disabled={disabledFields?.idNumber}
                            name="idNumber"
                            label="Passport Number"
                            inputProps={{ readOnly: true }}
                          />
                          {diff?.idNumber && (
                            <DiffAlert
                              from={diff.idNumber.from}
                              to={diff.idNumber.to}
                            />
                          )}
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
                          disabled={disabledFields?.dateOfBirth}
                          label="Date of Birth"
                          readOnly
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
                          inputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}
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
                              {" "}
                              VOPD Response: {data?.vopdResponse?.status}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Card>
                              <Stack>
                                <>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    idNumber : {data?.vopdResponse?.idNumber}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    dateOfBirth:{" "}
                                    {data?.vopdResponse?.dateOfBirth}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    dateOfDeath:{" "}
                                    {data?.vopdResponse?.dateOfDeath}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    firstName: {data?.vopdResponse?.firstName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
                                    surname: {data?.vopdResponse?.surname}
                                  </Typography>
                                  <Typography variant="caption" sx={{ p: 2 }}>
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    disabled={disabledFields?.firstName}
                    name="firstName"
                    label="First Name"
                    inputProps={{ readOnly: true }}
                  />
                  {diff?.firstName && (
                    <DiffAlert
                      from={diff.firstName.from}
                      to={diff.firstName.to}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    disabled={disabledFields?.surname}
                    name="surname"
                    label="Surname"
                    inputProps={{ readOnly: true }}
                  />
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
                    benefits ? (
                      <FormControl fullWidth>
                        <InputLabel id="select-statedbenefit">
                          Benefit
                        </InputLabel>
                        <Select
                          labelId="select-statedbenefit"
                          id="select_id"
                          value={values.statedBenefitId}
                          label="Benefit"
                          onChange={(event) => {
                            setFieldValue(
                              "statedBenefitId",
                              event.target.value,
                            );
                            const selectedBenefit = benefits.find(
                              (x) => x.benefitId === event.target.value,
                            );
                            setFieldValue(
                              "statedBenefit",
                              selectedBenefit?.benefit,
                            );
                          }}
                          inputProps={{ readOnly: true }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {benefits &&
                            benefits?.map((item, index) => {
                              return (
                                <MenuItem key={index} value={item.benefitId}>
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

                {data?.PolicyMember?.benefit && (
                  <Grid sx={{ pt: 2 }} item xs={6}>
                    <TextfieldWrapper
                      disabled={true}
                      name="benefit"
                      label="Benefit on file"
                    />
                  </Grid>
                )}
              </Grid>

              {
                // hidden field for stated benefit
              }
              <Field type="hidden" name="statedBenefit" />

              <Stack sx={{ mt: 2 }} direction="row" justifyContent="flex-end">
                <SwitchWrapper
                  value={values.isBeneficiary ? true : false}
                  name="isBeneficiary"
                  label="Beneficiary"
                />
              </Stack>
              {(values.isBeneficiary || values.memberTypeId === 1) && (
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
                        inputProps={{ readOnly: true }}
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
                        type="number"
                        name="cellNumber"
                        label="Mobile Phone Number"
                        inputProps={{ readOnly: true }}
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
                        inputProps={{ readOnly: true }}
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
                        inputProps={{ readOnly: true }}
                      />
                      {diff?.emailAddress && (
                        <DiffAlert
                          from={diff.emailAddress.from}
                          to={diff.emailAddress.to}
                        />
                      )}
                    </Grid>
                  </Grid>
                  <Grid sx={{ pt: 2 }} container spacing={2}>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="addressLine1"
                        label="Address Line 1"
                        inputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="addressLine2"
                        label="Address Line 2"
                        inputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="city"
                        label="City"
                        inputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <SelectWrapper
                        name="province"
                        label="Province"
                        options={[
                          { value: "EASTERN CAPE", label: "EASTERN CAPE" },
                          { value: "FREE STATE", label: "FREE STATE" },
                          { value: "GAUTENG", label: "GAUTENG" },
                          { value: "KWAZULU-NATAL", label: "KWAZULU-NATAL" },
                          { value: "LIMPOPO", label: "LIMPOPO" },
                          { value: "MPUMALANGA", label: "MPUMALANGA" },
                          { value: "NORTH WEST", label: "NORTH WEST" },
                          { value: "NORTHERN CAPE", label: "NORTHERN CAPE" },
                          { value: "WESTERN CAPE", label: "WESTERN CAPE" },
                        ]}
                        inputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="postalCode"
                        label="Postal Code"
                        type="number"
                        inputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
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
                    name="PreviousInsurer"
                    label="Previous Insurer"
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="PreviousInsurerPolicyNumber"
                    label="Previous Insurer Policy Number"
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
              <Grid container sx={{ pt: 2 }} spacing={2}>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="PreviousInsurerCoverAmount"
                    label="Previous Insurer Cover Amount"
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>

              <Grid container sx={{ pt: 2, mb: 2 }} spacing={2}>
                <Grid item xs={6}>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="en-gb"
                  >
                    <DatePicker
                      views={["year", "month", "day"]}
                      openTo="day"
                      label="Previous Insurer Join Date"
                      name="PreviousInsurerJoinDate"
                      value={values.PreviousInsurerJoinDate}
                      onChange={(newValue) => {
                        setFieldValue("PreviousInsurerJoinDate", newValue);
                      }}
                      variant="inline"
                      inputVariant="outlined"
                      fullWidth
                      renderInput={(params) => <TextField {...params} />}
                      readOnly
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="en-gb"
                  >
                    <DatePicker
                      views={["year", "month", "day"]}
                      openTo="day"
                      label="Previous Insurer Cancellation Date"
                      name="PreviousInsurerCancellationDate"
                      value={values.PreviousInsurerCancellationDate}
                      onChange={(newValue) => {
                        setFieldValue(
                          "PreviousInsurerCancellationDate",
                          newValue,
                        );
                      }}
                      variant="inline"
                      inputVariant="outlined"
                      fullWidth
                      renderInput={(params) => <TextField {...params} />}
                      readOnly
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>

              <Grid sx={{ my: 2 }}>
                <WaitingPeriodInfo
                  PreviousInsurerJoinDate={values.PreviousInsurerJoinDate}
                  PreviousInsurerCancellationDate={
                    values.PreviousInsurerCancellationDate
                  }
                  waitingPeriod={waitingPeriod}
                  policyInceptionDate={policyInceptionDate}
                />
              </Grid>

              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                  Member Notes
                </Typography>
                <MemberNotes name="notes" />
              </Grid>

              <Stack direction="row" justifyContent="space-between">
                {needsConfirmation && diff && (
                  <>
                    {!values.confirmed ? (
                      <Button
                        size="large"
                        onClick={() => {
                          setFieldValue("confirmed", true);
                        }}
                        sx={{ mt: 2 }}
                        variant="contained"
                      >
                        Confirm Edits
                      </Button>
                    ) : (
                      <Button
                        disabled
                        size="large"
                        sx={{ mt: 2 }}
                        variant="contained"
                      >
                        Confirmed
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default OnboardingMemberFormViewOnly;

const validation = Yup.object({
  idTypeId: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  surname: Yup.string().required("Required"),
  idNumber: Yup.string().when("idTypeId", {
    is: "1",
    then: Yup.string()
      .required("Id Number is required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid",
      ),
    otherwise: Yup.string().required("Required"),
  }),

  preferredCommunicationTypeId: Yup.string().required(
    "Preferred Communication is required",
  ),

  cellNumber: Yup.string()
    .nullable()
    // can only be numbers
    .matches(/^[0-9]*$/, "Mobile phone number must be only numbers")
    // length of 10
    .matches(/^[0-9]{10}$/, "Mobile phone number must be 10 digits long")
    // must match valid format
    .matches(/^0[1-9][0-9]{8}$/, {
      message: "Please enter a valid 10-digit mobile number starting with 0.",
    })
    // only validate if preferredCommunicationType is Phone or SMS
    .when("preferredCommunicationTypeId", {
      is: (val) => String(val) === "2" || String(val) === "3",
      then: Yup.string().required("Mobile phone number is required"),
    }),

  emailAddress: Yup.string()
    .nullable()
    .when("preferredCommunicationTypeId", {
      is: (val) => String(val) === "1",
      then: Yup.string()
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

  addressLine1: Yup.string().required("Address Line 1 is required"),

  city: Yup.string().required("A city is required"),
  // province: Yup.string().required("A province is required"),

  // postalCode: Yup.string()
  //   .nullable()
  //   .matches(
  //     /^[0-9]{4}$/,
  //     "Postal Code must be 4 digits long and only numbers",
  //   ),
});
