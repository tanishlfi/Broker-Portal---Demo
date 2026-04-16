import { FormControl, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import { useField, useFormikContext } from "formik";

const DobPickerWithLimits = ({ name, ...otherProps }) => {
  const [field, mata] = useField(name);
  const { setFieldValue } = useFormikContext();

  const configTextfield = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
  };

  if (mata && mata.touched && mata.error) {
    configTextfield.error = true;
    configTextfield.helperText = mata.error;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <FormControl fullWidth>
        <DatePicker
          openTo="year"
          views={["year", "month", "day"]}
          label="Date Of Birth"
          name={name}
          {...configTextfield}
          variant="inline"
          onChange={(date) => setFieldValue(name, date)}
          inputVariant="outlined"
          fullWidth
          renderInput={(params) => <TextField {...params} />}
        />
      </FormControl>
    </LocalizationProvider>
  );
};

export default DobPickerWithLimits;
