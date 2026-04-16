import React, { useState } from "react";
import { Formik, Form } from "formik";
import useToken from "hooks/useToken";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useMutation, useQuery } from "react-query";
import AlertPopup from "components/Bits/AlertPopup";
import { Button, Grid } from "@mui/material";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";

import * as Yup from "yup";
import DateFieldWrapper from "components/FormComponents.jsx/DateFieldWrapper";
import StepperButtons from "./StepperButtons";
import { useRouter } from "next/router";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import SchemeFileUpload from "components/FormComponents.jsx/UploadQuotesFiles";
import DisplayFiles from "./DisplayFiles";
import { Card, CardHeader, CardContent } from "@mui/material";
import FileHandler from "./FileHandler";

const BrokerQuotes = ({ select }) => {
  const accessToken = useToken();
  const router = useRouter();
  const [errorMessage, setErrorMessages] = useState("");
  const { id, newSchemeId, currentStep } = router.query;

  const brokerDetails = useQuery(
    ["getBroker", newSchemeId],
    async () =>
      axios.get(`${nodeSa}/brokerscheme/roleplayer/${newSchemeId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    { enabled: !!newSchemeId && !!accessToken }
  );

  const GetDocuments = useQuery({
    queryKey: ["getDocuments", "Quotes"],
    queryFn: async () =>
      axios.get(
        `${nodeSa}/brokerscheme/file_upload/getFiles/${newSchemeId}/Quotes`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ),
    enabled: !!newSchemeId && !!accessToken,
  });

  const UploadDocument = useMutation({
    mutationFn: async (formData) =>
      axios.post(
        `${nodeSa}/brokerscheme/file_upload/${newSchemeId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      ),
    onSettled: () => {
      GetDocuments.refetch();
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id) =>
      axios.delete(`${nodeSa}/brokerscheme/file_upload/download/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    onSettled: () => {
      GetDocuments.refetch();
    },
  });

  const handleAxiosErrors = (error) => {
    let errorMessages = "An unknown error occurred";

    if (error.response) {
      errorMessages = error.response.data.message || errorMessages;
    } else if (error.request) {
      errorMessages = "No Response received from the server. Please try again";
    } else {
      errorMessages = error.message;
    }
    return errorMessages;
  };

  const submitBrokerSchemeRoleplayer = useMutation(
    (newBrokerSchemeRoleplayer) =>
      axios.post(
        `${nodeSa}/brokerscheme/roleplayer/${newSchemeId}`,
        newBrokerSchemeRoleplayer,
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

  const statusOptions = [
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
    { value: "Awaiting Feedback", label: "Awaiting Feedback" },
  ];

  const paymentMethodOptions = [
    { value: "Credit", label: "Credit" },
    { value: "Debit Order", label: "Debit Order" },
  ];

  const paymentFrequencyOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Annually", label: "Annually" },
  ];

  const onSuccessfulSubmit = () => {
    brokerDetails.refetch();
  };

  if (brokerDetails?.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AlertPopup
        severity={"success"}
        message={"Uploaded Successfully"}
        open={UploadDocument.isSuccess}
      />
      <AlertPopup
        severity={"success"}
        message={"form Submitted Successfully"}
        open={submitBrokerSchemeRoleplayer.isSuccess}
      />

      <AlertPopup
        severity={"error"}
        message={errorMessage}
        open={submitBrokerSchemeRoleplayer.isError}
      />

      <Formik
        initialValues={{
          id: brokerDetails.data?.data?.data?.id || "",
          ReferenceNo: brokerDetails.data?.data?.data?.ReferenceNo || "",
          ExpiryDate: brokerDetails.data?.data?.data?.ExpiryDate || "",
          GeneratedDate: brokerDetails.data?.data?.data?.GeneratedDate || "",
          Lives: brokerDetails.data?.data?.data?.Lives || "",
          Premium: brokerDetails.data?.data?.data?.Premium || "",
          status: brokerDetails.data?.data?.data?.status || "",
          CommissionFee: brokerDetails.data?.data?.data?.CommissionFee || "",
          ServiceFee: brokerDetails.data?.data?.data?.ServiceFee || "",
          BinderFee: brokerDetails.data?.data?.data?.BinderFee || "",
          PayDate: brokerDetails.data?.data?.data?.PayDate || "",
          PaymentMethod: brokerDetails.data?.data?.data?.PaymentMethod || "",
          PaymentFrequency:
            brokerDetails.data?.data?.data?.PaymentFrequency || "",
        }}
        validationSchema={Yup.object({
          ReferenceNo: Yup.string().required("Reference Number is required"),
          ExpiryDate: Yup.date().required("expiry date is required"),
          GeneratedDate: Yup.string().required("generated Date is required"),
          Lives: Yup.number()
            .typeError("Lives must be a number")
            .positive("Lives must be a positive number")
            .integer("Lives must be an integer")
            .required("Number of Lives is required"),
          Premium: Yup.number()
            .typeError("Premium must be a number")
            .positive("Premium must be a positive number")
            .required("Premium amount is required"),
          status: Yup.string()
            .required("Please select a status")
            .oneOf(
              ["Accepted", "Rejected", "Awaiting Feedback"],
              "Invalid status selected"
            ),
          CommissionFee: Yup.number()
            .typeError("Commission Fee must be a number")
            .positive("Commission Fee must be a positive number")
            .required("Commission Fee is required"),
          ServiceFee: Yup.number()
            .typeError("Service Fee must be a number")
            .positive("Service Fee must be a positive number")
            .required("Service Fee is required"),
          BinderFee: Yup.number()
            .typeError("Binder Fee must be a number")
            .positive("Binder Fee must be a positive number")
            .required("Binder Fee is required"),
          PayDate: Yup.date().required("Pay Date is required"),
          PaymentMethod: Yup.string().required("Payment Method is required"),
          PaymentFrequency: Yup.string().required(
            "Payment Frequency is required"
          ),
        })}
        enableReinitialize={true}
        onSubmit={(values) => {
          console.log("getting", values);
          submitBrokerSchemeRoleplayer.mutate(
            { ...values, newSchemeId },
            {
              onSuccess: (data) => {
                console.log("SUBMIT", data);
                router.push(
                  `/BrokerManager/SchemaManagement/${id}/CreateNewSchemeApplication/${newSchemeId}?currentStep=${
                    Number(currentStep) + 1
                  }`
                );
              },
            }
          );
        }}>
        {({ errors }) => {
          return (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} style={{ marginBottom: "20px" }}>
                  <FileHandler
                    title="Upload Quotes"
                    newSchemeId={newSchemeId}
                    DocumentType="Quotes"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="ReferenceNo"
                    label="Reference Number"
                  />
                </Grid>
                <Grid item xs={6}>
                  <SelectWrapper
                    name="status"
                    label="Status"
                    options={statusOptions}
                  />
                </Grid>

                <Grid item xs={6}>
                  <DateFieldWrapper
                    name="ExpiryDate"
                    label="Expiry Date"
                    format="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="Lives" label="Lives" />
                </Grid>
                <Grid item xs={6}>
                  <DateFieldWrapper
                    name="GeneratedDate"
                    label="Generated Date"
                    format="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="Premium" label="Premium" />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    name="CommissionFee"
                    label="Commission Fee"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="ServiceFee" label="Service Fee" />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper name="BinderFee" label="Binder Fee" />
                </Grid>
                <Grid item xs={6}>
                  <DateFieldWrapper
                    name="PayDate"
                    label="Pay Date"
                    format="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={6}>
                  <SelectWrapper
                    name="PaymentMethod"
                    label="Payment Method"
                    options={paymentMethodOptions}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SelectWrapper
                    name="PaymentFrequency"
                    label="Payment Frequency"
                    options={paymentFrequencyOptions}
                  />
                </Grid>
                <Grid item xs={12}></Grid>
              </Grid>

              <StepperButtons />
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default BrokerQuotes;
