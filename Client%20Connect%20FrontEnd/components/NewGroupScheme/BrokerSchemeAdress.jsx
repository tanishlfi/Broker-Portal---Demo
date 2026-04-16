import React, { useState, useEffect } from "react";
import { Button, Box, Stack, Typography } from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import BrokerSchemeHomeAddressModal from "components/FormComponents.jsx/AddBrokerSchemeAddress";
import { Form, Formik } from "formik";
import StepperButtons from "./StepperButtons";

const BrokerSchemeHomeAddress = () => {
  const router = useRouter();
  const accessToken = useToken();
  const [gridKey, setGridKey] = useState(0);

  const { id, newSchemeId, currentStep } = router.query;

  const brokerSchemeAddress = useQuery(
    ["getAddress", newSchemeId],
    async () =>
      axios.get(`${nodeSa}/brokerscheme/address/${newSchemeId}`, {
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
    brokerSchemeAddress.refetch();
  };

  const columns = [
    { field: "AddressLine1", headerName: "Address Line 1", flex: 1 },
    { field: "AddressLine2", headerName: "Address Line 2", flex: 1 },
    { field: "City", headerName: "City", flex: 1 },
    { field: "Province", headerName: "Province", flex: 1 },
    { field: "PostalCode", headerName: "Postal Code", flex: 1 },
    { field: "CreatedBy", headerName: "Created By", flex: 1 },
    {
      field: "createdAt",
      headerName: "Create At",
      flex: 1,
    },
  ];

  if (brokerSchemeAddress?.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Stack>
      <Typography variant="h6" gutterBottom>
        Client detail Address
      </Typography>
      <Stack spacing={2}>
        <BrokerSchemeHomeAddressModal
          newSchemeId={newSchemeId}
          onSuccessfulSubmit={onSuccessfulSubmit}
        />

        <DataGridPremium
          autoHeight
          key={gridKey}
          rows={brokerSchemeAddress?.data?.data?.data || []}
          columns={columns}
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
          }}>
          <StepperButtons noSave />
        </Form>
      </Formik>
    </Stack>
  );
};

export default BrokerSchemeHomeAddress;
