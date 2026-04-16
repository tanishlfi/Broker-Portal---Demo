import {
  Alert,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormHelperText,
  Grid,
  InputAdornment,
  LinearProgress,
  ListSubheader,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import useToken from "../../../hooks/useToken";
import { useQuery } from "react-query";
import axios from "axios";
import { nodeSa, rmaAPI } from "../../../src/AxiosParams";
import PolicyIcon from "@mui/icons-material/Policy";
import { Form, Formik } from "formik";
import DateFieldWrapper from "../../../components/FormComponents.jsx/DateFieldWrapper";
import DiffAlert from "../../../components/FormComponents.jsx/DiffAlert";
import TextfieldWrapper from "../../../components/FormComponents.jsx/TextFieldWrapper";
const EditPolicyData = ({
  PolicyData,
  setPolicyData,
  PolicyMembers,
  setPolicyMembers,
  policyDataDiff,
  noEdit = false,
}) => {
  const [coverAmountOptions, setCoverAmountOptions] = React.useState([]);
  const accessToken = useToken();

  // console.log("noEdit", noEdit);

  // console.log("Members", PolicyMembers);

  const [open, setOpen] = React.useState(false);

  let hasChanges = policyDataDiff
    ? Object.keys(policyDataDiff).length > 0
    : false;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getBenefitAmounts = useQuery(
    `GetBenefitAmounts${PolicyData.ProductOptionId}`,
    // async () =>
    //   await axios.get(
    //     `${rmaAPI}/clc/api/Product/Benefit/GetProductBenefitRates/${PolicyData.ProductOptionId}/1`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //       },
    //     },
    //   ),
    // {
    //   enabled: PolicyData.ProductOptionId ? true : false && !!accessToken,
    //   onSuccess: (data) => {
    //     console.log("Benefit Amounts Data", data?.data);
    //     let coverAmountOptions = [];
    //     data?.data?.benefits.forEach((benefit) => {
    //       if (benefit?.benefitRates?.length > 0) {
    //         benefit?.benefitRates.forEach((rate) => {
    //           if (rate?.benefitAmount) {
    //             coverAmountOptions.push(rate.benefitAmount);
    //           }
    //         });
    //       }
    //     });
    //     coverAmountOptions = [...new Set(coverAmountOptions)]; // Remove duplicates
    //     coverAmountOptions.sort((a, b) => a - b); // Sort in ascending order
    //     // console.log("Cover Amount Options", coverAmountOptions);

    //     setCoverAmountOptions(coverAmountOptions);
    //     setPolicyData((prev) => {
    //       return {
    //         ...prev,
    //         CoverAmountOptions: coverAmountOptions,
    //       };
    //     });
    //   },
    // },
    async () =>
      await axios.get(
        `${nodeSa}/rules/benefit/GetBenefitAmount/${PolicyData.ProductOptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    {
      enabled: PolicyData.ProductOptionId ? true : false && !!accessToken,
      onSuccess: (data) => {
        setCoverAmountOptions(data?.data?.data);
        setPolicyData((prev) => {
          return {
            ...prev,
            CoverAmountOptions: data?.data?.data,
          };
        });
      },
    },
  );

  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  if (getBenefitAmounts?.isLoading) {
    return <LinearProgress />;
  }

  return (
    <>
      <React.Fragment>
        <Card
          sx={{
            mb: 2,
            "&:hover": {
              boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
              cursor: "pointer",
            },

            ...(hasChanges && {
              borderColor: "warning.main",
              borderWidth: 2,
              borderStyle: "solid",
            }),
          }}
        >
          <CardActionArea onClick={handleClickOpen}>
            <CardContent>
              <PolicyIcon />
              <Typography variant="h6">Change Policy Details</Typography>
              <Typography variant="body2">
                Cover Amount: R{" "}
                {PolicyData?.coverAmount &&
                  (PolicyData?.coverAmount)
                    .toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}
              </Typography>
              <Typography variant="body2">
                InstallmentPremium: R{" "}
                {PolicyData?.InstallmentPremium &&
                  (PolicyData?.InstallmentPremium).toFixed(2)?.replace(
                    /\d(?=(\d{3})+\.)/g,
                    "$&,",
                  )}
              </Typography>
            </CardContent>
            {hasChanges && (
              <Stack
                sx={{
                  p: 2,
                  bgcolor: "warning.main",
                }}
              >
                <Typography variant="body2">
                  <strong>Changes Detected</strong>
                </Typography>
              </Stack>
            )}
          </CardActionArea>
        </Card>
        <Dialog
          maxWidth="xl"
          fullWidth
          open={open}
          onClose={handleClose}
          aria-labelledby="Policy Data dialog"
          aria-describedby="Edit Policy Data dialog"
        >
          <DialogTitle>
            <Stack spacing={2} direction="row" alignItems="center">
              <PolicyIcon />
              <Typography variant="h6"> Change Policy Details</Typography>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Formik
              initialValues={{
                coverAmount: PolicyData?.coverAmount,
                policyInceptionDate: PolicyData?.policyInceptionDate,
                decemberInstallmentDayOfMonth:
                  PolicyData?.decemberInstallmentDayOfMonth,
                regularInstallmentDayOfMonth:
                  PolicyData?.regularInstallmentDayOfMonth,
                InstallmentPremium: PolicyData?.InstallmentPremium,
              }}
              onSubmit={(values) => {
                setPolicyData((prev) => {
                  return {
                    ...prev,
                    coverAmount: values.coverAmount,
                    policyInceptionDate: values.policyInceptionDate,
                    decemberInstallmentDayOfMonth:
                      values.decemberInstallmentDayOfMonth,
                    regularInstallmentDayOfMonth:
                      values.regularInstallmentDayOfMonth,
                  };
                });

                // Reset PolicyMembers if coverAmount changes
                if (values.coverAmount !== PolicyData.coverAmount) {
                  setPolicyMembers((prevMembers) =>
                    prevMembers.map((member) => ({
                      ...member,
                      CoverAmount: values.coverAmount, // Update coverAmount
                      MemberAction:
                        typeof member.MemberAction !== "undefined" &&
                        member.MemberAction > 0
                          ? member.MemberAction
                          : member.insuredLifestatus > 1
                          ? 0
                          : 2,
                      BenefitCode: null, // Clear BenefitCode
                      Premium: 0, // Reset Premium
                      BenefitDetail: null, // Clear BenefitDetail
                      Benefit: null, // Clear Benefit
                      benefitRuleItems: [], // Reset benefitRuleItems
                      CalculatedPremium: 0, // Reset CalculatedPremium
                    })),
                  );
                }

                handleClose();
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6">
                              Policy Inception
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            {coverAmountOptions?.length > 0 ? (
                              <>
                                <InputLabel id="demo-simple-select-label">
                                  Change Cover Amount
                                </InputLabel>
                                <Select
                                  disabled={noEdit}
                                  labelId="demo-simple-select-label"
                                  id="demo-simple-select"
                                  value={values.coverAmount}
                                  label="Change Cover Amount"
                                  onChange={(event) => {
                                    setFieldValue(
                                      "coverAmount",
                                      event.target.value,
                                    );
                                  }}
                                >
                                  {coverAmountOptions?.length > 0 ? (
                                    coverAmountOptions.map((option, index) => (
                                      <MenuItem key={index} value={option}>
                                        R {option}
                                      </MenuItem>
                                    ))
                                  ) : (
                                    <MenuItem disabled>
                                      No cover amounts available
                                    </MenuItem>
                                  )}
                                </Select>
                                <FormHelperText
                                  error={coverAmountOptions?.length === 0}
                                >
                                  {coverAmountOptions?.length > 0
                                    ? "Changing the Cover Amount will affect the Installment Premium. All benefits will be recalculated."
                                    : "No cover amounts are currently available for this policy."}
                                </FormHelperText>
                              </>
                            ) : (
                              <TextfieldWrapper
                                disabled
                                name="coverAmount"
                                label="Cover Amount"
                                value={"No cover amounts available"}
                                error={true}
                                helperText="Please contact support to add cover amounts."
                                sx={{
                                  "& .MuiInputBase-input": {
                                    color: "error.main",
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "error.main",
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                      borderColor: "error.main",
                                    },
                                  },
                                }}
                              />
                            )}
                          </FormControl>

                          {policyDataDiff.coverAmount && (
                            <DiffAlert
                              from={`R ${policyDataDiff.coverAmount.from}`}
                              to={`R ${policyDataDiff.coverAmount.to}`}
                            />
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <DateFieldWrapper
                            size="small"
                            disabled
                            name="policyInceptionDate"
                            label="Policy Inception Date"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6">Installments</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="InstallmentPremium"
                            id="outlined-start-adornment"
                            disabled
                            value={values.InstallmentPremium}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  R
                                </InputAdornment>
                              ),
                            }}
                          />

                          {policyDataDiff.InstallmentPremium && (
                            <DiffAlert
                              from={`R ${policyDataDiff.InstallmentPremium.from
                                .toFixed(2)
                                ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}`}
                              to={`R ${policyDataDiff.InstallmentPremium.to
                                .toFixed(2)
                                ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}`}
                            />
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel id="Regular Installment Day Of Month">
                              Regular Installment Day Of Month
                            </InputLabel>
                            <Select
                              disabled
                              labelId="Regular Installment Day Of Month"
                              label="Regular Installment Day Of Month"
                              value={values.regularInstallmentDayOfMonth}
                              onChange={(event) => {
                                setFieldValue(
                                  "regularInstallmentDayOfMonth",
                                  event.target.value,
                                );
                              }}
                            >
                              {days.map((day) => (
                                <MenuItem key={day} value={day}>
                                  {day}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel id="December Installment Day Of Month">
                              December Installment Day Of Month
                            </InputLabel>
                            <Select
                              disabled
                              labelId="December Installment Day Of Month"
                              label="December Installment Day Of Month"
                              value={values.decemberInstallmentDayOfMonth}
                              onChange={(event) => {
                                setFieldValue(
                                  "decemberInstallmentDayOfMonth",
                                  event.target.value,
                                );
                              }}
                            >
                              {days.map((day) => (
                                <MenuItem key={day} value={day}>
                                  {day}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                    <Button disabled={noEdit} type="submit" variant="contained">
                      Save
                    </Button>

                    {noEdit && (
                      <Alert severity="warning">
                        You do not have permission to edit this policy
                      </Alert>
                    )}
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    </>
  );
};

export default EditPolicyData;
