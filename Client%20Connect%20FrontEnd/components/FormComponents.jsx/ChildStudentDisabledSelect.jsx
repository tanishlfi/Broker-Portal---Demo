import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useFormikContext } from "formik";
import React from "react";

const ChildStudentDisabledSelect = ({ disableSelection = false }) => {
  const { values, setFieldValue } = useFormikContext();

  const handleRadioChange = (event) => {
    if (event.target.value === "student") {
      setFieldValue("isStudent", true);
    } else if (event.target.value === "disabled") {
      setFieldValue("isDisabled", true);
    } else {
      setFieldValue("isStudent", false);
      setFieldValue("isDisabled", false);
    }
  };

  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">
        Select if Child is a Student or Disabled Child
      </FormLabel>
      <RadioGroup
        onChange={handleRadioChange}
        value={
          values.isStudent ? "student" : values.isDisabled ? "disabled" : "none"
        }
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group">
        <FormControlLabel
          value="student"
          control={<Radio />}
          label="is Student"
          disabled={disableSelection}
        />

        <FormControlLabel
          value="disabled"
          control={<Radio />}
          label="is Disabled"
          disabled={disableSelection}
        />
        {(values.isStudent || values.isDisabled) && (
          <FormControlLabel
            value="none"
            control={<Radio />}
            label="None"
            disabled={disableSelection}
          />
        )}
      </RadioGroup>
    </FormControl>
  );
};

export default ChildStudentDisabledSelect;
