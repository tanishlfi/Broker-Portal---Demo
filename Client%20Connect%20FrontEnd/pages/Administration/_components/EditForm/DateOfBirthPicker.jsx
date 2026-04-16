import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import { useField, useFormikContext } from "formik";
import dayjs from "dayjs";

export default function DateOfBirthPicker({ name, size, ...otherProps }) {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const { minDate, maxDate } = otherProps;

  const configTextField = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
    error: !!meta.error && meta.touched,
    helperText: meta.touched && meta.error,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        openTo="year"
        views={["year", "month", "day"]}
        value={field.value ? dayjs(field.value) : null}
        maxDate={maxDate ? maxDate : dayjs()}
        minDate={minDate ? minDate : dayjs().subtract(100, "year")}
        onChange={(newValue) => {
          let date = dayjs(newValue);

          setFieldValue(name, date.format("YYYY-MM-DDTHH:mm:ss"));
        }}
        label="Date Of Birth"
        renderInput={(params) => (
          <TextField
            size={size ? size : "normal"}
            {...params}
            {...configTextField}
          />
        )}
      />
    </LocalizationProvider>
  );
}
