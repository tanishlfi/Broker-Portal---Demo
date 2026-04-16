import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useFormikContext } from "formik";
import React from "react";

const CheckboxWrapper = ({ name, label, value }) => {
  const { values, setFieldValue } = useFormikContext();
  //   const [field, meta] = useField(name);

  const handleChange = (event) => {
    setFieldValue(name, event.target.checked);
  };

  return (
    <FormControlLabel
      control={<Checkbox name={name} checked={value} onChange={handleChange} />}
      label={label}
    />
  );
};

export default CheckboxWrapper;
