import { Grid } from "@mui/material";
import SelectAddressType from "components/FormComponents.jsx/SelectAddressType";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import AddressPostal from "./AddressPostal";

const AddressMain = ({ values, setValues }) => {
  return (
    <>
      <Grid sx={{ pt: 2 }} container spacing={2}>
        <Grid item xs={6}>
          <TextfieldWrapper name="address_line_1" label="Address Line 1" />
        </Grid>
        <Grid item xs={6}>
          <TextfieldWrapper name="address_line_2" label="Address Line 2" />
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
      <AddressPostal values={values} />
    </>
  );
};

export default AddressMain;
