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
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import {
  AllBrokkerSchama,
  BrokerStatus,
  QoutesStatus,
  BankingStatus,
} from "components/FormComponents.jsx/YupValidator";
import SchemecontentItem from "components/Containers/ConentItemScheme";
import PageHeader from "components/Bits/PageHeader";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddBrokerSchemeNotes from "components/FormComponents.jsx/AddBrokerScemeNotes";

const AuditScheme = () => {
  const accessToken = useToken();
  const router = useRouter();
  const { id } = router.query;
  const [validationStatus, setValidateStatus] = useState({});

  const { data, isLoading, error, isError, isFetching } = useQuery(
    "getSchemeById",
    async () => {
      return await axios.get(`${nodeSa}/brokerscheme/scheme/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
    }
  );

  console.log("getting the id: ", id);
  console.log("getting the data: ", data);

  const submitBrokerDetails = useMutation((schemeResults) =>
    axios.put(`${nodeSa}/brokerscheme/scheme/${id}`, schemeResults, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  );

  const handleSubmit = () => {
    console.log("Submitted successfully");

    if (allFieldsValid) {
      const schemeApproval = {
        status: "Submitted",
      };

      submitBrokerDetails.mutate(schemeApproval, {
        onSuccess: () => {
          router.push(`/BrokerManager/CreatedScheme`);
        },
        onError: (error) => {
          console.error("Error updating broker scheme status: ", error);
        },
      });
    } else {
      console.log("Validation failed. Not submitting.");
    }
  };

  const handleRejct = () => {
    console.log("Scheme rejected");
    if (allFieldsValid) {
      const schemeApproval = {
        status: "Draft",
      };

      submitBrokerDetails.mutate(schemeApproval, {
        onSuccess: () => {
          router.push(`/BrokerManager/CreatedScheme`);
        },
        onError: (error) => {
          console.error("Error updating broker scheme status: ", error);
        },
      });
    } else {
      console.log("Validation failed. Not submitting.");
    }
  };

  const handleValidationChange = (fieldName, isValid) => {
    setValidateStatus((prevState) => ({ ...prevState, [fieldName]: isValid }));
  };

  const allFieldsValid = Object.values(validationStatus).every(Boolean);

  console.log("Current Validation Status:", validationStatus);
  console.log("Are all fields valid?", allFieldsValid);

  const allBrokerData = data?.data?.data;

  return (
    <>
      <PageHeader
        title="User Scheme"
        subTitle="Manage Scheme"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "BrokerManager",
            href: `BrokerManager`,
          },
          {
            title: `View Created Scheme`,
            href: `/BrokerManager/CreatedScheme/`,
          },
        ]}
      />
      {(isLoading || isFetching) && <LinearProgress />}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <List
            dense
            sx={{ width: "100%" }}
            subheader={
              <ListSubheader
                color="inherit"
                variant="outlined"
                component={Paper}
              >
                Broker Details
              </ListSubheader>
            }
          >
            <Stack direction="row">
              <SchemecontentItem
                title="Display Name"
                value={allBrokerData?.DisplayName}
                schema={AllBrokkerSchama.DisplayName}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
              <SchemecontentItem
                title="Representative ID"
                value={allBrokerData?.RepresentativeId}
                schema={AllBrokkerSchama.RepresentativeId}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
            </Stack>
            <Stack direction="row">
              <SchemecontentItem
                title="Company Type Id"
                value={allBrokerData?.CompanyTypeId}
                schema={AllBrokkerSchama.CompanyTypeId}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
              <SchemecontentItem
                title="Product Option ID"
                value={allBrokerData?.ProductOptionID}
                schema={AllBrokkerSchama.ProductOptionID}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
            </Stack>
            <Stack direction="row">
              <SchemecontentItem
                title="Id Number"
                value={allBrokerData?.IdNumber}
                schema={AllBrokkerSchama.IdNumber}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
              <SchemecontentItem
                title="Cell Number"
                value={allBrokerData?.CellNumber}
                schema={AllBrokkerSchama.CellNumber}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
            </Stack>
            <Stack direction="row">
              <SchemecontentItem
                title="Contact Number"
                value={allBrokerData?.TellNumber}
                schema={AllBrokkerSchama.TellNumber}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
              <SchemecontentItem
                title="Email Address"
                value={allBrokerData?.EmailAddress}
                schema={AllBrokkerSchama.EmailAddress}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
            </Stack>
            <Stack direction="row">
              <SchemecontentItem
                title="Vat Registration Number"
                value={allBrokerData?.VatRegistrationNumber}
                schema={AllBrokkerSchama.VatRegistrationNumber}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
              <SchemecontentItem
                title="Join Date"
                value={allBrokerData?.JoinDate}
                schema={AllBrokkerSchama.JoinDate}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
            </Stack>
            <Stack direction="row">
              <SchemecontentItem
                title="Status"
                value={allBrokerData?.status}
                schema={BrokerStatus.status}
                onValidationChange={handleValidationChange}
                isRequired={true}
              />
            </Stack>
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
                component={Paper}
              >
                Qoutes Details
              </ListSubheader>
            }
          >
            {allBrokerData?.SchemeRoleplayers.map((item, index) => (
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
                component={Paper}
              >
                Documents Upload and Download
              </ListSubheader>
            }
          >
            {allBrokerData?.SchemeDocuments.map((item) => (
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
                component={Paper}
              >
                Scheme Address Details
              </ListSubheader>
            }
          >
            {allBrokerData?.SchemeAddresses.map((item) => (
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
                component={Paper}
              >
                Scheme Banking Details
              </ListSubheader>
            }
          >
            {allBrokerData?.SchemeBankingDetails.map((item) => (
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
                component={Paper}
              >
                Scheme Notes
              </ListSubheader>
            }
          >
            {allBrokerData?.SchemeNotes.map((item) => (
              <SchemeNotes key={item.id} item={item} />
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction="row">
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={!allFieldsValid}
            >
              Submit
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction="row">
            <Button
              variant="contained"
              fullWidth
              onClick={handleRejct}
              disabled={!allFieldsValid}
            >
              Reject
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Stack>
        <AddBrokerSchemeNotes newSchemeId={id} />
      </Stack>
    </>
  );
};

export default AuditScheme;

const SchemeAddress = ({ item, onValidationChange }) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${item.id}a-content`}
        id={`panel${item.id}a-header`}
      >
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
        id={`panel${item.id}a-header`}
      >
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
        id={`panel${item.id}a-header`}
      >
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
        id={`panel${item.id}a-header`}
      >
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
