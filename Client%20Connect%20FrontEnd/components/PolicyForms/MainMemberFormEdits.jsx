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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DiffAlert from "components/FormComponents.jsx/DiffAlert";
import MemberNotes from "components/FormComponents.jsx/MemberNotes";
import ExceptionsHandler from "./ExceptionsHandler";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SupportDocuments from "./SupportDocuments";
import DownloadFileButton from "components/Bits/DownloadFileButton";
import customGridSeperator from "components/customStyles/gridSeperator";

const MainMemberFormEdits = ({
  data,
  setMembers,
  isEdit,
  handleClose = () => {},
  diff,
  needsConfirmation,
  disabledFields,
  benefits,
  coverAmount,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSaveButton = () => {
    setIsSubmitted(true);
  };

  // filter benefits based on coverMemberTypeId and coverAmount
  const filteredBenefits = benefits?.filter(
    (benefit) =>
      benefit.coverMemberTypeId === data.PolicyMember.memberTypeId &&
      benefit.benefitAmount === coverAmount,
  );

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
            data?.preferredCommunicationTypeId || "3",
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
            memberTypeId: data?.PolicyMember.memberTypeId,
            isBeneficiary: true,
            status: isEdit ? "isEdited" : "New",
            statedBenefitId: data?.PolicyMember.statedBenefitId || "",
            statedBenefit: data?.PolicyMember.statedBenefit || "",
            ...data?.PolicyMember,
          },
          ...data,
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

          // if previous insurer join date is set and previous insurer cancellation date is set calculate the difference
          // if (
          //   newValues.PolicyMember.PreviousInsurerJoinDate &&
          //   newValues.PolicyMember.PreviousInsurerCancellationDate
          // ) {
          //   const joinDate = dayjs(
          //     newValues.PolicyMember.PreviousInsurerJoinDate,
          //     "DD-MM-YYYY",
          //   );
          //   const cancelDate = dayjs(
          //     newValues.PolicyMember.PreviousInsurerCancellationDate,
          //     "DD-MM-YYYY",
          //   );

          //   newValues.PolicyMember.PreviousInsurerMonths = cancelDate.diff(
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
            : setMembers((prev) => {
                return [...prev, newValues];
              });
          handleClose();
        }}
      >
        {({ values, dirty, setFieldValue, errors }) => {
          return (
            <Form>
              <Typography variant="body1" align="center">
                {isEdit ? "Edit Main Member" : "Add Main Member"}
              </Typography>

              {/* Conditionally show errors when the form is submitted */}
              {isSubmitted && Object.keys(errors).length > 0 && (
                <Alert severity="error">
                  {Object.keys(errors).map((item, index) => (
                    <Stack key={index}>
                      <Typography variant="body2">{errors[item]}</Typography>
                    </Stack>
                  ))}
                </Alert>
              )}

              <ExceptionsHandler data={values} setFieldValue={setFieldValue} />

              <Button
                disabled={dirty ? false : true}
                type="submit"
                size="large"
                onClick={handleSaveButton}
                sx={{ mt: 2 }}
                variant="contained"
              >
                Save
              </Button>
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

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextfieldWrapper
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
                    disabled={disabledFields?.surname}
                    name="surname"
                    label="Surname"
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
                {!filteredBenefits ? (
                  <LinearProgress />
                ) : (
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="select-statedbenefit">Benefit</InputLabel>
                      <Select
                        labelId="select-statedbenefit"
                        id="select_id"
                        value={values.PolicyMember.statedBenefitId}
                        label="Benefit"
                        onChange={(event) => {
                          setFieldValue(
                            "PolicyMember.statedBenefitId",
                            event.target.value,
                          );
                          const selectedBenefit = filteredBenefits.find(
                            (x) => x.benefitId === event.target.value,
                          );
                          // console.log("selectedBenefit", selectedBenefit);
                          setFieldValue(
                            "PolicyMember.statedBenefit",
                            selectedBenefit?.benefit,
                          );
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {filteredBenefits &&
                          filteredBenefits?.map((item, index) => {
                            return (
                              <MenuItem key={index} value={item.benefitId}>
                                {item.benefit}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
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

              {
                // hidden field for stated benefit
              }
              <Field type="hidden" name="PolicyMember.statedBenefit" />

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
                    type="number"
                    name="cellNumber"
                    label="Mobile Phone Number"
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
                  <TextfieldWrapper name="emailAddress" label="Email Address" />
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
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="addressLine2"
                    label="Address Line 2"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="city" label="City" />
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
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="postalCode"
                    label="Postal Code"
                    type="number"
                  />
                </Grid>
              </Grid>

              <Grid sx={customGridSeperator}>
                <Typography variant="h6" align="left" sx={{ mb: 3 }}>
                  Member Notes
                </Typography>
                <MemberNotes name="notes" />
              </Grid>

              <Stack direction="row" justifyContent="space-between">
                <Button
                  disabled={dirty ? false : true}
                  type="submit"
                  size="large"
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
    </>
  );
};

export default MainMemberFormEdits;

const validation = Yup.object({
  firstName: Yup.string().required("Required"),
  surname: Yup.string().required("Required"),

  preferredCommunicationTypeId: Yup.string().required(
    "Preferred Communication is required",
  ),

  cellNumber: Yup.string()
    .nullable()
    .matches(
      /^0[6-8][0-9]{8}$/,
      "Mobile phone number must be 10 digits long and start with 06, 07 or 08",
    )
    .when("preferredCommunicationTypeId", {
      is: "3",
      then: Yup.string().required("Phone number is required"),
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

  postalCode: Yup.string()
    .nullable()
    .matches(
      /^[0-9]{4}$/,
      "Postal Code must be 4 digits long and only numbers",
    ),
});
