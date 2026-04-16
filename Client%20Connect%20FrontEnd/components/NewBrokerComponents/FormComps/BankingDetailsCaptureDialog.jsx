import React, { useState } from "react";
import { Formik, Form } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useMutation } from "react-query";
import { Button, Grid, LinearProgress } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import AlertPopup from "components/Bits/AlertPopup";
import * as Yup from "yup";
import SelectBankBranch from "../../FormComponents.jsx/SelectBankBranch";
import SelectBankAccountTypes from "../../FormComponents.jsx/SelectBankAccountType";

const BankingDetailsCaptureDialog = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //   const addBankingDetails = useMutation((newBankingDetails) =>
  //     axios.post(
  //       `${nodeSa}/brokerscheme/scheme/${newSchemeId}/banking`,
  //       newBankingDetails,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     )
  //   );

  const initialValues = {
    AccountNumber: "",
    BankName: "",
    AccountHolderInitials: "",
    AccountHolderSurname: "",
    idNumber: "",
    BankBranchId: "",
    BankAccountType: "",
    BranchCode: "",
  };

  const validationSchema = Yup.object({
    AccountNumber: Yup.string()
      .min(9, "Account number should be at least 9 digits")
      .max(16, "Account number cannot have more than 16 digits")
      .matches(/^\d+$/, {
        message: "Account number should be only numbers",
      })
      .required("Account number is required"),
    BankName: Yup.string().required("Bank name is required"),
    AccountHolderInitials: Yup.string()
      .matches(
        /^[A-Za-z](\.[A-Za-z])*\.?$/,
        "Initials must be in the format J.P or M.D",
      )
      .required("Account initials are required"),
    AccountHolderSurname: Yup.string()
      .matches(/^[a-zA-Z]+$/, "Surname must only contain letters")
      .required("Account surname is required"),

    idNumber: Yup.string()
      .required("ID number is required")
      .matches(
        /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
        "SA Id Number seems to be invalid",
      ),
    BankAccountType: Yup.string().required("Account type is required"),
    BankBranchId: Yup.string().required("Bank branch ID is required"),
    BranchCode: Yup.string()
      .min(5, "Branch code should be at least 6 digits")
      .max(11, "Branch code cannot have more than 11 digits")
      .matches(/^\d+$/, { message: "Branch code should be only numbers" })
      .required("Branch code is required"),
  });

  const onSubmit = async (values, { resetForm }) => {
    console.log(values);
  };

  return (
    <div>
      <Button variant="contained" fullWidth onClick={handleClickOpen}>
        Add New Banking Details
      </Button>

      <Dialog maxWidth="lg" fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Add New Banking Details</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form>
                {isSubmitting && <LinearProgress />}
                <Grid container spacing={2} sx={{ my: 3 }}>
                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="AccountNumber"
                      label="Account Number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextfieldWrapper name="idNumber" label="ID Number" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="AccountHolderInitials"
                      label="Account Holder Initials"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="AccountHolderSurname"
                      label="Account Holder Surname"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <SelectBankBranch
                      setBrankBranch={(details) => {
                        if (details) {
                          setFieldValue("BankName", details.bankName);
                          setFieldValue("BankBranchId", details.bankId);
                          setFieldValue("BranchCode", details.branchCode);
                        } else {
                          setFieldValue("BankBranchId", "");
                          setFieldValue("BranchCode", "");
                          setFieldValue("BankName", "");
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <SelectBankAccountTypes
                      setAccountType={(details) => {
                        if (details) {
                          setFieldValue("BankAccountType", details);
                        } else {
                          setFieldValue("BankAccountType", "");
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="BranchCode" label="Branch Code" />
                  </Grid>
                </Grid>

                <DialogActions sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankingDetailsCaptureDialog;
