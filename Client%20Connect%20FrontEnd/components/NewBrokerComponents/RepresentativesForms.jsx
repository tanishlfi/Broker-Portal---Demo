import { FieldArray, Form, Formik } from "formik";
import React from "react";
import BrokerStepperButtons from "./FormComps/BrokerStepperButtons";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import AddIcon from "@mui/icons-material/Add";
const RepresentativesForms = () => {
  return (
    <Card>
      <CardHeader title={`Manage Representatives`} />
      <CardContent>
        <Formik
          initialValues={{
            Representatives: [
              {
                title: "",
                initials: "",
                idNumber: "",
                firstName: "",
                surnameOrCompanyName: "",
                email: "",
                contactNumber: "",
                address: {
                  addressLine1: "",
                  addressLine2: "",
                  suburb: "",
                  city: "",
                  postalCode: "",
                },
              },
            ],
          }}
          onSubmit={(values) => {
            console.log(values);
          }}>
          {({ values }) => {
            return (
              <Form>
                <FieldArray name="Representatives">
                  {({ insert, remove, push }) => (
                    <div>
                      {values.Representatives.length > 0 &&
                        values.Representatives.map((Representative, index) => {
                          return (
                            <Card variant="outlined" key={index}>
                              <CardHeader
                                title={`Representative ${index + 1}`}
                                subheader="Please enter the details of the representative"
                              />
                              <CardContent>
                                <Grid container spacing={2}>
                                  <Grid item xs={2}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].title`}
                                      label="Title"
                                      type="text"
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].initials`}
                                      label="Initials"
                                      type="text"
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].idNumber`}
                                      label="ID Number"
                                      type="number"
                                    />
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].firstName`}
                                      label="First Name"
                                      type="text"
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].surnameOrCompanyName`}
                                      label="Surname"
                                      type="text"
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].email`}
                                      label="Email Address"
                                      type="email"
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].contactNumber`}
                                      label="Contact Number"
                                      type="number"
                                    />
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      Address
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].address.addressLine1`}
                                      label="Address Line 1"
                                      size="small"
                                      type="text"
                                    />
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].address.addressLine2`}
                                      label="Address Line 2"
                                      size="small"
                                      type="text"
                                    />
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].address.suburb`}
                                      label="Suburb"
                                      type="text"
                                      size="small"
                                    />
                                  </Grid>

                                  <Grid item xs={6}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].address.city`}
                                      label="City"
                                      type="text"
                                      size="small"
                                    />
                                  </Grid>

                                  <Grid item xs={2}>
                                    <TextfieldWrapper
                                      name={`Representatives[${index}].address.postalCode`}
                                      label="Postal Code"
                                      size="small"
                                      type="number"
                                    />
                                  </Grid>

                                  <Grid item xs={4}>
                                    {index >= 1 && (
                                      <Button
                                        type="button"
                                        variant="contained"
                                        color="warning"
                                        onClick={() => remove(index)}>
                                        X Remove
                                      </Button>
                                    )}
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          );
                        })}
                      <Button
                        variant="contained"
                        sx={{ my: 2 }}
                        type="button"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() =>
                          push({
                            idNumber: "",
                            firstName: "",
                            surname: "",
                            email: "",
                            contactNumber: "",
                          })
                        }>
                        Add another Representative
                      </Button>
                    </div>
                  )}
                </FieldArray>

                <BrokerStepperButtons />
              </Form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default RepresentativesForms;
