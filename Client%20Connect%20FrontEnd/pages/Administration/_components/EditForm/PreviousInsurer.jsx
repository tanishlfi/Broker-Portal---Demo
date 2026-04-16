import React from "react";
import WaitingPeriodInfo from "../../../../components/FormComponents.jsx/NotificationWaitingPeriod";
import { Grid, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import TextfieldWrapper from "../../../../components/FormComponents.jsx/TextFieldWrapper";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { useFormikContext } from "formik";

const PreviousInsurer = () => {
  const { values } = useFormikContext();

  //   PreviousInsurer: data?.PreviousInsurer || "",
  //   PreviousInsurerPolicyNumber: data?.PreviousInsurerPolicyNumber || "",
  //   PreviousInsurerCoverAmount: data?.PreviousInsurerCoverAmount || 0.0,
  //   PreviousInsurerJoinDate: data?.PreviousInsurerJoinDate || "",
  //   PreviousInsurerCancellationDate:
  //     data?.PreviousInsurerCancellationDate || "",

  return (
    <div>
      <Grid container sx={{ pt: 2 }} spacing={2}>
        <Grid item xs={12}>
          <Typography>Previous Insurer</Typography>
        </Grid>
        <Grid item xs={4}>
          <TextfieldWrapper
            size="small"
            name="PreviousInsurer"
            label="Previous Insurer"
          />
        </Grid>
        <Grid item xs={4}>
          <TextfieldWrapper
            size="small"
            name="PreviousInsurerPolicyNumber"
            label="Previous Insurer Policy Number"
          />
        </Grid>
        <Grid item xs={4}>
          <TextfieldWrapper
            size="small"
            name="PreviousInsurerCoverAmount"
            label="Previous Insurer Cover Amount"
          />
        </Grid>
        <Grid item xs={6}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb">
            <DatePicker
              views={["year", "month", "day"]}
              openTo="day"
              label="Previous Insurer Join Date"
              name="PreviousInsurerJoinDate"
              value={
                values.PreviousInsurerJoinDate === ""
                  ? null
                  : values.PreviousInsurerJoinDate
              }
              onChange={(newValue) => {
                setFieldValue("PreviousInsurerJoinDate", newValue);
              }}
              variant="inline"
              inputVariant="outlined"
              renderInput={(params) => (
                <TextField fullWidth size="small" {...params} />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb">
            <DatePicker
              views={["year", "month", "day"]}
              openTo="day"
              label="Previous Insurer Cancellation Date"
              name="PreviousInsurerCancellationDate"
              value={
                values.PreviousInsurerCancellationDate === ""
                  ? null
                  : values.PreviousInsurerCancellationDate
              }
              onChange={(newValue) => {
                setFieldValue("PreviousInsurerCancellationDate", newValue);
              }}
              variant="inline"
              inputVariant="outlined"
              fullWidth
              renderInput={(params) => (
                <TextField fullWidth size="small" {...params} />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          {/* <WaitingPeriodInfo
            PreviousInsurerJoinDate={
              values.PolicyMember.PreviousInsurerJoinDate
            }
            PreviousInsurerCancellationDate={
              values.PolicyMember.PreviousInsurerCancellationDate
            }
            waitingPeriod={waitingPeriod}
            policyInceptionDate={policyInceptionDate}
          /> */}
        </Grid>
      </Grid>
    </div>
  );
};

export default PreviousInsurer;
