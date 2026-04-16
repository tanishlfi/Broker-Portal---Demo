import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import SelectWrapper from "../../../../components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "../../../../components/FormComponents.jsx/TextFieldWrapper";
import VopdEditRequest from "./VopdEditRequest";
import SwitchWrapper from "../../../../components/FormComponents.jsx/SwitchWrapper";
import PreferredCommunicationSelect from "../../../../components/FormComponents.jsx/PreferredCommunicationSelect";
import dayjs from "dayjs";
import SupportDocuments from "../../../../components/PolicyForms/SupportDocuments";
import DownloadFileButton from "../../../../components/Bits/DownloadFileButton";
import DateOfBirthPicker from "./DateOfBirthPicker";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import * as Yup from "yup";
import axios from "axios";
import { rmaAPI } from "src/AxiosParams";
import CircularProgress from "@mui/material/CircularProgress";

// Inside the component, before the return statement
const checkRolePlayer = async (idNumber) => {
  try {
    const response = await axios.get(
      `${rmaAPI}/clc/api/RolePlayer/RolePlayer/GetRolePlayerByIdNumber/${idNumber}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching role player:", error);
    return null;
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddClientDialog({
  data,
  setPolicyMembers,
  action,
  PolicyData,
  differences: diff,
  clientType,
  color,
}) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const today = dayjs();
  const isBeforeCutoff = today.date() < 16;
  const minDate = isBeforeCutoff
    ? today.startOf("month")
    : today.add(1, "month").startOf("month");

  // Maximum date is 3 months from minimum date
  const maxDate = minDate.add(2, "month").startOf("month");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // if spouse set disabled

  const validMembers =
    data?.filter((member) => member.insuredLifeStatus !== 2) || [];

  const spouseCount = validMembers.filter(
    (member) => member.MemberTypeId === 2,
  ).length;
  const childCount = validMembers.filter(
    (member) => member.MemberTypeId === 3,
  ).length;

  const extendedCount = validMembers.filter(
    (member) => member.MemberTypeId === 4,
  ).length;

  return (
    <React.Fragment>
      <Button
        color={color || "info"}
        variant="outlined"
        disabled={
          (clientType === "Spouse" && spouseCount >= 1) ||
          (clientType === "Child" && childCount >= 6)
            ? true
            : false
        }
        onClick={handleClickOpen}
      >
        Add {clientType}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="md"
        fullWidth
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> Add {clientType}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              // or random number
              insuredLifeStatus: data?.insuredLifeStatus || 1,

              RolePlayerId: data?.RolePlayerId || "0",
              // generate Random number 20 digits
              IdTypeId: data?.IdTypeId || 1,
              insuredLifeStatusName: data?.insuredLifeStatusName || "New",
              IdNumber: data?.IdNumber || "",
              IsVopdVerified: data?.IsVopdVerified || "",
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

              FirstName: data?.FirstName || "",
              Surname: data?.Surname || "",
              DateOfBirth: data?.DateOfBirth
                ? dayjs(data?.DateOfBirth)
                : dayjs(),
              DateOfDeath: data?.DateOfDeath,
              MaritalStatus: data?.MaritalStatus || "",
              MemberAction: data?.MemberAction || action,
              PreferredCommunicationTypeId:
                data?.PreferredCommunicationTypeId || "",
              MobileNumber: data?.MobileNumber || "",
              SecondaryNumber: data?.SecondaryNumber || "",
              BenefitId: 0,
              BenefitCode: null,
              Gender: data?.Gender || "",
              PolicyInceptionDate: data?.PolicyInceptionDate || minDate,
              // PreviousInsurer Details
              // PreviousInsurer: data?.PreviousInsurer || "",
              // PreviousInsurerPolicyNumber: data?.PreviousInsurerPolicyNumber || "",
              // PreviousInsurerCoverAmount: data?.PreviousInsurerCoverAmount || 0.0,
              // PreviousInsurerJoinDate: data?.PreviousInsurerJoinDate || "",
              // PreviousInsurerCancellationDate:
              //   data?.PreviousInsurerCancellationDate || "",
              // PreviousInsurer Details
              Premium: 0.0,
              supportDocument: data?.supportDocument || [],

              EmailAddress: data?.EmailAddress ? data?.EmailAddress : "",
              IsBeneficiary: data?.IsBeneficiary || false,
            }}
            // enableReinitialize={true}
            validationSchema={
              clientType === "Beneficiary"
                ? BeneficiaryMemberValidation
                : OtherUserValidation
            }
            onSubmit={async (values, { resetForm }) => {
              setIsSubmitting(true);
              try {
                let formValues = {
                  ...values,
                  CoverAmount: PolicyData?.coverAmount,
                };

                if (formValues.IdTypeId === 1) {
                  const rolePlayerData = await checkRolePlayer(
                    formValues.IdNumber,
                  );

                  if (rolePlayerData.length > 0) {
                    formValues.RolePlayerId = rolePlayerData[0].rolePlayerId;
                  }
                }

                // if formValues.RolePlayerId is net set then 0
                if (!formValues.RolePlayerId) {
                  formValues.RolePlayerId = 0;
                }

                formValues.PolicyInceptionDate = dayjs(
                  formValues.PolicyInceptionDate,
                )
                  .startOf("month")
                  .format("YYYY-MM-DDTHH:mm:ss");

                // uppercase firstname and surname
                formValues.FirstName = formValues.FirstName.toUpperCase();
                formValues.Surname = formValues.Surname.toUpperCase();

                setPolicyMembers((prev) => {
                  // get the max member id and increment by 1
                  let maxId = 0;
                  prev.map((member) => {
                    if (member.id > maxId) {
                      maxId = member.id;
                    }
                  });

                  formValues.id = maxId + 1;
                  return [...prev, formValues];
                });
                // clear the form values field on submit
                resetForm();
                handleClose();
              } catch (error) {
                console.error("Error during submission:", error);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, errors }) => {
              let isOlder = dayjs().diff(values.DateOfBirth, "year") > 21;
              let hasSupportDocs = values?.supportDocument && values.supportDocument.length > 0;
              // console.log("errors", errors);

              return (
                <Form>
                  <Card sx={{ mb: 2 }} variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            locale="en"
                          >
                            <FormControl>
                              <DatePicker
                                size="small"
                                views={["year", "month"]}
                                openTo="month"
                                label="Policy Inception Date"
                                maxDate={maxDate}
                                minDate={minDate}
                                value={values.PolicyInceptionDate}
                                disableMaskedInput
                                onChange={(newValue) => {
                                  let date = dayjs(newValue);

                                  date = date.startOf("month");
                                  setFieldValue(
                                    "PolicyInceptionDate",
                                    date.format("YYYY-MM-DDTHH:mm:ss"),
                                  );
                                }}
                                inputFormat="MMMM YYYY" // Long date format for display
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    fullWidth
                                    variant="outlined"
                                  />
                                )}
                              />
                              {errors?.PolicyInceptionDate ? (
                                <Alert severity="error">
                                  {errors?.PolicyInceptionDate}
                                  {values.PolicyInceptionDate &&
                                    dayjs(values.PolicyInceptionDate).format(
                                      "dddd, DD MMMM YYYY",
                                    )}
                                </Alert>
                              ) : null}
                            </FormControl>
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                          <Stack
                            sx={{ mt: 2 }}
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography>Personal Details</Typography>
                            <SwitchWrapper
                              size="small"
                              value={values.IsBeneficiary ? true : false}
                              name="IsBeneficiary"
                              label="Beneficiary"
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={6}>
                          <SelectWrapper
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
                        </Grid>

                        {values.IdTypeId === 1 && (
                          <>
                            <Grid item xs={6}>
                              <TextfieldWrapper
                                size="small"
                                // type="number"
                                name="IdNumber"
                                label="ID Number"
                              />
                            </Grid>
                          </>
                        )}

                        {!values.IsVopdVerified ? (
                          <Grid item xs={12}>
                            <Field
                              style={{ display: "none" }}
                              type="hidden"
                              name="vopdResponse"
                            />
                            {values.IdTypeId === 1 && <VopdEditRequest />}
                          </Grid>
                        ) : (
                          <Alert severity="info">VOPD Complete</Alert>
                        )}

                        {values.IdTypeId !== 1 && (
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="IdNumber"
                              size="small"
                              label="Passport Number"
                            />
                          </Grid>
                        )}

                        {values.IdTypeId !== 1 && (
                          <Grid item xs={4}>
                            <DateOfBirthPicker
                              name="DateOfBirth"
                              label="Date of Birth"
                              size="small"
                            />
                          </Grid>
                        )}
                        {values.IdTypeId !== 1 && (
                          <Grid item xs={2}>
                            <SelectWrapper
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
                          </Grid>
                        )}

                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="FirstName"
                            label="First Name"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="Surname"
                            label="Surname"
                          />
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
                          <SupportDocuments />
                          <DownloadFileButton
                            documents={values?.supportDocument}
                          />
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
                              size="small"
                              name="PreferredCommunicationTypeId"
                              label="Preferred Communication"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              size="small"
                              name="MobileNumber"
                              label="Mobile Number"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              size="small"
                              name="SecondaryNumber"
                              label="Secondary Number"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              size="small"
                              type="email"
                              name="EmailAddress"
                              label="Email Address"
                            />
                          </Grid>
                          {clientType === "Child" && (
                            <Grid item xs={12}>
                              {isOlder ? (
                                <>
                                  is older than 21
                                  {!hasSupportDocs ? (
                                    <Alert severity="info">
                                      This child is older than 21 years, please
                                      provide supporting documents
                                    </Alert>
                                  ) : null}
                                </>
                              ) : null}
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* <Card variant="outlined">
                <CardContent>
                  <PreviousInsurer />
                </CardContent>
              </Card> */}

                  <DialogActions>
                    <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
                      <Button onClick={handleClose}>Close</Button>
                      <Button
                        type="submit"
                        size="large"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : null
                        }
                      >
                        {isSubmitting ? "Saving..." : "Save"}
                      </Button>
                    </Stack>
                  </DialogActions>
                </Form>
              );
            }}
          </Formik>

          {/* <OtherMembers
            newClient={true}
            data={data}
            setPolicyMembers={setPolicyMembers}
            action={1}
            differences={diff}
            MemberTypeId={
              clientType === "Spouse"
                ? 2
                : clientType === "Child"
                ? 3
                : clientType === "Extended"
                ? 4
                : clientType === "Beneficiary"
                ? 5
                : 0
            }
          /> */}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

const BeneficiaryMemberValidation = Yup.object({
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
    is: (val) => val === "2" || val === "3" || val === 2 || val === 3,
    then: Yup.string()
      .matches(
        /^0[6-8][0-9]{8}$/,
        "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
      )
      .required("Mobile number is required"),
  }),
  EmailAddress: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => val === "1" || val === 1,
    then: Yup.string()
      .email("Invalid email address")
      .required("Email address is required"),
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
    is: (IdTypeId) => IdTypeId !== 1,
    then: Yup.date().required("Required"),
  }),
  PolicyInceptionDate: Yup.date()
    .required("Required")
    .test(
      "is-valid-date",
      "Policy inception date cannot be more than 1 month in the past",
      (value) => {
        if (!value) return false; // Required check
        const oneMonthAgo = new Date(
          new Date().setMonth(new Date().getMonth() - 1),
        );
        return value >= oneMonthAgo; // Allow dates today or in the future, but not more than 1 month in the past
      },
    ),
  PreferredCommunicationTypeId: Yup.string().nullable(),
  MobileNumber: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => val === "2" || val === "3" || val === 2 || val === 3,
    then: Yup.string()
      .matches(
        /^0[6-8][0-9]{8}$/,
        "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
      )
      .required("Mobile number is required"),
  }),
  EmailAddress: Yup.string().when("PreferredCommunicationTypeId", {
    is: (val) => val === "1" || val === 1,
    then: Yup.string()
      .email("Invalid email address")
      .required("Email address is required"),
  }),
});
