import {
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useField, useFormikContext } from "formik";

import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import SelectWrapper from "./SelectWrapper";
import useToken from "hooks/useToken";

const SelectContactType = ({ name, label, ...otherProps }) => {
  const accessToken = useToken();

  const { data, isLoading, error, isError } = useQuery(`ContactType`, () =>
    axios.get(`${rmaAPI}/mdm/api/ContactType`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );

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
    <>
      {isLoading ? (
        <div>Loading Contact Types...</div>
      ) : (
        <>
          {data?.data && data?.data.length > 0 ? (
            <FormControl
              error={meta && meta.touched && meta.error ? true : null}
              fullWidth
            >
              <InputLabel id="select_contact_type">{label}</InputLabel>
              <Select
                {...configSelect}
                labelId="select_contact_type"
                id="select_contact_id"
                value={values[name]}
                label={label}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {data?.data?.map((item, index) => {
                  return (
                    <MenuItem key={index} value={item.id}>
                      {item.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="error">Contact Types Found</Alert>
          )}
        </>
      )}
    </>
  );
};

export default SelectContactType;
