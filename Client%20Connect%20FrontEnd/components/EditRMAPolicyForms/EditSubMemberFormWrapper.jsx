import React from "react";
import { Formik, Form } from "formik";
// import * as Yup from "Yup";
import { Button, Grid, Typography } from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";

const EditSubMemberFormWrapper = ({ data, idTypes }) => {
  if (idTypes.isLoading) return <div>Loading...</div>;

  const getDobFromId = (id) => {
    const year = id?.substring(0, 4);
    const month = id?.substring(4, 6);
    const day = id?.substring(6, 8);
    return new Date(year, month, day);
  };

  return (
    <Formik
      initialValues={{
        title: data?.rolePlayer?.person?.title || "",
        firstName: data?.rolePlayer?.person?.firstName || "",
        surname: data?.rolePlayer?.person?.surname || "",
        idNumber: data?.rolePlayer?.person?.idNumber || "",
        dateOfBirth: data?.rolePlayer?.person?.dateOfBirth || "",
        idType: data?.rolePlayer?.person?.idType || "",
        isVopdVerified: data?.rolePlayer?.person?.isVopdVerified || false,
        dateVopdVerified: data?.rolePlayer?.person?.dateVopdVerified || "",
        cellNumber: data?.rolePlayer?.cellNumber || "",
        email: data?.rolePlayer?.email || "",
        preferredCommunicationTypeId:
          data?.rolePlayer?.preferredCommunicationTypeId || "",
        tellNumber: data?.rolePlayer?.tellNumber || "",

        // rolePlayerAddresses: [],
      }}
      enableReinitialize={true}
      onSubmit={(values) => {
        console.log(values);
      }}>
      {({ values, dirty }) => {
        return (
          <Form>
            <Grid container>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <SelectWrapper
                    name="idType"
                    label="User ID Type"
                    options={
                      idTypes
                        ? idTypes?.idTypes?.map((item) => ({
                            value: item.id,
                            label: item.name,
                          }))
                        : []
                    }
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

                      <Grid item xs={3}>
                        <DOBPicker
                          name="dob"
                          label="Date of Birth"
                          value={new Date(
                            values.dateOfBirth
                          ).toLocaleDateString()}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        {!values.isVopdVerified && <VopdRequest />}
                      </Grid>
                    </>
                  ) : values.idType === 0 ? (
                    <>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="idNumber"
                          label={"Group Number"}
                        />
                      </Grid>
                      <Grid item xs={6}></Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={6}>
                        <TextfieldWrapper
                          name="idNumber"
                          label={
                            values.idType
                              ? idTypes?.idTypes?.find(
                                  (item) =>
                                    Number(item.id) === Number(values.idType)
                                ).name
                              : "Group Number"
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <DOBPicker name="dob" label="Date of Birth" />
                      </Grid>
                    </>
                  )}
                </>
                <Grid item xs={2}>
                  <TextfieldWrapper
                    inputProps={{ style: { textTransform: "uppercase" } }}
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
            </Grid>
            <Grid container sx={{ pt: 2 }} spacing={2}>
              <Grid item xs={6}>
                <TextfieldWrapper name="cellNumber" label="Mobile Number" />
              </Grid>
              <Grid item xs={6}>
                <TextfieldWrapper name="tellNumber" label="Telephone Number" />
              </Grid>
              <Grid item xs={6}>
                <TextfieldWrapper name="emailAddress" label="Email Address" />
              </Grid>
              <Grid item xs={6}>
                <PreferredCommunicationSelect
                  name="preferredCommunicationTypeId"
                  label="preferred_communication"
                />
              </Grid>
            </Grid>

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
  );
};

export default EditSubMemberFormWrapper;
