import { Button, Grid } from "@mui/material";
import SelectAddressType from "components/FormComponents.jsx/SelectAddressType";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import { Form, Formik, useFormikContext } from "formik";
import React from "react";
import { useEffect } from "react";
import * as Yup from "yup";

const AddressPostal = ({ values }) => {
  const {
    values: {
      address_line_1,
      address_line_2,
      city,
      province,
      country,
      postal_code,
    },
    setFieldValue,
  } = useFormikContext();

  const [sameAsPhysical, setSameAsPhysical] = React.useState(false);

  useEffect(() => {
    if (sameAsPhysical) {
      setFieldValue("postal_address_line_1", address_line_1);
      setFieldValue("postal_address_line_2", address_line_2);
      setFieldValue("postal_city", city);
      setFieldValue("postal_province", province);
      setFieldValue("postal_country", country);
      setFieldValue("postal_postal_code", postal_code);
    }
  }, [
    sameAsPhysical,
    address_line_1,
    address_line_2,
    city,
    province,
    country,
    postal_code,
    setFieldValue,
  ]);

  return (
    <Grid sx={{ pt: 2 }} container spacing={2}>
      <Grid item xs={12}>
        <Button
          variant={sameAsPhysical ? "contained" : "outlined"}
          sx={{ my: 2 }}
          onClick={() => setSameAsPhysical(!sameAsPhysical)}
        >
          Same as Physical Address
        </Button>
      </Grid>
      <Grid item xs={6}>
        <TextfieldWrapper
          name="postal_address_line_1"
          label="Postal Address Line 1"
        />
      </Grid>
      <Grid item xs={6}>
        <TextfieldWrapper
          name="postal_address_line_2"
          label="Postal Address Line 2"
        />
      </Grid>
      <Grid item xs={6}>
        <TextfieldWrapper name="postal_city" label="Postal City" />
      </Grid>
      <Grid item xs={6}>
        <SelectWrapper
          name="postal_province"
          label="Postal Province"
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
        <TextfieldWrapper name="postal_country" label="Postal Country" />
      </Grid>
      <Grid item xs={6}>
        <TextfieldWrapper name="postal_postal_code" label="Postal Code" />
      </Grid>
    </Grid>
  );
};

export default AddressPostal;
