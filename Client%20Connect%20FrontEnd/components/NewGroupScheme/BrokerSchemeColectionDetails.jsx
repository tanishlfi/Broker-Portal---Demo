import React, { useState } from "react";
import { Formik, Form } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useMutation, useQuery } from "react-query";
import AlertPopup from "components/Bits/AlertPopup";
import { Grid, Stack } from "@mui/material";
import { useRouter } from "next/router";
import DateFieldWrapper from "components/FormComponents.jsx/DateFieldWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import * as Yup from "yup";
import StepperButtons from "./StepperButtons";
import AddBrokerSchemeNotes from "components/FormComponents.jsx/AddBrokerScemeNotes";

const BrokerSchemeCollectionDetails = () => {
  const accessToken = useToken();
  const router = useRouter();
  const [errorMessage, setErrorMessages] = useState("");

  const { id, newSchemeId, currentStep } = router.query;

  const brokerCollectionDetails = useQuery(
    ["getCollection", newSchemeId],
    async () =>
      axios.get(`${nodeSa}/brokerscheme/scheme/${newSchemeId}/details`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    { enabled: !!newSchemeId && !!accessToken }
  );

  console.log("brokerCollectionDetails", brokerCollectionDetails.data?.data);

  const handleAxiosErrors = (error) => {
    let errorMessages = "An unknown error occured";

    if (error.response) {
      errorMessages = error.response.data.message || errorMessages;
    } else if (error.request) {
      errorMessages = "No Response received from the server. Please try again";
    } else {
      errorMessages = error.message;
    }
    return errorMessages;
  };

  const submitBrokerSchemeDetails = useMutation(
    (newBrokerSchemeDetails) =>
      axios.post(
        `${nodeSa}/brokerscheme/scheme/${newSchemeId}/details`,
        newBrokerSchemeDetails,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      onError: (error) => {
        const errorMessages = handleAxiosErrors(error);
        setErrorMessages(errorMessages);
      },
    }
  );

  if (brokerCollectionDetails?.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AlertPopup
        severity={"success"}
        message="Form Submitted Successfully"
        open={submitBrokerSchemeDetails.isSuccess}
      />

      <AlertPopup
        severity={"error"}
        message={errorMessage}
        open={submitBrokerSchemeDetails.isError}
      />

      <Formik
        initialValues={{
          id: brokerCollectionDetails.data?.data?.data?.id || "",
          commission_fee_percentage:
            brokerCollectionDetails.data?.data?.data
              ?.commission_fee_percentage || "",
          service_fee_percentage:
            brokerCollectionDetails.data?.data?.data?.service_fee_percentage ||
            "",
          binder_fee_percentage:
            brokerCollectionDetails.data?.data?.data?.binder_fee_percentage ||
            "",
          qoute_date:
            brokerCollectionDetails.data?.data?.data?.qoute_date || "",
          qoute_id: brokerCollectionDetails.data?.data?.data?.qoute_id || "",
          lives: brokerCollectionDetails.data?.data?.data?.lives || "",
          premium: brokerCollectionDetails.data?.data?.data?.premium || "",
          qoute_status:
            brokerCollectionDetails.data?.data?.data?.qoute_status || "",
        }}
        validationSchema={Yup.object({
          commission_fee_percentage: Yup.string().required("Required"),
          service_fee_percentage: Yup.string().required("Required"),
          binder_fee_percentage: Yup.string().required("Required"),
          qoute_date: Yup.string().required("Required"),
          qoute_id: Yup.string().required("Required"),
          lives: Yup.string().required("Required"),
          premium: Yup.string().required("Required"),
          qoute_status: Yup.string().required("Required"),
        })}
        enableReinitialize={true}
        onSubmit={(values) => {
          submitBrokerSchemeDetails.mutate(
            { ...values, newSchemeId },
            {
              onSuccess: (data) => {
                router.push(
                  `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${newSchemeId}?currentStep=${
                    Number(currentStep) + 1
                  }`
                );
              },
            }
          );
        }}
      >
        {({ errors }) => {
          return (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="commission_fee_percentage"
                    label="Commission Fee Percentage"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="service_fee_percentage"
                    label="Service Fee Percentage"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="binder_fee_percentage"
                    label="Binder Fee Percentage"
                  />
                </Grid>
                <Grid item xs={6}>
                  <DateFieldWrapper
                    name="qoute_date"
                    label="Qoute Date"
                    format="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="qoute_id" label="Qoute ID" />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="lives" label="Lives" />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="premium" label="Premium" />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="qoute_status" label="Qoute Status" />
                </Grid>
              </Grid>

              <StepperButtons />
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default BrokerSchemeCollectionDetails;
