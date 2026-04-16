import React from "react";
import { Form, Formik, useFormikContext } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";
import useToken from "hooks/useToken";
import BrokerStepperButtons from "./FormComps/BrokerStepperButtons";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import ContentItem from "../Containers/ContentItem";
const BrokerFrom = ({ brokerUserId }) => {
  const router = useRouter();

  const { id, currentStep } = router.query;

  const accessToken = useToken();

  const getBrokerageDetails = useQuery(
    ["GetBrokerageDetails", id],
    () =>
      axios.get(`${nodeSa}/brokerage/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  let brokerDetails = getBrokerageDetails?.data?.data?.data;

  console.log("brokerDetails", brokerDetails);

  return (
    <Card>
      <CardHeader
        title="Broker Details"
        subheader="Enter the details of the broker"
        action={<Chip label={brokerDetails?.brokerageStatus} />}
      />
      <CardContent>
        <Formik
          initialValues={{
            brokerUserId: id,
            FSPNumber: brokerDetails?.FSPNumber || "",
            TradeName: brokerDetails?.TradeName || "",
            LegalCapacity: brokerDetails?.LegalCapacity || "",
            RegNo: brokerDetails?.RegNo || "",
            Status: brokerDetails?.Status || "",
            CompanyType: brokerDetails?.CompanyType || "",
            FaxNo: brokerDetails?.FaxNo || "",
            TelNo: brokerDetails?.TelNo || "",
            FspWebsite: brokerDetails?.FspWebsite || "",
            FinYearEnd: brokerDetails?.FinYearEnd || "",
            MedicalAccreditationNo: brokerDetails?.MedicalAccreditationNo || "",
            IsActive: brokerDetails?.IsActive || "",
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            console.log(values);
          }}>
          {({ values, setFieldValue }) => {
            return (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">1. FSP</Typography>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="FSPNumber" label="FSP Number" />
                  </Grid>

                  <Grid item xs={2}>
                    <Button variant="contained" color="primary">
                      Request FSP Details
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body1">
                          FSP Return Details
                        </Typography>
                        <Grid container>
                          <Grid item xs={6}>
                            <ContentItem
                              title="FSP Number"
                              value={brokerDetails?.FSPNumber}
                            />
                            <ContentItem
                              title="FSP Name"
                              value={"Company Name"}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <ContentItem
                              title="Registration Number"
                              value={"2016/4924343/07"}
                            />
                            <ContentItem
                              title="Date Authorised"
                              value={new Date().toLocaleDateString()}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">2. Details</Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="TradeName" label="Trade Name" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="LegalCapacity"
                      label="Legal Capacity"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="RegNo" label="Reg No" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="Status" label="Status" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="CompanyType" label="Company Type" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="FaxNo" label="Fax No" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="TelNo" label="Tel No" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="FspWebsite" label="Fsp Website" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper name="FinYearEnd" label="Fin Year End" />
                  </Grid>

                  <Grid item xs={6}>
                    <TextfieldWrapper
                      name="MedicalAccreditationNo"
                      label="Medical Accreditation No"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="h6">
                              3. Compliance Officer
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="ComplianceOfficerName"
                              label="Name"
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="PracticeName"
                              label="Practice Name"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="TelNo"
                              label="TelNo"
                              type="number"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="TelNo"
                              label="TelNo"
                              type="date"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="h6">
                              4. Contact Person
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper name="Title" label="Title" />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="ContactPersonName"
                              label="Contact Person Name"
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="ContactSurname"
                              label="Contact Surname"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="ContactNumber"
                              label="Contact Number"
                              type="number"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextfieldWrapper
                              name="Email"
                              label="Email"
                              type="email"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <BrokerStepperButtons />
              </Form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default BrokerFrom;
