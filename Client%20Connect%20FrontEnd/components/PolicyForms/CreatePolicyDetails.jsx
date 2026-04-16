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

const CreatePolicyDetails = ({
  policyDetails,
  setPolicyDetails,
  RMAPolicy,
  setWaitingPeriod,
  setMaxCover,
  setCoverAmount,
  setProductOptionId,
  setRefetchBenefits,
}) => {
  const accessToken = useToken();

  const policyQuery = useQuery(
    `policyQuery${RMAPolicy}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${RMAPolicy}`, {}),
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
        // console.log("policyDetails", policyDetails);
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

  // console.log("policyDetails", policyDetails);

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

    date = date.startOf("month");

    setPolicyDetails({
      ...policyDetails,
      joinDate: date,
    });
  };

  // First determine minimum date
  const today = policyDetails?.createdAt
    ? dayjs(policyDetails?.createdAt)
    : dayjs();
  const isBeforeCutoff = today.date() < 16;
  const minDate = isBeforeCutoff
    ? today.startOf("month")
    : today.add(1, "month").startOf("month");

  // Maximum date is 3 months from minimum date
  const maxDate = minDate.add(2, "month").startOf("month");

  const handleCheckboxChange = (e) => {
    setPolicyDetails({
      ...policyDetails,
      [e.target.name]: e.target.checked,
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
    <>
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
                  views={["year", "month"]}
                  openTo="month"
                  label="Join Date"
                  // disabled={}
                  maxDate={maxDate}
                  minDate={minDate}
                  name="date"
                  value={policyDetails.joinDate}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={policyDetails.allowDuplicate || false}
                  onChange={handleCheckboxChange}
                  name="allowDuplicate"
                />
              }
              label="Bypass Duplicate"
            />
          </>
        )}
      </Stack>
      {policyDetails.joinDate &&
        policyDetails.orgJoinDate &&
        !dayjs(policyDetails.joinDate).isSame(
          dayjs(policyDetails.orgJoinDate),
          "month",
        ) && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Alert severity="warning" sx={{ ml: 2 }}>
              Join Date has been adjusted from original join date of{" "}
              {dayjs(policyDetails.orgJoinDate).format("MMMM YYYY")}
            </Alert>
          </Stack>
        )}
    </>
  );
};

export default CreatePolicyDetails;
