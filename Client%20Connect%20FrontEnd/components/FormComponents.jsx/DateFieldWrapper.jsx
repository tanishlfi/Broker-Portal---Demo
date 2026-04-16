import { FormControl, TextField, FormHelperText } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import { useField, useFormikContext } from "formik";

const DateFieldWrapper = ({ name, label, ...otherProps }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const configTextfield = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
  };

  if (meta && meta.touched && meta.error) {
    configTextfield.error = true;
    configTextfield.helperText = meta.error;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <FormControl
        error={meta && meta.touched && meta.error ? true : null}
        fullWidth>
        <DatePicker
          openTo="year"
          views={["year", "month", "day"]}
          label={label}
          name={name}
          {...configTextfield}
          variant="inline"
          onChange={(date) => setFieldValue(name, date)}
          inputVariant="outlined"
          fullWidth
          renderInput={(params) => <TextField {...params} />}
        />
        {meta.touched && meta.error ? (
          <FormHelperText>{meta.error}</FormHelperText>
        ) : null}
      </FormControl>
    </LocalizationProvider>
  );
};

export default DateFieldWrapper;
