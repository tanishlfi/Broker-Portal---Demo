import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";
import useToken from "hooks/useToken";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { rmaAPI, nodeSa } from "src/AxiosParams";

const CreatePolicyDetailsViewOnly = ({
  policyDetails,
  setPolicyDetails,
  RMAPolicy,
  setWaitingPeriod,
  setMaxCover,
  setCoverAmount,
  setProductOptionId,
  setSelectedCategory,
  setRefetchBenefits,
}) => {
  const [policyTypeTrigger, setPolicyTypeTrigger] = useState(false);

  useEffect(() => {
    if (policyDetails.selectedCategory) {
      setPolicyTypeTrigger(true);
    }
  }, [policyDetails.selectedCategory]);

  const accessToken = useToken();

  const policyQuery = useQuery(
    `policyQuery${RMAPolicy}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${RMAPolicy}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),

    {
      enabled: !!accessToken && !!RMAPolicy,
      onSuccess: (data) => {
        setPolicyDetails((prev) => {
          return {
            ...prev,
            productOptionId: data?.data?.productOptionId,
            providerInceptionDate: data?.data?.policyInceptionDate,
            brokerageId: data?.data?.brokerageId,
            providerId: RMAPolicy,
            brokerageName: data?.data?.brokerageName,
            providerName: data?.data?.clientName,
            adminPercentage: data?.data?.adminPercentage,
            commissionPercentage: data?.data?.commissionPercentage,
            binderFeePercentage: data?.data?.binderFeePercentage,
            premiumAdjustmentPercentage:
              data?.data?.premiumAdjustmentPercentage,
            isEuropAssist: data?.data?.isEuropAssist,
          };
        });
        setWaitingPeriod(
          dayjs(data?.data?.policyInceptionDate).format("YYYY-MM-DD") <
            dayjs("2022-03-01").format("YYYY-MM-DD")
            ? 6
            : 3,
        );
        setProductOptionId(data?.data?.productOptionId);
      },
    },
  );

  const getBenefitAmounts = useQuery(
    ["benefitAmounts", policyDetails.productOptionId],
    async () =>
      await axios.get(
        `${nodeSa}/benefits/${policyDetails.productOptionId}/GetBenefitAmount`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    {
      enabled: policyDetails.productOptionId ? true : false && !!accessToken,
      onSuccess: (data) => {
        setPolicyDetails((prev) => {
          return {
            ...prev,
            benefitAmounts: data?.data?.data,
          };
        });
      },
    },
  );

  const handelChange = (e) => {
    setPolicyDetails({
      ...policyDetails,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "coverAmount") {
      setMaxCover(e.target.value);
      setCoverAmount(e.target.value);
      setRefetchBenefits(true);
    }
  };

  const handelDateChange = (value) => {
    // Initialize 'date' with the current date
    let date = dayjs(value);

    // // Check if the date is between 1st and 28th
    // if (date.date() >= 1 && date.date() <= 28) {
    //   // Set the month to the 1st of the next month
    //   date = date.startOf("month");
    // } else {
    //   // Set the date to 28th (or the last day of the current month)
    //   date = date.date(28);
    //   // Set the month to the start of the second month
    //   date = date.add(2, "month").startOf("month");
    // }

    // Check if the date is between 1st and 16th
    if (date.date() >= 1 && date.date() <= 15) {
      // Set the month to the 1st of the next month
      date = date.startOf("month");
    } else {
      // Set the date to 16th (or the last day of the current month)
      date = date.date(16);
      // Set the month to the start of the second month
      date = date.add(1, "month").startOf("month");
    }

    setPolicyDetails({
      ...policyDetails,
      joinDate: date,
    });
  };

  if (policyQuery.isError) {
    return (
      <Alert severity="error">
        Failed to get policy details. Please try again later.
      </Alert>
    );
  }
  if (policyQuery.isLoading || getBenefitAmounts.isLoading) {
    return <LinearProgress />;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      {policyQuery.isLoading && getBenefitAmounts.isLoading ? (
        <Skeleton variant="rectangular" width={500} height={50} />
      ) : (
        <>
          {policyQuery.isSuccess &&
            getBenefitAmounts.isSuccess &&
            policyDetails?.benefitAmounts &&
            policyDetails?.benefitAmounts?.length > 0 && (
              <Box sx={{ maxWidth: 200, minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel id="select_cover">Cover Amount</InputLabel>
                  <Select
                    labelId="select_cover"
                    id="select_cover_id"
                    name="coverAmount"
                    disabled={
                      !getBenefitAmounts.isLoading &&
                      !policyDetails?.benefitAmounts?.length > 0
                    }
                    value={policyDetails?.coverAmount}
                    label="Select cover amount"
                    onChange={handelChange}
                    inputProps={{ readOnly: true }}
                  >
                    {policyDetails?.benefitAmounts &&
                      policyDetails?.benefitAmounts?.length > 0 &&
                      policyDetails?.benefitAmounts?.map((amount, index) => {
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
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <FormControl>
              <DatePicker
                views={["year", "month", "day"]}
                openTo="month"
                label="Join Date"
                maxDate={dayjs().add(3, "month")}
                minDate={dayjs().startOf("month")}
                name="date"
                value={policyDetails.joinDate}
                onChange={(newValue) => {
                  handelDateChange(newValue);
                }}
                variant="inline"
                inputVariant="outlined"
                fullWidth
                renderInput={(params) => <TextField {...params} />}
                readOnly
              />
            </FormControl>
          </LocalizationProvider>
          <FormControlLabel
            control={
              <Checkbox
                checked={policyDetails.allowDuplicate || false}
                readOnly
                name="allowDuplicate"
              />
            }
            label="Bypass Duplicate"
          />
        </>
      )}
    </Stack>
  );
};

export default CreatePolicyDetailsViewOnly;

const Amounts = [
  { title: "5K", value: "5000" },
  { title: "10K", value: "10000" },
  { title: "15K", value: "15000" },
  { title: "20K", value: "20000" },
  { title: "30K", value: "30000" },
];
