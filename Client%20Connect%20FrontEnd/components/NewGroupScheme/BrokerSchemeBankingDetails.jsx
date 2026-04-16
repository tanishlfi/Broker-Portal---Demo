import React, { useState, useEffect } from "react";
import { Button, Box, Chip, Stack, Typography } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import axios from "axios";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import { Form, Formik } from "formik";
import BrokerSchemeBankingDetailsModal from "components/FormComponents.jsx/AddBankingDetails";
import StepperButtons from "./StepperButtons";

const BrokerSchemeBankingDetails = () => {
  const router = useRouter();
  const accessToken = useToken();
  const [gridKey, setGridKey] = useState(0);

  const { id, newSchemeId, currentStep } = router.query;

  const brokerBankingDetails = useQuery(
    ["getBanking", newSchemeId],
    async () =>
      axios.get(`${nodeSa}/brokerscheme/banking/${newSchemeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    { enabled: accessToken ? true : false }
  );

  useEffect(() => {
    const handleResize = () => {
      setGridKey((prev) => prev + 1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onSuccessfulSubmit = () => {
    brokerBankingDetails.refetch();
  };

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

  if (brokerBankingDetails?.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Stack>
      <Typography variant="h5" style={{ fontSize: "20px" }} gutterBottom>
        Banking Details
      </Typography>
      <Stack spacing={2}>
        <BrokerSchemeBankingDetailsModal
          newSchemeId={newSchemeId}
          onSuccessfulSubmit={onSuccessfulSubmit}
        />

        <DataGridPremium
          key={gridKey}
          rows={brokerBankingDetails.data?.data?.data || []}
          columns={columns}
          autoHeight
        />
      </Stack>

      <Formik>
        <Form
          onSubmit={() => {
            router.push(
              `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${newSchemeId}?currentStep=${
                Number(currentStep) + 1
              }`
            );
          }}
        >
          <StepperButtons noSave />
        </Form>
      </Formik>
    </Stack>
  );
};
export default BrokerSchemeBankingDetails;
