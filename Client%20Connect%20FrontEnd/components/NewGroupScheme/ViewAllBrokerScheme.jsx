import React, { useState, Fragment } from "react";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "react-query";
import useToken from "hooks/useToken";
import {
  Paper,
  Grid,
  Stack,
  List,
  ListSubheader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
} from "@mui/material";
import {
  AllBrokkerSchama,
  BrokerStatus,
  QoutesStatus,
  BankingStatus,
} from "components/FormComponents.jsx/YupValidator";
import SchemecontentItem from "components/Containers/ConentItemScheme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ViewAllBrokerScheme = () => {
  const accessToken = useToken();
  const router = useRouter();
  const { id, newSchemeId, currentStep } = router.query;
  const [validationStatus, setValidateStatus] = useState({});

  const { data, isLoading, error, isError, isRefetching } = useQuery(
    "getAlldata",
    () =>
      axios.get(`${nodeSa}/brokerscheme/scheme/view/${newSchemeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: accessToken ? true : false,
    }
  );

  const submitBrokerDetails = useMutation((schemeResults) =>
    axios.post(`${nodeSa}/brokerscheme/scheme/${id}/broker`, schemeResults, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  );

  const handleNavigateStepper = (item, stepNumber) => {
    router.push(
      `/BrokerManager/SchemaManagement/${newSchemeId}/CreateNewSchemeApplication/${item.id}?currentStep=${stepNumber}`
    );
  };

  const stepMapping = {
    "Broker Details": 0,
    "Qoutes Details": 1,
    "Scheme Address Details": 2,
    "Scheme Banking Details": 3,
    "Documents Upload and Download": 4,
    "Scheme Notes": 5,
  };

  const handleSubmit = () => {
    if (allFieldsValid) {
      const schemeResults = {
        id: newSchemeId,
        status: "Processing",
      };

      submitBrokerDetails.mutate(schemeResults, {
        onSuccess: (data) => {
          router.push(`/BrokerManager/CreatedScheme/${id}`);
        },
        onError: (error) => {
          console.error("Error updating broker scheme status: ", error);
        },
      });
    }
  };

  const handleValidationChange = (fieldName, isValid) => {
    setValidateStatus((prevState) => ({ ...prevState, [fieldName]: isValid }));
  };

  const allFieldsValid = Object.values(validationStatus).every(Boolean);

  const allBrokerData = data?.data?.data;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {data?.data?.data || isRefetching ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {allBrokerData[0]?.status && (
              <>
                <Alert severity="info">{allBrokerData[0]?.status}</Alert>
              </>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Submit Scheme
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{ width: "100%" }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Broker Details
                </ListSubheader>
              }>
              {allBrokerData?.map((item, index) => (
                <Fragment key={index}>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Display Name"
                      value={item.DisplayName}
                      schema={AllBrokkerSchama.DisplayName}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Representative ID"
                      value={item.RepresentativeId}
                      schema={AllBrokkerSchama.RepresentativeId}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Product Option ID"
                      value={item.ProductOptionID}
                      schema={AllBrokkerSchama.ProductOptionID}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Company Type Id"
                      value={item.CompanyTypeId}
                      schema={AllBrokkerSchama.CompanyTypeId}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Id Number"
                      value={item.IdNumber}
                      schema={AllBrokkerSchama.IdNumber}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Cell Number"
                      value={item.CellNumber}
                      schema={AllBrokkerSchama.CellNumber}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Contact Number"
                      value={item.TellNumber}
                      schema={AllBrokkerSchama.TellNumber}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Email Address"
                      value={item.EmailAddress}
                      schema={AllBrokkerSchama.EmailAddress}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Vat Registration Number"
                      value={item.VatRegistrationNumber}
                      schema={AllBrokkerSchama.VatRegistrationNumber}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Join Date"
                      value={item.JoinDate}
                      schema={AllBrokkerSchama.JoinDate}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Status"
                      value={item.status}
                      schema={BrokerStatus.status}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                </Fragment>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{ width: "100%" }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Qoutes Details
                </ListSubheader>
              }>
              {allBrokerData[0]?.SchemeRoleplayers.map((item, index) => (
                <Fragment key={index}>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Reference Number"
                      value={item.ReferenceNo}
                      schema={AllBrokkerSchama.ReferenceNo}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Expiry Date"
                      value={item.ExpiryDate}
                      schema={AllBrokkerSchama.ExpiryDate}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Generated Date"
                      value={item.GeneratedDate}
                      schema={AllBrokkerSchama.GeneratedDate}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Lives"
                      value={item.Lives}
                      schema={AllBrokkerSchama.Lives}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Premium"
                      value={item.Premium}
                      schema={AllBrokkerSchama.Premium}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Status"
                      value={item.status}
                      schema={QoutesStatus.status}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Commission Fee"
                      value={item.CommissionFee}
                      schema={AllBrokkerSchama.CommissionFee}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Service Fee"
                      value={item.ServiceFee}
                      schema={AllBrokkerSchama.ServiceFee}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Binder Fee"
                      value={item.BinderFee}
                      schema={AllBrokkerSchama.BinderFee}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Pay Date"
                      value={item.PayDate}
                      schema={AllBrokkerSchama.PayDate}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                  <Stack direction="row">
                    <SchemecontentItem
                      title="Payment Method"
                      value={item.PaymentMethod}
                      schema={AllBrokkerSchama.PaymentMethod}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                    <SchemecontentItem
                      title="Payment Frequency"
                      value={item.PaymentFrequency}
                      schema={AllBrokkerSchama.PaymentFrequency}
                      onValidationChange={handleValidationChange}
                      isRequired={true}
                    />
                  </Stack>
                </Fragment>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{ width: "100%" }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Documents Upload and Download
                </ListSubheader>
              }>
              {allBrokerData[0]?.SchemeDocuments.map((item) => (
                <UploadDocuments key={item.id} item={item} />
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{ width: "100%" }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Scheme Address Details
                </ListSubheader>
              }>
              {allBrokerData[0]?.SchemeAddresses.map((item) => (
                <SchemeAddress key={item.id} item={item} />
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{ width: "100%" }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Scheme Banking Details
                </ListSubheader>
              }>
              {allBrokerData[0]?.SchemeBankingDetails.map((item) => (
                <SchemeBankingDeatils key={item.id} item={item} />
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{ width: "100%" }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}>
                  Scheme Notes
                </ListSubheader>
              }>
              {allBrokerData[0]?.SchemeNotes.map((item) => (
                <SchemeNotes key={item.id} item={item} />
              ))}
            </List>
          </Grid>
        </Grid>
      ) : (
        <p>Data Not Available...</p>
      )}
      {isError && <div>Error: {error.message}</div>}
    </>
  );
};

export default ViewAllBrokerScheme;

const SchemeAddress = ({ item, onValidationChange }) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${item.id}a-content`}
        id={`panel${item.id}a-header`}>
        <Stack direction="row" spacing={18}>
          <SchemecontentItem
            title="Address Line 1"
            value={item?.AddressLine1}
            schema={AllBrokkerSchama.AddressLine1}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
          <SchemecontentItem
            title="Address Line 1"
            value={item?.AddressLine2}
            schema={AllBrokkerSchama.AddressLine2}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: "background.default " }}>
        <Stack direction="row">
          <SchemecontentItem
            title="City"
            value={item?.City}
            schema={AllBrokkerSchama.City}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
          <SchemecontentItem
            title="Province"
            value={item?.Province}
            schema={AllBrokkerSchama.Province}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
        <Stack direction="row">
          <SchemecontentItem
            title="Postal Code"
            value={item?.PostalCode}
            schema={AllBrokkerSchama.PostalCode}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const SchemeBankingDeatils = ({ item, onValidationChange }) => {
  return (
    <Accordion>
      <AccordionSummary
        sx={{
          width: "100%",
        }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${item.id}a-content`}
        id={`panel${item.id}a-header`}>
        <Stack direction="row" spacing={18}>
          <SchemecontentItem
            title="Account Number"
            value={item?.AccountNumber}
            schema={AllBrokkerSchama.AccountNumber}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
          <SchemecontentItem
            title="Account Holder Name"
            value={item?.AccountHolderName}
            schema={AllBrokkerSchama.AccountHolderName}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: "background.default " }}>
        <Stack direction="row">
          <SchemecontentItem
            title="Bank Name"
            value={item?.BankName}
            schema={AllBrokkerSchama.BankName}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
          <SchemecontentItem
            title="ID Number"
            value={item?.idNumber}
            schema={AllBrokkerSchama.idNumber}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
        <Stack direction="row">
          <SchemecontentItem
            title="Branch Code"
            value={item?.BranchCode}
            schema={AllBrokkerSchama.BranchCode}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
          <SchemecontentItem
            title="Bank Account Type"
            value={item?.BankAccountType}
            schema={AllBrokkerSchama.BankAccountType}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
        <Stack direction="row">
          <SchemecontentItem
            title="Status"
            value={item?.status}
            schema={BankingStatus.status}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const UploadDocuments = ({ item, onValidationChange }) => {
  return (
    <Accordion>
      <AccordionSummary
        sx={{
          width: "100%",
        }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${item.id}a-content`}
        id={`panel${item.id}a-header`}>
        <Stack direction="row">
          <SchemecontentItem
            title="Original Name"
            value={item?.OriginalFileName}
            schema={AllBrokkerSchama.OriginalFileName}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
          <SchemecontentItem
            title="Document Type"
            value={item?.DocumentType}
            schema={AllBrokkerSchama.DocumentType}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: "background.default " }}>
        <Stack direction="row">
          <SchemecontentItem
            title="Document Name"
            value={item?.FileName}
            schema={AllBrokkerSchama.FileName}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
        <Stack>
          <SchemecontentItem
            title="Effective Date"
            value={item?.createdAt}
            schema={AllBrokkerSchama.createdAt}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const SchemeNotes = ({ item, onValidationChange }) => {
  return (
    <Accordion>
      <AccordionSummary
        sx={{
          width: "100%",
        }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${item.id}a-content`}
        id={`panel${item.id}a-header`}>
        <Stack direction="row">
          <SchemecontentItem
            title="Note"
            value={item?.note}
            schema={AllBrokkerSchama.note}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: "background.default " }}>
        <Stack direction="row">
          <SchemecontentItem
            title="Created By"
            value={item?.created_by}
            schema={AllBrokkerSchama.created_by}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
          <SchemecontentItem
            title="Active"
            value={item?.active ? "true" : "false"}
            schema={AllBrokkerSchama.active}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
        <Stack>
          <SchemecontentItem
            title="Created At"
            value={item?.createdAt}
            schema={AllBrokkerSchama.createdAt}
            onValidationChange={onValidationChange}
            isRequired={true}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
