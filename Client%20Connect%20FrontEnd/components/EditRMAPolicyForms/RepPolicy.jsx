import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import useToken from "hooks/useToken";

const RepPolicy = ({ policyDetails, setPolicyDetails }) => {
  const accessToken = useToken();

  const getProductTypes = useQuery(
    "ProductTypes",
    () => {
      return axios.get(`${nodeSa}/onboarding/product_types`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  console.log(
    "policyDetails.productTypeId policyDetails.productTypeId",
    policyDetails.productTypeId
  );

  const getRules = useQuery(
    `GetPolicyRules${policyDetails.productOptionId}`,
    async () =>
      await axios.get(
        `${nodeSa}/onboarding/benefit_rules/ByProductOptionId/${policyDetails.productOptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: policyDetails.productTypeId ? true : false,
      onSuccess: (data) => {
        console.log("getRules", data);
        setPolicyDetails((prev) => {
          return {
            ...prev,
            rules: data?.data?.data?.filter(
              (rule) =>
                Number(rule.categoryId) ===
                Number(policyDetails.selectedCategory)
            ),
          };
        });
      },
    }
  );

  const handelSelectRule = (e) => {
    setPolicyDetails({
      ...policyDetails,

      [e.target.name]: e.target.value,
      rules: getRules?.data?.data?.data?.filter(
        (rule) => rule.categoryId === e.target.value
      ),
    });
  };

  const handelChange = (e) => {
    setPolicyDetails({
      ...policyDetails,
      productTypeId: e.target.value,
      ProductOptionId: getProductTypes.data?.data?.data?.filter(
        (product) => product.id === e.target.value
      ),
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

  // if (policyQuery.isError) {
  //   return (
  //     <Alert severity="error">
  //       Failed to get policy details. Please try again later.
  //     </Alert>
  //   );
  // }
  // if (policyQuery.isLoading) {
  //   return <CircularProgress />;
  // }

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      {getProductTypes.isLoading && (
        <Skeleton variant="rectangular" width={500} height={50} />
      )}
      <Stack>
        <FormControl
          sx={{
            width: "400px",
          }}>
          <InputLabel id="product_type_id">Select Product Type</InputLabel>
          <Select
            labelId="product_type_id"
            name="productTypeId"
            id="productTypeId"
            value={policyDetails.productTypeId || ""}
            label="Select Product Type"
            onChange={handelChange}>
            {getProductTypes.data?.data?.data
              ?.filter(
                (product) => product.description.toLowerCase() !== "scheme"
              )
              ?.map((product) => {
                return (
                  <MenuItem key={product.id} value={product.id}>
                    {product.description}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
        {getProductTypes && getProductTypes.isError && (
          <Alert
            severity="error"
            sx={{
              width: "400px",
            }}>
            Error getting product types
          </Alert>
        )}
      </Stack>
      {/* 
      {getRules.isLoading ? (
        <Skeleton variant="rectangular" width={500} height={50} />
      ) : (
        <FormControl
          sx={{
            width: "400px",
          }}>
          <InputLabel id="select_category">Select Category</InputLabel>
          <Select
            labelId="select_category"
            id="selectCategory"
            name="selectedCategory"
            value={policyDetails.selectedCategory}
            label="Select Category"
            onChange={handelSelectRule}>
            {getRules.data?.data?.data
              ? getRules.data?.data?.data?.map((product) => {
                  return (
                    <MenuItem
                      key={product.categoryId}
                      value={product.categoryId}>
                      {product.category}
                    </MenuItem>
                  );
                })
              : []}
          </Select>
        </FormControl>
      )}

      {getRules && getRules.isError && (
        <Alert
          severity="error"
          sx={{
            width: "400px",
          }}>
          Error getting Categories
        </Alert>
      )} */}

      {/* <Box sx={{ maxWidth: 200, minWidth: 200 }}>
        <FormControl fullWidth>
          <InputLabel id="select_cover">Cover Amount</InputLabel>
          <Select
            labelId="select_cover"
            id="select_cover_id"
            name="coverAmount"
            disabled={!getRules.isLoading && !policyDetails?.rules?.length > 0}
            value={policyDetails.coverAmount}
            label="Select cover amount"
            onChange={handelChange}>
            {policyDetails?.rules &&
              policyDetails?.rules?.length > 0 &&
              policyDetails?.rules[0]?.benefitAmount.map((amount, index) => {
                return (
                  <MenuItem key={index} value={amount}>
                    {amount} K
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      </Box> */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormControl>
          <DatePicker
            views={["month", "day"]}
            openTo="month"
            label="Join Date"
            maxDate={dayjs().add(2, "month")}
            minDate={dayjs().subtract(2, "month")}
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
    </Stack>
  );
};

export default RepPolicy;

const Amounts = [
  { title: "5K", value: "5000" },
  { title: "10K", value: "10000" },
  { title: "15K", value: "15000" },
  { title: "20K", value: "20000" },
  { title: "30K", value: "30000" },
];
