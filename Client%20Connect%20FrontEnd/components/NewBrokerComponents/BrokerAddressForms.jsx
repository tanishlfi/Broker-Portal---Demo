import React from "react";
import { Stack, Card, CardHeader, CardContent } from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";

import { DataGridPremium } from "@mui/x-data-grid-premium";

import { Form, Formik } from "formik";
import BrokerStepperButtons from "../NewBrokerComponents/FormComps/BrokerStepperButtons";
import AddressCaptureDialog from "./FormComps/AddressCaptureDialog";

const BrokerAddressForms = () => {
  const router = useRouter();
  const accessToken = useToken();

  const { id, newSchemeId, currentStep } = router.query;

  // const brokerSchemeAddress = useQuery(
  //   ["getAddress", newSchemeId],
  //   async () =>
  //     axios.get(`${nodeSa}/brokerscheme/address/${newSchemeId}`, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     }),
  //   { enabled: accessToken ? true : false }
  // );

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

  return (
    <Card>
      <CardHeader title={"Broker Addresses"} />

      <CardContent>
        <Stack sx={{ mb: 2 }}>
          <AddressCaptureDialog />
        </Stack>
        <Stack
          spacing={2}
          sx={{
            height: "40vh",
          }}>
          <DataGridPremium rows={[]} columns={columns} />
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
            <BrokerStepperButtons noSave />
          </Form>
        </Formik>
      </CardContent>
    </Card>
  );
};

export default BrokerAddressForms;
