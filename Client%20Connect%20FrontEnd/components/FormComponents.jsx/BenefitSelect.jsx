import {
  Alert,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from "@mui/material";
import { useField, useFormikContext } from "formik";
import React from "react";

const BenefitSelect = ({
  name,
  label,
  coverMemberTypeId,
  benefits,
  ...otherProps
}) => {
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

  console.log("benefits", benefits);

  const filteredBenefits = benefits?.filter(
    (x) => x.coverMemberType === coverMemberTypeId,
  );

  return (
    <>
      {!filteredBenefits ? (
        <LinearProgress />
      ) : (
        <FormControl fullWidth>
          <InputLabel id="select-statedbenefit">{label}</InputLabel>
          <Select
            labelId="select-statedbenefit"
            id="select_id"
            value={values[name]}
            label={label}
            onChange={(event) => {
              setFieldValue(name, event.target.value);
              const selectedBenefit = filteredBenefits.find(
                (x) => x.benefitId === event.target.value,
              );
              setFieldValue(name, selectedBenefit?.benefit);
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {filteredBenefits &&
              filteredBenefits?.map((item, index) => {
                return (
                  <MenuItem key={index} value={item.benefitId}>
                    {item.benefit}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      )}
    </>
  );
};

export default BenefitSelect;
