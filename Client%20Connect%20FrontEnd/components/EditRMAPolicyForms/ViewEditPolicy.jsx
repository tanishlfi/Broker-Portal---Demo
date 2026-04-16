import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";
import useToken from "hooks/useToken";
import React from "react";

const ViewEditPolicy = ({ policyDetails, setPolicyDetails, getRules }) => {
  const accessToken = useToken();

  const [selectRules, setSelectRules] = React.useState(policyDetails?.rules);

  const handelSelectRule = (e) => {
    setPolicyDetails({
      ...policyDetails,

      [e.target.name]: e.target.value,
      rules: getRules?.data?.data?.data?.filter(
        (rule) => rule.categoryId === e.target.value,
      ),
    });
  };

  const handelChange = (e) => {
    setPolicyDetails({
      ...policyDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handelDateChange = (value) => {
    // Initialize 'date' with the current date
    let date = dayjs(value);

    // Check if the date is between 1st and 28th
    if (date.date() >= 1 && date.date() <= 28) {
      // Set the month to the 1st of the next month
      date = date.startOf("month");
    } else {
      // Set the date to 28th (or the last day of the current month)
      date = date.date(28);
      // Set the month to the start of the second month
      date = date.add(2, "month").startOf("month");
    }

    setPolicyDetails({
      ...policyDetails,
      joinDate: date,
    });
  };

  // if (getRules.isLoading) {
  //   return <LinearProgress />;
  // }

  // if (getRules.isError) {
  //   return (
  //     <Alert
  //       severity="error"
  //       sx={{
  //         width: "400px",
  //       }}>
  //       Error getting Categories
  //     </Alert>
  //   );
  // }

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      {policyDetails?.coverAmount && policyDetails?.rules && (
        <Box sx={{ maxWidth: 200, minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel id="select_cover">Cover Amount</InputLabel>
            <Select
              labelId="select_cover"
              id="select_cover_id"
              name="coverAmount"
              // disabled={!getRules.isLoading && !policyDetails?.rules?.length > 0}
              value={policyDetails.coverAmount}
              label="Select cover amount"
              onChange={handelChange}
            >
              {selectRules?.benefitAmount?.map((amount, index) => {
                return (
                  <MenuItem key={index} value={amount}>
                    {amount} K
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      )}

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormControl>
          <DatePicker
            views={["month", "day"]}
            openTo="month"
            label="Join Date"
            disabled
            name="date"
            value={policyDetails?.joinDate}
            onChange={(newValue) => {
              handelDateChange(newValue);
            }}
            variant="inline"
            inputVariant="outlined"
            fullWidth
            renderInput={(params) => <TextField {...params} />}
          />
        </FormControl>
      </LocalizationProvider>
    </Stack>
  );
};

export default ViewEditPolicy;

const Amounts = [
  { title: "5K", value: "5000" },
  { title: "10K", value: "10000" },
  { title: "15K", value: "15000" },
  { title: "20K", value: "20000" },
  { title: "30K", value: "30000" },
];
