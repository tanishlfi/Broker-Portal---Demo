import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik, Form } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import { Grid } from "@mui/material";
import useIdTypes from "hooks/LookUps/useIdTypes";
import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

export default function UpdateChildDialog({
  edit,

  data,
}) {
  const [open, setOpen] = React.useState(false);

  const idTypes = useIdTypes();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        {edit ? "Edit Child" : "Add Child"}
      </Button>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle>{edit ? "Edit Child" : "Add Child"}</DialogTitle>

        <DialogContent>
          <Formik
            initialValues={{
              client_type: "child",
              id: data ? data?.id : uuidv4(),
              firstName: data?.firstName || "",
              surname: data?.surname || "",
              idNumber: data?.idNumber || "",
              dateOfBirth: data?.dateOfBirth || "",
              idTypeId: data?.idTypeId || "",
              isVopdVerified: data?.isVopdVerified || false,
              dateVopdVerified: data?.dateVopdVerified || "",
              cellNumber: data?.cellNumber || "",
              emailAddress: data?.emailAddress || "",
              preferredCommunicationTypeId:
                data?.preferredCommunicationTypeId || "",
              tellNumber: data?.tellNumber || "",
              gender: data?.gender || "",
              PolicyMember: {
                memberTypeId: 3,
              },

              // rolePlayerAddresses: [],
            }}
            enableReinitialize={true}
            validationSchema={Yup.object({
              idType: Yup.string().required("Required"),
              firstName: Yup.string().required("Required"),
              surname: Yup.string().required("Required"),
              idNumber: Yup.string().when("idType", {
                is: `1`,
                then: Yup.string()
                  .required("Required")
                  .matches(
                    /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
                    "SA Id Number seems to be invalid"
                  ),
              }),
              preferredCommunicationTypeId: Yup.string().nullable(),
              cellNumber: Yup.string()
                .nullable()
                .matches(/^0[6-8][0-9]{8}$/, "Mobile phone number must be 10 digits long and start with 06, 07 or 08")
                .when("preferredCommunicationTypeId", {
                  is: (val) => String(val) === "2" || String(val) === "3",
                  then: Yup.string().required("Mobile phone number is required"),
                }),

              emailAddress: Yup.string()
                .nullable()
                .email("Invalid email format")
                .when("preferredCommunicationTypeId", {
                  is: (val) => String(val) === "1",
                  then: Yup.string().required("Email address is required"),
                }),
              tellNumber: Yup.string()
                .nullable()
                .matches(/^[0-9]*$/, "Telephone number must be only numbers")
                .matches(
                  /^0[1-9][0-9]{8}$/,
                  "Please enter a valid 10-digit mobile number starting with 0.",
                ),

              // Only allow ages between 0 and 21 with dayJs

              dateOfBirth: Yup.date()
                .required("Required")
                .max(
                  dayjs().subtract(0, "years").format("YYYY-MM-DD"),
                  "Child must be under 21 years old"
                )
                .min(
                  dayjs().subtract(21, "years").format("YYYY-MM-DD"),
                  "Child must be under 21 years old"
                ),
            })}
            onSubmit={(values) => {
              console.log(values);

              handleClose();
            }}>
            {({ values, dirty }) => {
              return (
                <Form>
                  <Grid sx={{ mt: 2 }} container>
                    <Grid container spacing={2}>
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
                      </Grid>

                      <>
                        {values.idType === 1 ? (
                          <>
                            <Grid item xs={6}>
                              <TextfieldWrapper
                                type="number"
                                name="idNumber"
                                label="ID Number"
                              />
                            </Grid>
                            <Grid item xs={2}>
                              {!values.isVopdVerified && <VopdRequest />}
                            </Grid>

                            <Grid item xs={4}>
                              <DOBPicker
                                name="dateOfBirth"
                                label="Date of Birth"
                                minDate={dayjs().subtract(21, "years")}
                                maxDate={dayjs().subtract(0, "years")}
                              />
                            </Grid>
                          </>
                        ) : (
                          <>
                            {" "}
                            <Grid item xs={6}>
                              <TextfieldWrapper
                                type="number"
                                name="idNumber"
                                label="PassPort Number"
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <DOBPicker
                                name="dateOfBirth"
                                label="Date of Birth"
                              />
                            </Grid>
                          </>
                        )}
                      </>

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
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                    <Grid item xs={2}>
                      <TextfieldWrapper
                        inputProps={{
                          style: { textTransform: "uppercase" },
                        }}
                        name="title"
                        label={"Title"}
                      />
                    </Grid>

                    <Grid item xs={5}>
                      <TextfieldWrapper name="firstName" label="First Name" />
                    </Grid>
                    <Grid item xs={5}>
                      <TextfieldWrapper name="surname" label="Last Name" />
                    </Grid>
                  </Grid>

                  <Grid container sx={{ pt: 2 }} spacing={2}>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        type="number"
                        name="cellNumber"
                        label="Mobile Number"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        type="number"
                        name="tellNumber"
                        label="Telephone Number"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextfieldWrapper
                        type="email"
                        name="emailAddress"
                        label="Email Address"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <PreferredCommunicationSelect
                        name="preferredCommunicationTypeId"
                        label="preferred_communication"
                      />
                    </Grid>
                  </Grid>

                  <DialogActions>
                    <Button
                      disabled={!dirty}
                      type="submit"
                      size="large"
                      sx={{ mt: 2 }}
                      variant="contained">
                      Save
                    </Button>
                  </DialogActions>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
}
