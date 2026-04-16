import {
  Button,
  Grid,
  Stack,
  Alert,
  Card,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CardContent,
  Box,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import WaitingPeriodInfo from "components/FormComponents.jsx/NotificationWaitingPeriod";
import customGridSeperator from "components/customStyles/gridSeperator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChildStudentDisabledSelect from "components/FormComponents.jsx/ChildStudentDisabledSelect";
import AlertPopup from "components/Bits/AlertPopup";

const MemberForm = ({
  memberType,
  data,
  edit,
  setMembers,
  diff,
  policyInceptionDate,
  waitingPeriod,
  benefits,
  setOpen,
  isBeneficiary = false,
}) => {
  const [newDocument, setNewDocument] = React.useState({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // console.log("edit", edit);

  // filter benefits on DependantBenefitRules where coverMemberType === Spouse
  const filteredBenefits = benefits?.DependantBenefitRules
    ? benefits.DependantBenefitRules.filter(
      (benefit) => benefit.coverMemberType === memberType
    )
    : [];

  const Color = (memberType) => {
    switch (memberType) {
      case "Main Member":
        return "primary";
      case "Spouse":
        return "secondary";
      case "Child":
        return "success";
      case "Parent":
        return "warning";
      case "Sibling":
        return "info";
      case "Grandparent":
        return "error";
      case "Extended Family":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Card
      sx={{
        py: 2,
        px: 1,
        borderColor: `${Color(memberType)}.main`,

        borderStyle: "solid",
        borderWidth: 1,
      }}
      variant="outlined"
    >
      <Formik
        initialValues={{
          ...data,
          id: data ? data?.id : uuidv4(),
          client_type: data?.client_type || memberType,
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
            data?.preferredCommunicationTypeId || "",
          tellNumber: data?.tellNumber || "",
          gender: data?.gender || "",
          notes: data?.notes || [],
          supportDocument: data?.supportDocument || [],
          memberTypeId:
            data?.memberTypeId ||
            (memberType === "Spouse"
              ? 2
              : memberType === "Child"
                ? 3
                : memberType === "Extended Family"
                  ? 4
                  : 0),
          isBeneficiary: data?.isBeneficiary || isBeneficiary ? true : false,
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
              ? dayjs(data?.PreviousInsurerJoinDate).format("YYYY-MM-DD")
              : "",
          PreviousInsurerCancellationDate:
            data?.PreviousInsurer &&
              data?.PreviousInsurerCancellationDate &&
              data?.PreviousInsurerCancellationDate !== ""
              ? dayjs(data?.PreviousInsurerCancellationDate).format(
                "YYYY-MM-DD"
              )
              : "",
          PreviousInsurer: data?.PreviousInsurer || "",
          PreviousInsurerCoverAmount: data?.PreviousInsurerCoverAmount || 0,

          // rolePlayerAddresses: [],
        }}
        enableReinitialize={edit}
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

          // set stated benefit if statedBenefitId is set
          if (filteredBenefits && values.statedBenefitId) {
            const selectedBenefit = filteredBenefits.find(
              (x) => x.id === values.statedBenefitId
            );
            newValues.statedBenefit = selectedBenefit?.benefit;
          }

          edit
            ? setMembers((prev) => {
              const index = prev.findIndex((x) => x.id === newValues.id);
              prev[index] = newValues;
              // console.log("prev", prev);

              return [...prev];
            })
            : setMembers((prev) => [...prev, newValues]);
          setIsSubmitted(true);
          // if setOpen is passed set it to false
          setOpen(false);
          // if (setOpen) {
          //   setOpen(false);
          // }
        }}
      >
        {({ values, dirty, setFieldValue }) => {
          // console.log(errors);
          return (
            <Form>
              <ExceptionsHandler data={values} setFieldValue={setFieldValue} />
              <AlertPopup
                open={isSubmitted}
                message={
                  edit
                    ? `${memberType} has been updated successfully.`
                    : `${memberType} has been added successfully.`
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
                  {memberType}
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
                      {
                        // show only if memberType is Child
                        memberType === "Child" && (
                          <Grid item xs={12}>
                            <ChildStudentDisabledSelect />
                          </Grid>
                        )
                      }
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
                            <Grid item xs={8}>
                              <TextfieldWrapper
                                size="small"
                                name="idNumber"
                                label="Passport Number"
                              />
                            </Grid>
                          </>
                        )}
                      </>

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
                      <Grid item xs={12}>
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
                              value={values.statedBenefitId}
                              label="Benefit"
                              onChange={(event) => {
                                setFieldValue(
                                  "statedBenefitId",
                                  event.target.value
                                );
                                const selectedBenefit = filteredBenefits.find(
                                  (x) => x.id === event.target.value
                                );
                                setFieldValue(
                                  "statedBenefit",
                                  selectedBenefit?.benefit
                                );
                              }}
                            >
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
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            Benefits will allocated during processing
                          </Alert>
                        )
                      }
                    </Grid>
                    {values.benefitName && (
                      <Grid sx={{ pt: 2 }} item xs={6}>
                        <TextfieldWrapper
                          disabled={true}
                          name="benefitName"
                          label="Benefit on file"
                        />
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
                      <Stack>
                        <Typography>Beneficiary</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Set client to beneficiary
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={2}>
                      <SwitchWrapper
                        value={values.isBeneficiary ? true : false}
                        name="isBeneficiary"
                        label="Beneficiary"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {values.isBeneficiary && (
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
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
                                    : diff.preferredCommunicationTypeId.from ===
                                      2
                                      ? "Phone"
                                      : diff.preferredCommunicationTypeId.from ===
                                        3
                                        ? "SMS"
                                        : diff.preferredCommunicationTypeId.from ===
                                          4
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
                      )}
                    </Grid>
                  </Grid>
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
                                localDate
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
                                localDate
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
                variant="contained"
              >
                Save
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
};

export default MemberForm;
