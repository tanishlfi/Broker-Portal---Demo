import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import { useMutation } from "react-query";
import { Button, Grid, Stack, Typography } from "@mui/material";
import StepperButtons from "./StepperButtons";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import AddBrokerSchemeNotes from "components/FormComponents.jsx/AddBrokerSchemeNotes";

const BrokerSchemeNotes = () => {
  const router = useRouter();
  const accessToken = useToken();
  const [gridKey, setGridKey] = useState(0);
  const [rows, setRows] = useState([]);

  const { id, newSchemeId, currentStep } = router.query;

  const brokerSchemeNotes = useQuery(
    ["getNotes", newSchemeId],
    async () =>
      axios.get(`${nodeSa}/brokerscheme/scheme_notes/${newSchemeId}`, {
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
    console.log("On Successful Submit refresh");
  };

  console.log(brokerSchemeNotes?.data?.data?.data);

  const columns = [
    { field: "note", headerName: "Note Created", flex: 1 },
    { field: "active", headerName: "Note Active", width: 100 },
    { field: "created_by", headerName: "Created By", flex: 1 },
    { field: "createdAt", headerName: "Created At", width: 150 },
  ];

  if (brokerSchemeNotes?.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Stack>
      <Stack>
        <Typography variant="h5" style={{ fontSize: "20px" }} gutterBottom>
          Add Notes
        </Typography>

        <AddBrokerSchemeNotes newSchemeId={newSchemeId} />

        <DataGridPremium
          key={gridKey}
          rows={brokerSchemeNotes?.data?.data?.data || []}
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

export default BrokerSchemeNotes;
