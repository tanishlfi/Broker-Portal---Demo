import { FormControlLabel, Switch } from "@mui/material";
import { useFormikContext } from "formik";
import React from "react";

const SwitchWrapper = ({ name, label, value }) => {
  const { values, setFieldValue } = useFormikContext();
  //   const [field, meta] = useField(name);

  const handleChange = (event) => {
    setFieldValue(name, event.target.checked);
  };

  return (
    <FormControlLabel
      label={label}
      control={
        <Switch
          name={name}
          checked={value}
          onChange={handleChange}
          inputProps={{ "aria-label": "controlled" }}
        />
      }
    />
  );
};

export default SwitchWrapper;
