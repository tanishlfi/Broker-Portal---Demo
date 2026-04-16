import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import WaitingPeriodInfo from "components/FormComponents.jsx/NotificationWaitingPeriod";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DiffAlert from "components/FormComponents.jsx/DiffAlert";
import MemberNotes from "components/FormComponents.jsx/MemberNotes";
import ExceptionsHandler from "./ExceptionsHandler";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SupportDocuments from "./SupportDocuments";
import DownloadFileButton from "components/Bits/DownloadFileButton";
import "dayjs/locale/en-gb";
import GetBenefits from "../../pages/Onboarding/_components/getBenefits";
import AlertPopup from "components/Bits/AlertPopup";
import {
  Alert,
  Button,
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
  CardContent,
  Box,
} from "@mui/material";

const MainMemberForm = ({
  data,
  setMembers,
  isEdit,
  diff,
  needsConfirmation,
  disabledFields,
  policyInceptionDate,
  waitingPeriod,
  coverAmount,
  productOptionId,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [newDocument, setNewDocument] = React.useState({});
  const {
    benefits,
    isLoadingGetBenefits,

    isSuccessGetBenefits,
  } = GetBenefits(productOptionId, 1, coverAmount, data?.dateOfBirth);

  return (
    <Card
      sx={{
        py: 2,
        px: 1,
        borderColor: "primary.main",
        borderStyle: "solid",
        borderWidth: 1,
      }}
      variant="outlined"
    >
      <Formik
        initialValues={{
          ...data,
          id: data ? data?.id : uuidv4(),
          client_type: "Main Member",
          confirmed: data?.confirmed || false,
          firstName: data?.firstName || "",
          surname: data?.surname || "",
          idNumber: data?.idNumber || "",
          vopdResponse: data?.vopdResponse || "",
          exceptions: data?.exceptions || [],
          dateOfBirth: data?.dateOfBirth || "",
          idTypeId: data?.idTypeId || 1,
          isVopdVerified: data?.isVopdVerified || false,
          dateVopdVerified: data?.dateVopdVerified || "",
          cellNumber: data?.cellNumber || "",
          emailAddress: data?.emailAddress || "",
          preferredCommunicationTypeId:
            data?.preferredCommunicationTypeId || "3",
          tellNumber: data?.tellNumber || "",
          gender: data?.gender || "",
          addressLine1: data?.addressLine1 || "",
          addressLine2: data?.addressLine2 || "",
          city: data?.city || "",
          province: data?.province || "",
          postalCode: data?.postalCode || "",
          notes: data?.notes || [],
          supportDocument: data?.supportDocument || [],
          memberTypeId: 1,
          isBeneficiary: true,
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
              (x) => x.id === values.statedBenefitId,
            );
            newValues.statedBenefit = selectedBenefit?.name;
            // setUpdatedMainMember(selectedBenefit);
          }

          isEdit
            ? setMembers((prev) => {
                const index = prev.findIndex((x) => x.id === newValues.id);
                prev[index] = newValues;
                // console.log("prev", prev);

                return [...prev];
              })
            : setMembers((prev) => [...prev, newValues]);

          setIsSubmitted(true);
        }}
      >
        {({ values, dirty, setFieldValue, errors }) => {
          return (
            <Form>
              <ExceptionsHandler data={values} setFieldValue={setFieldValue} />

              <AlertPopup
                open={isSubmitted}
                title="Main Member Form Submitted"
                message={
                  isEdit
                    ? "Main Member details have been updated successfully."
                    : "Main Member has been added successfully."
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
                  {isEdit ? "Edit Main Member" : "Add Main Member"}
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
                                size="small"
                                disabled={disabledFields?.idNumber}
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
                                size="small"
                                disabled={disabledFields?.idNumber}
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
                          disabled={disabledFields?.firstName}
                          name="firstName"
                          label="First Name"
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
                          size="small"
                          disabled={disabledFields?.surname}
                          name="surname"
                          label="Surname"
                        />
                        {diff?.surname && (
                          <DiffAlert
                            from={diff.surname.from}
                            to={diff.surname.to}
                          />
                        )}
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
                        <Typography> Benefit Details</Typography>
                      </Stack>
                    </Grid>
                    {isLoadingGetBenefits && <LinearProgress />}
                    {isSuccessGetBenefits && benefits && (
                      <Grid sx={{ p: 2 }} container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="select-statedbenefit">
                              Benefit
                            </InputLabel>
                            <Select
                              labelId="select-statedbenefit"
                              id="select_id"
                              value={values.statedBenefitId}
                              size="small"
                              label="Benefit"
                              onChange={(event) => {
                                setFieldValue(
                                  "statedBenefitId",
                                  event.target.value,
                                );
                                const selectedBenefit = benefits.find(
                                  (x) => x.id === event.target.value,
                                );
                                setFieldValue(
                                  "statedBenefit",
                                  selectedBenefit?.name,
                                );
                              }}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {benefits &&
                                benefits?.map((item, index) => {
                                  return (
                                    <MenuItem key={index} value={item.id}>
                                      {item.name}
                                    </MenuItem>
                                  );
                                })}
                            </Select>
                          </FormControl>
                        </Grid>

                        {data?.benefitName && (
                          <Grid sx={{ pt: 2 }} item xs={6}>
                            <TextfieldWrapper
                              size="small"
                              disabled={true}
                              name="benefitName"
                              label="Benefit on file"
                            />
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Grid>
                  <Field type="hidden" name="statedBenefit" />
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
                  <Card sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Address Details</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="addressLine1"
                          label="Address Line 1"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="addressLine2"
                          label="Address Line 2"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="city"
                          label="City"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <SelectWrapper
                          name="province"
                          size="small"
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
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="postalCode"
                          label="Postal Code"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </CardContent>
              </Card>

              <Accordion
                sx={{
                  border: "divider",
                  backgroundColor: "background.default",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon color="primary" fontSize="large" />
                  }
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      width: "100%",
                    }}
                  >
                    <ExpandMoreIcon
                      color="primary"
                      fontSize="large"
                      sx={{
                        transition: "transform 0.3s ease",
                        ".Mui-expanded &": {
                          transform: "rotate(180deg)",
                        },
                      }}
                    />
                    <Typography>
                      Capture Previous Insurer Details (Expand){" "}
                    </Typography>
                    <Box></Box> {/* Empty box to fill space */}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container sx={{ pt: 2 }} spacing={2}>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="PreviousInsurer"
                        label="Previous Insurer"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="PreviousInsurerPolicyNumber"
                        label="Previous Insurer Policy Number"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        name="PreviousInsurerCoverAmount"
                        label="Previous Insurer Cover Amount"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <LocalizationProvider
                          dateAdapter={AdapterDayjs}
                          adapterLocale="en-gb"
                        >
                          <DatePicker
                            views={["year", "month", "day"]}
                            openTo="day"
                            size="small"
                            label="Previous Insurer Join Date"
                            name="PreviousInsurerJoinDate"
                            value={values.PreviousInsurerJoinDate}
                            onChange={(newValue) => {
                              // Format date without UTC
                              const localDate = dayjs(newValue)
                                .add(2, "hour")
                                .format("YYYY-MM-DD");
                              setFieldValue(
                                "PreviousInsurerJoinDate",
                                localDate,
                              );
                            }}
                            variant="inline"
                            inputVariant="outlined"
                            fullWidth
                            renderInput={(params) => (
                              <TextField fullWidth size="small" {...params} />
                            )}
                          />
                        </LocalizationProvider>

                        <LocalizationProvider
                          dateAdapter={AdapterDayjs}
                          adapterLocale="en-gb"
                        >
                          <DatePicker
                            views={["year", "month", "day"]}
                            openTo="day"
                            label="Previous Insurer Cancellation Date"
                            name="PreviousInsurerCancellationDate"
                            value={
                              values.PreviousInsurerCancellationDate === ""
                                ? null
                                : values.PreviousInsurerCancellationDate
                            }
                            onChange={(newValue) => {
                              const localDate = dayjs(newValue)
                                .add(2, "hour")
                                .format("YYYY-MM-DD");
                              setFieldValue(
                                "PreviousInsurerCancellationDate",
                                localDate,
                              );
                            }}
                            variant="inline"
                            inputVariant="outlined"
                            fullWidth
                            renderInput={(params) => (
                              <TextField fullWidth size="small" {...params} />
                            )}
                          />
                        </LocalizationProvider>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <WaitingPeriodInfo
                        PreviousInsurerJoinDate={values.PreviousInsurerJoinDate}
                        PreviousInsurerCancellationDate={
                          values.PreviousInsurerCancellationDate
                        }
                        waitingPeriod={waitingPeriod}
                        policyInceptionDate={policyInceptionDate}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Card sx={{ p: 3, mt: 1 }} variant="outlined">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography> Member Notes</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <MemberNotes name="notes" />
                  </Grid>
                </Grid>
              </Card>

              <Stack direction="row" justifyContent="space-between">
                <Button
                  disabled={dirty ? false : true}
                  type="submit"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                  variant="contained"
                >
                  Save
                </Button>
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
    </Card>
  );
};

export default MainMemberForm;

const validation = Yup.object({
  idTypeId: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  surname: Yup.string().required("Required"),
  idNumber: Yup.string().when("idTypeId", {
    is: "1",
    then: Yup.string()
      .required("Id Number is required")
      // .test("SAIDValidator", "Invalid South African ID number", (value) => {
      //   console.log(value);
      //   return SAIDValidator(value);
      // }),
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
    .matches(
      /^0[6-8][0-9]{8}$/,
      "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
    )
    // only validate if preferredCommunicationType is SMS (3)
    .when("preferredCommunicationTypeId", {
      is: (val) => String(val) === "2" || String(val) === "3",
      then: (schema) => schema.required("Phone number is required"),
    }),

  // only validate tellNumber if number is entered
  tellNumber: Yup.string()
    .nullable()
    .matches(/^[0-9]*$/, "Telephone number must be only numbers")
    .matches(/^[0-9]{10}$/, "Telephone number must be 10 digits long"),

  emailAddress: Yup.string()
    .nullable()
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format",
    )
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

  addressLine1: Yup.string().required("Address Line 1 is required"),

  // city: Yup.string().required("A city is required"),
  // province: Yup.string().required("A province is required"),

  postalCode: Yup.string()
    .nullable()
    .matches(
      /^[0-9]{4}$/,
      "Postal Code must be 4 digits long and only numbers",
    ),
});
