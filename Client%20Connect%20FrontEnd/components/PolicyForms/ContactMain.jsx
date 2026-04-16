import { Grid } from "@mui/material";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import SelectContactType from "components/FormComponents.jsx/SelectContactType";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";

const ContactMain = () => {
  return (
    <Grid container sx={{ pt: 2 }} spacing={2}>
      <Grid item xs={6}>
        <TextfieldWrapper name="mobileno" label="Mobile Number" />
      </Grid>
      <Grid item xs={6}>
        <TextfieldWrapper name="phoneno" label="Phone Number" />
      </Grid>
      <Grid item xs={6}>
        <TextfieldWrapper name="email" label="Email Address" />
      </Grid>
      <Grid item xs={6}>
        <PreferredCommunicationSelect
          name="preferred_communication"
          label="preferred_communication"
        />
      </Grid>
    </Grid>
  );
};

export default ContactMain;
