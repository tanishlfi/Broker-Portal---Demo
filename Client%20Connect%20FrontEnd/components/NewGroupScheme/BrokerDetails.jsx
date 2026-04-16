import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import AlertPopup from "components/Bits/AlertPopup";
import { Form, Formik } from "formik";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import * as Yup from "yup";
import StepperButtons from "./StepperButtons";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import SetCompanyIdType from "components/FormComponents.jsx/SetCompanyIdType";
import DateFieldWrapper from "components/FormComponents.jsx/DateFieldWrapper";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import { Divider } from "@mui/material";
import Typography from "@mui/material/Typography";
import SelectRepresentative from "../FormComponents.jsx/SelectRepresentative";
import SelectSchemeProductOption from "../FormComponents.jsx/SelectSchemeProductOption";

const BrokerDetails = ({ select }) => {
  const accessToken = useToken();
  const router = useRouter();
  const [client, setClientTypes] = useState(null);
  const [idTypes, setIdTypes] = useState(null);

  const { newSchemeId, currentStep } = router.query;

  const brokerScheme = useQuery(
    ["getScheme", newSchemeId],
    async () =>
      axios.get(`${nodeSa}/brokerscheme/scheme/${newSchemeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!newSchemeId && !!accessToken,
    }
  );

  useEffect(() => {
    if (brokerScheme.data?.data?.data?.RolePlayerIdentificationTypeId) {
      setIdTypes(brokerScheme.data?.data?.data?.RolePlayerIdentificationTypeId);
    }
    if (brokerScheme.data?.data?.data?.ClientTypeID) {
      setClientTypes(brokerScheme.data?.data?.data?.ClientTypeID);
    }
  }, [brokerScheme.data]);

  const [errorMessage, setErrorMessages] = useState("");
  const { id } = router.query;

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

  const submitBrokerDetails = useMutation(
    (newBrokerDetails) =>
      axios.post(
        `${nodeSa}/brokerscheme/scheme/${id}/broker`,
        newBrokerDetails,
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

  if (brokerScheme?.isLoading) {
    return <div>Loading...</div>;
  }

  const getProductOptionID = brokerScheme?.data?.data?.data?.ProductOptionID;

  console.log(brokerScheme.data?.data?.data?.RepresentativeId);

  return (
    <>
      <Formik
        initialValues={{
          id: brokerScheme?.data?.data?.data?.id || "",
          DisplayName: brokerScheme.data?.data?.data?.DisplayName || "",

          RepresentativeId:
            brokerScheme.data?.data?.data?.RepresentativeId || "",

          ClientTypeID: brokerScheme.data?.data?.data?.ClientTypeID || "1",
          CompanyTypeId: brokerScheme.data?.data?.data?.CompanyTypeId || "",
          RolePlayerIdentificationTypeId:
            brokerScheme.data?.data?.data?.RolePlayerIdentificationTypeId ||
            "1",
          IdNumber: brokerScheme.data?.data?.data?.IdNumber || "",
          CellNumber: brokerScheme.data?.data?.data?.CellNumber || "",
          TellNumber: brokerScheme.data?.data?.data?.TellNumber || "",

          ProductOptionID: brokerScheme.data?.data?.data?.ProductOptionID || "",
          EmailAddress: brokerScheme.data?.data?.data?.EmailAddress || "",
          VatRegistrationNumber:
            brokerScheme.data?.data?.data?.VatRegistrationNumber || "",
          JoinDate: brokerScheme.data?.data?.data?.JoinDate || "",
          status: brokerScheme.data?.data?.data?.status || "",
        }}
        validationSchema={Yup.object({
          DisplayName: Yup.string()
            .required("The Display Name is required")
            .max(50, "Display Name cannot be longer than 50 characters"),
          CompanyTypeId: Yup.number()
            .required("Company Type ID is required")
            .positive("Company Type ID must be a positive number")
            .integer("Company Type ID must be an integer"),

          IdNumber: Yup.string()
            .required("ID number is required")
            .matches(
              /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
              "SA Id Number seems to be invalid"
            ),
          CellNumber: Yup.string()
            .transform((value) => value.replace(/\D/g, "")) // Remove non-digit characters before validation
            .matches(
              /^0[6-8]\d{8}$/,
              "Mobile phone number must be 10 digits long and start with 06, 07 or 08"
            )
            .required("Cellphone number is required"),
          TellNumber: Yup.string()
            .transform((value) => value.replace(/\D/g, "")) // Remove non-digit characters before validation
            .matches(
              /^0\d{9}$/,
              "Must be a valid South African TellNumber number"
            )
            .required("Tell Number number is required"),

          EmailAddress: Yup.string().required("Email Address is required"),
          VatRegistrationNumber: Yup.string()
            .required("Vat Registration Number is required")
            .matches(
              /^4\d{9}$/,
              "Vat Registration Number must be a valid South African VAT number (Starts with 4 and is 10 digits long)"
            ),
          JoinDate: Yup.string().required("Join Date is required"),
        })}
        enableReinitialize={true}
        onSubmit={(values) => {
          submitBrokerDetails.mutate(
            {
              ...values,
              BrokerageId: id,
            },
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
        }}>
        {({ errors, values, setFieldValue }) => {
          return (
            <Form>
              <Grid sx={{ mt: 2 }} container spacing={2}>
                <Grid item xs={6}>
                  <SelectRepresentative
                    setSelect={(value) => {
                      setFieldValue("RepresentativeId", value);
                    }}
                    id={id}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextfieldWrapper
                    label="Display Name (Scheme Name)"
                    name="DisplayName"
                  />
                </Grid>

                <Grid item xs={6}>
                  <SelectSchemeProductOption
                    select={values?.ProductOptionID || ""}
                    setSelectOptions={(value) => {
                      setFieldValue("productOption", value);
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <SetCompanyIdType
                    setFieldValue={setFieldValue}
                    select={values.CompanyTypeId}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper
                    label="VAT Number"
                    name="VatRegistrationNumber"
                  />
                </Grid>
                <Grid item xs={6}>
                  <DateFieldWrapper
                    name="JoinDate"
                    label="Join Date"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper label="Status" name="status" />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="h6">Policy Owner</Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper label="ID Number" name="IdNumber" />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper label="Mobile Number" name="CellNumber" />
                </Grid>
                <Grid item xs={6}>
                  <TextfieldWrapper label="Tell Number" name="TellNumber" />
                </Grid>

                <Grid item xs={6}>
                  <TextfieldWrapper label="Email Address" name="EmailAddress" />
                </Grid>
              </Grid>
              <StepperButtons />
            </Form>
          );
        }}
      </Formik>
      <AlertPopup
        severity="success"
        message="Form Submitted Successfully"
        open={submitBrokerDetails.isSuccess}
      />

      <AlertPopup
        severity="error"
        message={errorMessage}
        open={!!errorMessage}
      />
    </>
  );
};

export default BrokerDetails;
