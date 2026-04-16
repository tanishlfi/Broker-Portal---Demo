import React, { useEffect, useState } from "react";
import { Formik, Form, useField, useFormikContext } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import { rmaAPI } from "src/AxiosParams";
import { useQuery } from "react-query";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import AlertPopup from "components/Bits/AlertPopup";
import * as Yup from "yup";
import DateFieldWrapper from "../../../../components/FormComponents.jsx/DateFieldWrapper";
import DiffAlert from "../../../../components/FormComponents.jsx/DiffAlert";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// Rules that govern the debit order date - during onboarding and policy amendments banking details

// The banking changes need to be actioned 5 days before the debit date.

// Debit order dates can be changed  before the 25th and Life OPS will inform the collections team of the change to reduce the risk of us double debiting the client

// Debit orders run daily and are actioned on the collections team side.

// The clients specify on the debit order mandate which date they would like to be be debited in December.

// Effective date : its the date that the updates/amendments should take effect.

const BankingDetailsModal = ({
  bankingDetails,
  setBankingDetails,
  diff,
  PolicyData,
}) => {
  const accessToken = useToken();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessages] = useState("");

  //   /clc/api/RolePlayer/RolePlayer/GetBankingDetailsByRolePlayerId/:id

  const handleClickOpen = () => {
    setOpen(true);
    setErrorMessages("");
  };

  const handleClose = () => {
    setOpen(false);
    setErrorMessages("");
  };

  const validationSchema = Yup.object({
    accountNumber: Yup.string()
      .min(9, "Account number should be at least 9 digits")
      .max(16, "Account number cannot have more than 16 digits")
      .matches(/^\d+$/, {
        message: "Account number should be only numbers",
      })
      .required("Account number is required"),
    bankName: Yup.string().required("Bank name is required"),
    accountHolderInitials: Yup.string()
      .matches(
        /^[A-Za-z](\.[A-Za-z])*\.?$/,
        "Initials must be in the format J.P or M.D",
      )
      .required("Account initials are required"),

    accountHolderIdNumber: Yup.string()
      .required("ID number is required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid",
      ),
    bankAccountType: Yup.string().required("Account type is required"),
    bankBranchId: Yup.string().required("Bank branch ID is required"),
    branchCode: Yup.string()
      .min(5, "Branch code should be at least 6 digits")
      .max(11, "Branch code cannot have more than 11 digits")
      .matches(/^\d+$/, { message: "Branch code should be only numbers" })
      .required("Branch code is required"),
  });

  const onSubmit = async (values, { resetForm }) => {
    setBankingDetails(values);
    setOpen(false);
  };

  let hasChanges = diff ? Object.keys(diff).length > 0 : false;

  return (
    <div>
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
            <AccountBalanceIcon />
            <Typography variant="h6">Change Banking Details</Typography>
            <Typography variant="body2">Payment Method:</Typography>
            <Typography variant="body2" color="primary">
              {PolicyData?.paymentMethodDetails?.name}
            </Typography>
          </CardContent>
        </CardActionArea>
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
      </Card>

      <Dialog maxWidth="xl" fullWidth open={open} onClose={handleClose}>
        <DialogTitle>
          <Stack spacing={2} direction="row" alignItems="center">
            <AccountBalanceIcon />
            <Typography variant="h6">Change Banking Details</Typography>
          </Stack>
        </DialogTitle>
        <Divider sx={{ mb: 1 }} />

        <DialogContent>
          <AlertPopup
            severity={"error"}
            message={errorMessage}
            open={!!errorMessage}
          />

          <Formik
            initialValues={bankingDetails}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={onSubmit}
          >
            {({ errors }) => {
              return (
                <Form>
                  {/* {isSubmitting && <LinearProgress />} */}
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6">
                              Personal Details
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={6}>
                          <DateFieldWrapper
                            size="small"
                            name="effectiveDate"
                            label="Effective Date"
                          />
                          {/* {diff?.effectiveDate && (
                            <DiffAlert
                              from={diff.effectiveDate.from}
                              to={diff.effectiveDate.to}
                            />
                          )} */}
                        </Grid>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="accountNumber"
                            label="Account Number"
                          />
                          {diff?.accountNumber && (
                            <DiffAlert
                              from={diff.accountNumber.from}
                              to={diff.accountNumber.to}
                            />
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="accountHolderIdNumber"
                            label="Account Holder ID Number"
                          />
                          {diff?.accountHolderIdNumber && (
                            <DiffAlert
                              from={diff.accountHolderIdNumber.from}
                              to={diff.accountHolderIdNumber.to}
                            />
                          )}
                        </Grid>

                        {/* <Grid item xs={12}>
                          <RolePlayer
                            idNumber={bankingDetails.accountHolderIdNumber}
                          />
                        </Grid> */}

                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="accountHolderInitials"
                            label="Account Holder Initials"
                          />
                          {diff?.accountHolderInitials && (
                            <DiffAlert
                              from={diff.accountHolderInitials.from}
                              to={diff.accountHolderInitials.to}
                            />
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="accountHolderLastName"
                            label="Account Holder Last Name"
                          />
                          {diff?.accountHolderLastName && (
                            <DiffAlert
                              from={diff.accountHolderLastName.from}
                              to={diff.accountHolderLastName.to}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6">Bank Details</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12}>
                          <SelectBankBranch
                            name="bankBranchId"
                            label="Select Bank"
                          />
                          {diff?.initials && (
                            <DiffAlert
                              from={diff.bankBranchId.from}
                              to={diff.bankBranchId.to}
                            />
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="bankName"
                            label="Bank Name"
                          />
                          {diff?.bankName && (
                            <DiffAlert
                              from={diff.bankName.from}
                              to={diff.bankName.to}
                            />
                          )}
                        </Grid>

                        <Grid item xs={6}>
                          <SelectBankAccountTypes
                            size="small"
                            name="bankAccountType"
                            label="Bank Account Type"
                          />
                          {diff?.bankAccountType && (
                            <DiffAlert
                              from={diff.bankAccountType.from}
                              to={diff.bankAccountType.to}
                            />
                          )}
                        </Grid>

                        <Grid item xs={6}>
                          <TextfieldWrapper
                            size="small"
                            name="branchCode"
                            label="Branch Code"
                          />
                          {diff?.branchCode && (
                            <DiffAlert
                              from={diff.branchCode.from}
                              to={diff.branchCode.to}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <DialogActions sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="large"
                      variant="contained"
                      color="primary"
                      type="submit"
                    >
                      Save
                    </Button>
                  </DialogActions>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankingDetailsModal;

const getBackAccountTypes = (accessToken) => {
  return axios.get(`${rmaAPI}/mdm/api/BankAccountType`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const SelectBankAccountTypes = ({ name }) => {
  const accessToken = useToken();

  const [field, meta] = useField(name);

  const { setFieldValue } = useFormikContext();

  const [value, setValue] = useState(null);

  const { data, isLoading, isError, error } = useQuery(
    "getAccountTypes",
    () => getBackAccountTypes(accessToken),
    { enabled: !!accessToken },
  );

  useEffect(() => {
    if (data?.data) {
      const defaultValue = data.data.find((item) => item.id === field.value);
      setValue(defaultValue || null);
    }
  }, [data?.data, field.value]);

  return (
    <>
      {isError && <Alert severity="error">Error Loading ID Types</Alert>}
      {isLoading ? (
        <Skeleton variant="rectangular" height={50} />
      ) : (
        <>
          <Autocomplete
            size="small"
            id="SelectBankAccountType"
            value={value || ""}
            options={data?.data || []}
            getOptionLabel={(option) => option.name || ""}
            onChange={(event, newValue) => {
              setValue(newValue);
              setFieldValue(name, newValue?.id || ""); // Update Formik value
            }}
            renderInput={(params) => (
              <TextField
                size="small"
                {...params}
                label="Bank Account Type"
                variant="outlined"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
              />
            )}
          />
        </>
      )}
    </>
  );
};

const getBankBranches = (accessToken) => {
  return axios.get(`${rmaAPI}/mdm/api/BankBranch`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const SelectBankBranch = ({ name }) => {
  const accessToken = useToken();

  const [field, meta] = useField(name);

  const { setFieldValue } = useFormikContext();

  const [value, setValue] = useState(null);

  const { data, isLoading, isError, error } = useQuery(
    "SelectBankBranch",
    () => getBankBranches(accessToken),
    { enabled: !!accessToken },
  );

  useEffect(() => {
    if (data?.data) {
      const defaultValue = data.data.find((item) => item.id === field.value);
      setValue(defaultValue || null);
    }
  }, [data?.data, field.value]);

  return (
    <>
      {isError && <Alert severity="error">Error Loading ID Types</Alert>}
      {isLoading ? (
        <Skeleton variant="rectangular" height={50} />
      ) : (
        <>
          <Autocomplete
            size="small"
            id="SelectBankBranch"
            value={value || ""}
            options={data?.data || []}
            getOptionLabel={(option) => {
              return `${option?.bank?.name} - Type : ${option.name} - Branch Code ${option.code}`;
            }}
            onChange={(event, newValue) => {
              setValue(newValue);
              setFieldValue(name, newValue?.id || ""); // Update Formik value
              setFieldValue("bankName", newValue?.bank?.name || ""); // Update Formik value
              setFieldValue("branchCode", newValue?.code || ""); // Update Formik value
            }}
            renderInput={(params) => (
              <TextField
                size="small"
                {...params}
                label="Bank Branch"
                variant="outlined"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
              />
            )}
          />
        </>
      )}
    </>
  );
};

const RolePlayer = ({ idNumber }) => {
  const accessToken = useToken();

  const getRolePlayerByIdNumber = useQuery(["rulePlayer", idNumber], () => {
    return axios.get(
      `${rmaAPI}/clc/api/RolePlayer/RolePlayer/GetRolePlayerByIdNumber/${idNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  });

  // const getBankingDetailsByRolePlayerId = useQuery(
  //   ["RolePlayBank", idNumber],
  //   () => {
  //     return axios.get(
  //       `${rmaAPI}/clc/api/RolePlayer/RolePlayer/GetBankingDetailsByRolePlayerId/${id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );
  //   }
  // );

  if (getRolePlayerByIdNumber.isLoading)
    return <Skeleton variant="rectangular" height={50} />;

  return <>{JSON.stringify(getRolePlayerByIdNumber.data)}</>;
};
