import React from "react";
import { useField, useFormikContext } from "formik";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import PropTypes from "prop-types";

const SelectWrapper = ({ name, label, size, options, ...otherProps }) => {
  const { values, setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const handleChange = (event) => {
    setFieldValue(name, event.target.value);
  };

  const configSelect = {
    ...field,
    ...otherProps,
    variant: "outlined",
    fullWidth: true,
    onChange: handleChange,
  };

  return (
    <FormControl
      size={size ? size : "normal"}
      error={meta && meta.touched && meta.error ? true : null}
      fullWidth>
      <InputLabel id="select">{label}</InputLabel>
      <Select
        {...configSelect}
        labelId="select"
        id="select_id"
        value={values[name]}
        label={label}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options?.map((item, index) => {
          return (
            <MenuItem disabled={item.disabled} key={index} value={item.value}>
              {item.label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default SelectWrapper;

SelectWrapper.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
};
