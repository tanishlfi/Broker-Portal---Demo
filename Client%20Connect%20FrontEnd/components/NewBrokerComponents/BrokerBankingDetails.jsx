import React from "react";
import BrokerStepperButtons from "./FormComps/BrokerStepperButtons";
import { Form, Formik } from "formik";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import BankingDetailsCaptureDialog from "./FormComps/BankingDetailsCaptureDialog";

const BrokerBankingDetails = () => {
  const columns = [
    { field: "AccountNumber", headerName: "Account Number", flex: 1 },
    { field: "AccountHolderName", headerName: "Account Holder", flex: 1 },
    { field: "BankName", headerName: "Bank Name", flex: 1 },
    { field: "BankAccountType", headerName: "Bank Account Type", flex: 1 },
    { field: "BranchCode", headerName: "Branch Code", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
  ];

  return (
    <Card>
      <CardHeader title={"Broker Banking Details"} />

      <CardContent>
        <Stack sx={{ mb: 2 }}>
          <BankingDetailsCaptureDialog />
        </Stack>
        <Stack
          spacing={2}
          sx={{
            height: "40vh",
          }}>
          <DataGridPremium rows={[]} columns={columns} />
        </Stack>
        <Formik>
          <Form>
            <BrokerStepperButtons noSave />
          </Form>
        </Formik>
      </CardContent>
    </Card>
  );
};

export default BrokerBankingDetails;
