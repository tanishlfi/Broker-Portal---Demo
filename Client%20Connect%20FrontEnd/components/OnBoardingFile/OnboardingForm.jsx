import styled from "@emotion/styled";
import {
  Box,
  Button,
  Card,
  Typography,
  CardContent,
  CardHeader,
  Alert,
} from "@mui/material";
import { Stack } from "@mui/system";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import React, { useState } from "react";
import FileOpenIcon from "@mui/icons-material/FileOpen";

import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import dayjs from "dayjs";
import AlertPopup from "components/Bits/AlertPopup";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { getProductTypes } from "components/Bits/GetProductTypes";
// import { useUser } from "@auth0/nextjs-auth0/client";

// Path: pages\Brokers\OnBoarding\[id].js

const OnboardingForm = ({ id }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = useToken();

  // const { user } = useUser();

  const [scheme, setScheme] = React.useState(null);

  const [date, setDate] = React.useState(() => {
    const today = dayjs();
    return today.date() < 16
      ? today.startOf("month")
      : today.add(1, "month").startOf("month");
  });

  const [document, setDocument] = React.useState("");

  const [productType, setProductType] = React.useState("");

  const handleFileChange = (event) => {
    setDocument(event.target.files[0]);
  };

  const clearForm = () => {
    setScheme(null);
    setDocument("");
  };

  if (!productType) {
    setProductType("Scheme");
  }

  // const GetListOfFiles = useQuery(
  //   "GetListOfFiles",
  //   () => {
  //     return axios.get(`${nodeSa}/onboarding/file_upload`, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //   },
  //   {
  //     enabled: !!accessToken,
  //   },
  // );

  const uploadFileRequest = useMutation(
    (data) => {
      return axios.post(`${nodeSa}/onboarding/file_upload`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  const handleSubmit = () => {
    let providerId = scheme?.policyId || representative?.id;
    let joinDate = date;
    const data = new FormData();

    data.append("file", document);
    data.append("providerId", providerId);
    data.append("joinDate", dayjs(joinDate).format("YYYY-MM-DD"));
    data.append("productType", productType);
    data.append("brokerageId", id);
    // data.append("user", user.email || ""); // Use user ID from Auth0
    // data.append("accessToken", accessToken); // Use user name from Auth0
    uploadFileRequest.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["GetListOfFiles"] });
        clearForm();
        // delay the redirect to allow the user to see the success message
        setTimeout(() => {
          router.push(`/Onboarding/MyFiles`);
        }, 3000);
      },
    });
  };

  // First determine minimum date
  const today = dayjs();
  const isBeforeCutoff = today.date() < 16;
  const minDate = isBeforeCutoff
    ? today.startOf("month")
    : today.add(1, "month").startOf("month");

  // Maximum date is 3 months from minimum date
  const maxDate = minDate.add(2, "month").startOf("month");

  const handelDateChange = (value) => {
    // Initialize 'date' with the current date
    let date = dayjs(value);

    date = date.startOf("month");

    setDate(date);
  };

  // check if date is between +12 and -12 months

  const checkDate = (date) => {
    let currentDate = dayjs();
    // set min on the first of the previous month
    let minDate = currentDate.subtract(1, "month").startOf("month");
    let maxDate = currentDate.add(2, "month").startOf("month");

    return date.isBetween(minDate, maxDate, "month", "[]");
  };

  return (
    <>
      <AlertPopup
        open={uploadFileRequest.isError}
        message={uploadFileRequest.error?.response?.data?.message}
        severity="error"
      />
      <AlertPopup
        open={uploadFileRequest.isSuccess ? true : false}
        message={"File uploaded successfully"}
        severity="success"
      />

      <Stack sx={{ my: 2 }}>
        <SelectScheme select={scheme} setSelect={setScheme} id={id} />
      </Stack>

      {!document && scheme && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Join Date"
                value={date}
                views={["month", "year"]}
                openTo="month"
                onChange={(newValue) => handelDateChange(newValue)}
                format="LL"
                maxDate={maxDate}
                minDate={minDate}
              />
            </LocalizationProvider>
          </Box>

          {checkDate(date) ? (
            <label htmlFor="contained-button-file">
              <Input
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                id="contained-button-file"
                type="file"
                autoFocus
                onChange={handleFileChange}
              />

              <>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<FileOpenIcon />}
                  fullWidth
                  sx={{
                    py: 2,
                    mb: 2,
                  }}
                  component="span"
                >
                  Upload
                </Button>
                <Button
                  sx={{ mt: 4 }}
                  variant="contained"
                  color="warning"
                  onClick={() => clearForm("")}
                >
                  Cancel
                </Button>
              </>
            </label>
          ) : (
            <Alert severity="warning">
              <Typography>
                Join date must be between{" "}
                {dayjs().subtract(0, "month").startOf("month").format("LL")} and{" "}
                {dayjs().add(12, "month").startOf("month").format("LL")}
              </Typography>
            </Alert>
          )}
        </Stack>
      )}

      {document && scheme && (
        <Stack sx={{ my: 4 }}>
          <Card>
            <CardHeader
              title={document.name}
              subheader={document.size}
              action={
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => clearForm("")}
                >
                  Cancel
                </Button>
              }
            />
            <CardContent>
              <Button
                fullWidth
                size="large"
                disabled={uploadFileRequest.isLoading}
                onClick={handleSubmit}
                variant="contained"
                color="secondary"
              >
                {uploadFileRequest.isLoading ? "Loading..." : "Submit"}
              </Button>
            </CardContent>
          </Card>
        </Stack>
      )}
    </>
  );
};

export default OnboardingForm;

const Input = styled("input")({
  display: "none",
});
