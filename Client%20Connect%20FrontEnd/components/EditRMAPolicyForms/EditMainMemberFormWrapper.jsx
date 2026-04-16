import React from "react";
import { Formik, Form } from "formik";
// import * as Yup from "Yup";
import { Button, Grid, Typography } from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import AddressPostal from "components/PolicyForms/AddressPostal";

const EditMainMemberFormWrapper = ({ data2, idTypes }) => {
  if (idTypes?.isLoading) return <div>Loading...</div>;

  // const getDobFromId = (id) => {
  //   const year = id?.substring(0, 4);
  //   const month = id?.substring(4, 6);
  //   const day = id?.substring(6, 8);
  //   return new Date(year, month, day);
  // };

  return (
    <Formik
      initialValues={{
        title: data2?.policyOwner?.person?.title || "",
        firstName: data2?.policyOwner?.person?.firstName || "",
        surname: data2?.policyOwner?.person?.surname || "",
        idNumber: data2?.policyOwner?.person?.idNumber || "",
        gender: data2?.policyOwner?.person.gender || "",
        dateOfBirth: data2?.policyOwner?.person?.dateOfBirth || "",
        idType: data2?.policyOwner?.person?.idType || "",
        isVopdVerified: data2?.policyOwner?.person?.isVopdVerified || false,
        dateVopdVerified: data2?.policyOwner?.person?.dateVopdVerified || "",
        cellNumber: data2?.policyOwner?.cellNumber || "",
        emailAddress: data2?.policyOwner?.emailAddress || "",
        addressTypeId: data2?.policyOwner?.addressTypeId || "",
        preferredCommunicationTypeId:
          data2?.policyOwner?.preferredCommunicationTypeId || "3",
        tellNumber: data2?.policyOwner?.tellNumber || "",
        dateOfDeath: data2?.policyOwner?.dateOfDeath || "",
        deathCertificateNumber:
          data2?.policyOwner?.deathCertificateNumber || "",
        address_type_id: 1,
        address_line_1: "",
        address_line_2: "",
        city: "",
        province: "",
        postalCode: "",
        countryId: "",

        preferred_communication: "",
        postal_address_type_id: "",
        postal_address_line_1: "",
        postal_address_line_2: "",
        postal_city: "",
        postal_province: "",
        postal_postal_code: "",
        postal_country: "",

        // rolePlayerAddresses: [],
      }}
      enableReinitialize={true}
    >
      {({ values }) => {
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
                            values.dateOfBirth,
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
                              ? idTypes?.idTypes.find(
                                  (item) =>
                                    Number(item.id) === Number(values.idType),
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
                  <TextfieldWrapper name="title" label={"Title"} />
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
            <Grid sx={{ pt: 2 }} container spacing={2}>
              <Grid item xs={6}>
                <TextfieldWrapper
                  name="address_line_1"
                  label="Address Line 1"
                />
              </Grid>
              <Grid item xs={6}>
                <TextfieldWrapper
                  name="address_line_2"
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
                <TextfieldWrapper name="country" label="Country" />
              </Grid>
              <Grid item xs={6}>
                <TextfieldWrapper name="postal_code" label="Postal Code" />
              </Grid>
            </Grid>

            <Button size="large" sx={{ mt: 2 }} variant="contained">
              Save
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default EditMainMemberFormWrapper;
