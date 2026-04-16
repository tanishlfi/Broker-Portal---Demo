import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import React from "react";
import SelectWrapper from "../../../../components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "../../../../components/FormComponents.jsx/TextFieldWrapper";
import VopdEditRequest from "./VopdEditRequest";
import SwitchWrapper from "../../../../components/FormComponents.jsx/SwitchWrapper";
import PreferredCommunicationSelect from "../../../../components/FormComponents.jsx/PreferredCommunicationSelect";
import SupportDocuments from "../../../../components/PolicyForms/SupportDocuments";
import DownloadFileButton from "../../../../components/Bits/DownloadFileButton";
import DateOfBirthPicker from "./DateOfBirthPicker";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import ChangeMemberType from "./ChangeMemberType";
import ChildStudentDisabledSelect from "../../../../components/FormComponents.jsx/ChildStudentDisabledSelect";
import * as Yup from "yup";
import DiffAlert from "../../../../components/FormComponents.jsx/DiffAlert";
import UploadSupportDocuments from "../UploadSupportDocuments";

const OtherMembers = ({
  newClient,
  data,
  setPolicyMembers,
  action,
  differences: diff,
  clientType,
  PolicyData,
  noEdit,
  insuredLifeRemovalReason,
}) => {
  let isOlder;
  let is18;
  let hasSupportDocs;

  // console.log("data", data);

  const today = dayjs();
  const isBeforeCutoff = today.date() < 16;
  const minDate = isBeforeCutoff
    ? today.startOf("month")
    : today.add(1, "month").startOf("month");

  // Maximum date is 3 months from minimum date
  const maxDate = minDate.add(2, "month").startOf("month");

  return (
    <div>
      <Formik
        initialValues={{
          // or random number
          ...data,
          RolePlayerId: data?.RolePlayerId ? data?.RolePlayerId : "0",
          IdTypeId: data?.IdTypeId || 1,
          IdNumber: data?.IdNumber.trim() || "",
          isVopdVerified: data?.isVopdVerified || "",
          MemberTypeId:
            clientType === "Spouse"
              ? 2
              : clientType === "Child"
              ? 3
              : clientType === "Extended"
              ? 4
              : clientType === "Beneficiary"
              ? 6
              : 0,
          FirstName: data?.FirstName.toUpperCase() || "",
          Surname: data?.Surname.toUpperCase() || "",
          DateOfBirth: data?.DateOfBirth ? dayjs(data?.DateOfBirth) : dayjs(),
          DateOfDeath: data?.DateOfDeath,
          MaritalStatus: data?.MaritalStatus || "",
          MemberAction: data?.MemberAction || action,
          PreferredCommunicationTypeId:
            data?.PreferredCommunicationTypeId || "",
          MobileNumber: data?.MobileNumber || "",
          SecondaryNumber: data?.SecondaryNumber || "",
          isStudent: data?.isStudent || false,
          isDisabled: data?.isDisabled || false,
          BenefitId: data?.BenefitId || 0,
          BenefitCode: data?.BenefitCode || "",
          Gender: data?.Gender || "",

          Premium: data?.Premium || 0.0,
          supportDocument: data?.supportDocument || [],
          CoverAmount: data?.CoverAmount
            ? data?.CoverAmount
            : PolicyData?.coverAmount,
          EmailAddress: data?.EmailAddress
            ? data?.EmailAddress
            : data?.EmailAddress || "",
          IsBeneficiary: data?.IsBeneficiary || false,
          PolicyInceptionDate: data?.PolicyInceptionDate || minDate,
          insuredLifeRemovalReason: insuredLifeRemovalReason.find(
            (reason) => reason.id === data.InsuredLifeRemovalReason,
          )?.description,

          // PreviousInsurer Details
          // PreviousInsurer: data?.PreviousInsurer || "",
          // PreviousInsurerPolicyNumber: data?.PreviousInsurerPolicyNumber || "",
          // PreviousInsurerCoverAmount: data?.PreviousInsurerCoverAmount || 0.0,
          // PreviousInsurerJoinDate: data?.PreviousInsurerJoinDate || "",
          // PreviousInsurerCancellationDate:
          //   data?.PreviousInsurerCancellationDate || "",
          // PreviousInsurer Details
        }}
        enableReinitialize={true}
        validationSchema={
          clientType === "Child"
            ? childValidation
            : clientType === "Beneficiary"
            ? BeneficiaryMemberValidation
            : OtherUserValidation
        }
        onSubmit={(values) => {
          let formValues = {
            ...values,
            // CoverAmount: PolicyData?.coverAmount,
          };

          // set firstname and surname to uppercase
          formValues.FirstName = formValues.FirstName.toUpperCase();
          formValues.Surname = formValues.Surname.toUpperCase();

          if (newClient) {
            setPolicyMembers((prev) => [...prev, formValues]);
          } else {
            setPolicyMembers((prev) => {
              return prev.map((member) => {
                if (member.id === data.id) {
                  return {
                    ...member,
                    ...formValues,
                    IdNumber: formValues?.IdNumber.trim(),
                    MemberAction: action,
                  };
                } else return member;
              });
            });
          }
        }}
      >
        {({ dirty, values, setFieldValue, errors }) => {
          isOlder = dayjs().diff(values.DateOfBirth, "year") > 21;
          is18 = dayjs().diff(values.DateOfBirth, "year") >= 18;
          hasSupportDocs = values.supportDocument.length > 0;

          return (
            <Form>
              <Stack
                sx={{ my: 2 }}
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Button
                  disabled={noEdit ? true : !dirty}
                  type="submit"
                  size="large"
                  variant="contained"
                >
                  Save
                </Button>
                {dirty && (
                  <Alert severity="warning">You have unsaved changes</Alert>
                )}
                {values.insuredLifeRemovalReason && (
                  <Alert severity="warning">
                    {values.insuredLifeRemovalReason}
                  </Alert>
                )}
                {clientType === "Child" && isOlder ? (
                  <>
                    {!hasSupportDocs ? (
                      <Alert severity="warning">
                        This child is older than 21 years, please provide
                        supporting documents
                      </Alert>
                    ) : null}
                  </>
                ) : null}

                <Typography>{clientType}</Typography>
                <ChangeMemberType />
              </Stack>

              <Card sx={{ mb: 2 }} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography>Policy Details</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="en-ZA"
                      >
                        <FormControl fullWidth>
                          <DatePicker
                            disabled={
                              noEdit ? true : action === 1 ? false : true
                            }
                            size="small"
                            views={["year", "month"]}
                            openTo="month"
                            label="Policy Inception Date"
                            maxDate={action === 1 ? maxDate : undefined}
                            minDate={action === 1 ? minDate : undefined}
                            name="date"
                            value={values.PolicyInceptionDate}
                            onChange={(newValue) => {
                              let date = dayjs(newValue);

                              date = date.startOf("month");
                              setFieldValue(
                                "PolicyInceptionDate",
                                date.format("YYYY-MM-DDTHH:mm:ss"),
                              );
                            }}
                            variant="inline"
                            inputVariant="outlined"
                            fullWidth
                            renderInput={(params) => (
                              <TextField
                                fullWidth
                                disabled
                                size="small"
                                {...params}
                              />
                            )}
                          />
                        </FormControl>
                      </LocalizationProvider>
                    </Grid>
                    {values?.DateOfDeath && (
                      <Grid item xs={6}>
                        <LocalizationProvider
                          dateAdapter={AdapterDayjs}
                          adapterLocale="en-ZA"
                        >
                          <FormControl fullWidth>
                            <DatePicker
                              disabled
                              size="small"
                              views={["year", "month", "day"]}
                              openTo="month"
                              label="Date Of Death"
                              name="date"
                              value={values.DateOfDeath}
                              variant="inline"
                              inputVariant="outlined"
                              fullWidth
                              renderInput={(params) => (
                                <TextField
                                  fullWidth
                                  disabled
                                  size="small"
                                  {...params}
                                />
                              )}
                            />
                          </FormControl>
                        </LocalizationProvider>
                      </Grid>
                    )}

                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          Cover Amount
                        </InputLabel>
                        <Select
                          size="small"
                          disabled={
                            noEdit
                              ? true
                              : values?.MemberTypeId === 4
                              ? false
                              : true
                          }
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={values?.CoverAmount}
                          label="Cover Amount"
                          onChange={(event) => {
                            setFieldValue("CoverAmount", event.target.value);
                          }}
                        >
                          {PolicyData?.CoverAmountOptions?.map(
                            (option, index) => {
                              return (
                                <MenuItem key={index} value={option}>
                                  R {option}
                                </MenuItem>
                              );
                            },
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2 }} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack
                        sx={{ mt: 2 }}
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Typography>Personal Details</Typography>
                        {is18 && (
                          <Stack direction="row" spacing={2}>
                            <SwitchWrapper
                              disabled={noEdit}
                              size="small"
                              value={values.IsBeneficiary ? true : false}
                              name="IsBeneficiary"
                              label="Beneficiary"
                            />

                            {diff?.IsBeneficiary && (
                              <DiffAlert
                                from={diff.IsBeneficiary.from ? "Yes" : "No"}
                                to={diff.IsBeneficiary.to ? "Yes" : "No"}
                              />
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </Grid>

                    <Grid item xs={6}>
                      <SelectWrapper
                        disabled={noEdit}
                        size="small"
                        name="IdTypeId"
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
                      {diff?.IdTypeId && (
                        <DiffAlert
                          from={diff.IdTypeId.from === 1 ? "SA ID" : "Passport"}
                          to={diff.IdTypeId.to === 1 ? "SA ID" : "Passport"}
                        />
                      )}
                    </Grid>

                    {values.IdTypeId === 1 && (
                      <>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            disabled={noEdit}
                            // type="number"
                            name="IdNumber"
                            label="ID Number"
                          />
                          {diff?.IdNumber && (
                            <DiffAlert
                              from={diff.IdNumber.from}
                              to={diff.IdNumber.to}
                            />
                          )}
                        </Grid>
                      </>
                    )}

                    {!values.isVopdVerified ? (
                      <Grid item xs={12}>
                        <Field
                          style={{ display: "none" }}
                          type="hidden"
                          name="vopdResponse"
                        />
                        {!noEdit && values.IdTypeId === 1 && (
                          <VopdEditRequest />
                        )}
                      </Grid>
                    ) : (
                      <Alert severity="info">VOPD Complete</Alert>
                    )}

                    {values.IdTypeId !== 1 && (
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          disabled={noEdit}
                          name="IdNumber"
                          size="small"
                          label="Passport Number"
                        />
                        {diff?.IdNumber && (
                          <DiffAlert
                            from={diff.IdNumber.from}
                            to={diff.IdNumber.to}
                          />
                        )}
                      </Grid>
                    )}

                    {values.IdTypeId !== 1 && (
                      <Grid item xs={5}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <DateOfBirthPicker
                            disabled={noEdit}
                            name="DateOfBirth"
                            label="Date of Birth"
                            size="small"
                          />

                          {
                            // Get Age
                            values.DateOfBirth && (
                              <Typography>
                                {dayjs().diff(values.DateOfBirth, "year")}
                              </Typography>
                            )
                          }
                        </Stack>
                        {diff?.DateOfBirth && (
                          <DiffAlert
                            from={diff.DateOfBirth.from}
                            to={diff.DateOfBirth.to}
                          />
                        )}
                      </Grid>
                    )}
                    {values.IdTypeId !== 1 && (
                      <Grid item xs={1}>
                        <SelectWrapper
                          disabled={noEdit}
                          size="small"
                          name="Gender"
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
                        {diff?.Gender && (
                          <DiffAlert
                            from={diff.Gender.from}
                            to={diff.Gender.to}
                          />
                        )}
                      </Grid>
                    )}

                    <Grid item xs={6}>
                      <TextfieldWrapper
                        disabled={noEdit}
                        size="small"
                        name="FirstName"
                        label="First Name"
                      />

                      {diff?.FirstName && (
                        <DiffAlert
                          from={diff.FirstName.from}
                          to={diff.FirstName.to}
                        />
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        disabled={noEdit}
                        size="small"
                        name="Surname"
                        label="Surname"
                      />
                      {diff?.Surname && (
                        <DiffAlert
                          from={diff.Surname.from}
                          to={diff.Surname.to}
                        />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              {/* section */}
              <Card sx={{ mb: 2 }} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography>Support Documents</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <UploadSupportDocuments
                        id={values?.RolePlayerId}
                        values={values?.supportDocument}
                        setFieldValue={setFieldValue}
                      />
                      <DownloadFileButton documents={values?.supportDocument} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              {/* section */}
              {values?.IsBeneficiary && (
                <Card sx={{ mb: 2 }} variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography>Contact Details</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <PreferredCommunicationSelect
                          disabled={noEdit}
                          size="small"
                          name="PreferredCommunicationTypeId"
                          label="Preferred Communication"
                        />
                        {diff?.PreferredCommunicationTypeId && (
                          <DiffAlert
                            from={diff.PreferredCommunicationTypeId.from}
                            to={diff.PreferredCommunicationTypeId.to}
                          />
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          disabled={noEdit}
                          size="small"
                          name="MobileNumber"
                          label="Mobile Number"
                        />
                        {diff?.MobileNumber && (
                          <DiffAlert
                            from={diff.MobileNumber.from}
                            to={diff.MobileNumber.to}
                          />
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          disabled={noEdit}
                          size="small"
                          name="SecondaryNumber"
                          label="Secondary Number"
                        />
                        {diff?.SecondaryNumber && (
                          <DiffAlert
                            from={diff.SecondaryNumber.from}
                            to={diff.SecondaryNumber.to}
                          />
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          disabled={noEdit}
                          size="small"
                          type="email"
                          name="EmailAddress"
                          label="Email Address"
                        />
                        {diff?.EmailAddress && (
                          <DiffAlert
                            from={diff.EmailAddress.from}
                            to={diff.EmailAddress.to}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {clientType === "Child" && (
                <Grid item xs={12}>
                  <ChildStudentDisabledSelect disableSelection={noEdit} />
                  <Stack spacing={1}>
                    {isOlder ? (
                      <>
                        {!hasSupportDocs ? (
                          <Alert severity="warning">
                            This child is older than 21 years, please provide
                            supporting documents
                          </Alert>
                        ) : null}
                      </>
                    ) : null}

                    {values?.isStudent && !hasSupportDocs && (
                      <Alert severity="warning">
                        This child is a student, please provide supporting
                        documents
                      </Alert>
                    )}
                    {values?.isDisabled && !hasSupportDocs && (
                      <Alert severity="warning">
                        if the child is disabled, please provide supporting
                        documents
                      </Alert>
                    )}
                  </Stack>
                </Grid>
              )}
              {dirty && (
                <Alert severity="warning">You have unsaved changes</Alert>
              )}
              <Stack sx={{ mt: 2 }} direction="row" spacing={5}>
                <Button
                  disabled={noEdit ? true : !dirty}
                  type="submit"
                  size="large"
                  fullWidth
                  variant="contained"
                >
                  Save
                </Button>
              </Stack>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default OtherMembers;

let childValidation = Yup.object({
  IdTypeId: Yup.string().required("Required"),
  FirstName: Yup.string().required("Required"),
  Surname: Yup.string().required("Required"),
  MobileNumber: Yup.string()
    .nullable()
    .matches(
      /^0[6-8][0-9]{8}$/,
      "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
    ),
  IdNumber: Yup.string().when("IdTypeId", {
    is: `1`,
    then: Yup.string()
      .required("Required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid",
      ),
    otherwise: Yup.string().required("Required"),
  }),
  DateOfBirth: Yup.date().when("IdTypeId", {
    is: (IdTypeId) => IdTypeId !== "1",
    then: Yup.date().required("Required"),
  }),
  PreferredCommunicationTypeId: Yup.string().nullable(),
  MobileNumber: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => String(val) === "2" || String(val) === "3",
    then: Yup.string()
      .required("Mobile Number is required")
      .matches(
        /^0[6-8][0-9]{8}$/,
        "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
      ),
  }),
  EmailAddress: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => String(val) === "1",
    then: Yup.string()
      .email("Must be a valid email")
      .required("Email Address is required"),
  }),
});

const OtherUserValidation = Yup.object({
  IdTypeId: Yup.string().required("Required"),
  FirstName: Yup.string().required("Required"),
  Surname: Yup.string().required("Required"),
  MobileNumber: Yup.string()
    .nullable()
    .matches(
      /^0[6-8][0-9]{8}$/,
      "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
    ),
  IdNumber: Yup.string().when("IdTypeId", {
    is: `1`,
    then: Yup.string()
      .required("Required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid",
      ),
    otherwise: Yup.string().required("Required"),
  }),
  DateOfBirth: Yup.date().when("IdTypeId", {
    is: (IdTypeId) => IdTypeId !== "1",
    then: Yup.date().required("Required"),
  }),
  PreferredCommunicationTypeId: Yup.string().nullable(),
  MobileNumber: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => String(val) === "2" || String(val) === "3",
    then: Yup.string()
      .required("Mobile Number is required")
      .matches(
        /^0[6-8][0-9]{8}$/,
        "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
      ),
  }),
  EmailAddress: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => String(val) === "1",
    then: Yup.string()
      .email("Must be a valid email")
      .required("Email Address is required"),
  }),
});

const BeneficiaryMemberValidation = Yup.object({
  IdTypeId: Yup.string().required("Required"),
  FirstName: Yup.string().required("Required"),
  Surname: Yup.string().required("Required"),
  IdNumber: Yup.string().when("IdTypeId", {
    is: `1`,
    then: Yup.string()
      .required("Required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid",
      )
      .test(
        "is-18-or-older",
        "Beneficiary cannot be less than 18 years old",
        (value) => {
          if (!value) return false; // Required check
          if (value.length !== 13) return false; // Check if the id number is 13 digits

          const eighteenYearsAgo = new Date();
          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

          // Extract the first 6 digits of the ID number (YYMMDD)
          const dob = value.substring(0, 6);
          let year = parseInt(dob.substring(0, 2), 10);
          const month = parseInt(dob.substring(2, 4), 10) - 1; // Months are 0-based in JS Dates
          const day = parseInt(dob.substring(4, 6), 10);

          // Determine full year (1900s vs 2000s)
          year = year >= 50 ? 1900 + year : 2000 + year;

          const dobDate = new Date(year, month, day);

          return dobDate <= eighteenYearsAgo;
        },
      ),
    otherwise: Yup.string().required("Required"),
  }),

  DateOfBirth: Yup.date().when("IdTypeId", {
    is: (IdTypeId) => IdTypeId !== "1",
    then: Yup.date()
      .required("Required")
      .test(
        "is-18-or-older",
        "Beneficiary cannot be less than 18 years old",
        (value) => {
          if (!value) return false; // Required check
          const eighteenYearsAgo = new Date();
          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
          return value <= eighteenYearsAgo;
        },
      ),
  }),
  PreferredCommunicationTypeId: Yup.string().nullable(),
  MobileNumber: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => String(val) === "2" || String(val) === "3",
    then: Yup.string()
      .required("Mobile Number is required")
      .matches(
        /^0[6-8][0-9]{8}$/,
        "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
      ),
  }),
  EmailAddress: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => String(val) === "1",
    then: Yup.string()
      .email("Must be a valid email")
      .required("Email Address is required"),
  }),
});
