import {
  Alert,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from "@mui/material";
import axios from "axios";
import { useField, useFormikContext } from "formik";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const ALLOWED_COMM_TYPE_IDS = [1, 3];

const PreferredCommunicationSelect = ({ name, size, label, ...otherProps }) => {
  const accessToken = useToken();

  const { data, isLoading, error } = useQuery(
    `PreferredCommunicationSelect`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/CommunicationType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
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
      {error && <Alert severity="error">{error}</Alert>}

      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          {data?.data && data?.data.length > 0 ? (
            <FormControl
              size={size ? "small" : "medium"}
              error={meta && meta.touched && meta.error ? true : null}
              fullWidth>
              <InputLabel id="preferred_communication_select_label">
                {label}
              </InputLabel>
              <Select
                {...configSelect}
                labelId="preferred_communication_select_label"
                id="preferred_communication_select"
                value={values[name]}
                label={label}>
                {data?.data &&
                  data?.data
                    ?.filter((item) => ALLOWED_COMM_TYPE_IDS.includes(item.id))
                    .map((item, index) => {
                      return (
                        <MenuItem key={index} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="error">
              No Preferred Communication Types Found
            </Alert>
          )}
        </>
      )}
    </>
  );
};

export default PreferredCommunicationSelect;
