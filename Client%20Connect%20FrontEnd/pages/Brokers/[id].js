import { useOidcAccessToken } from "@axa-fr/react-oidc";
import axios from "axios";
import React from "react";
import PageHeader from "../../components/Bits/PageHeader";
import { useQuery } from "react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Grid,
  List,
  ListSubheader,
  Stack,
  Paper,
  Skeleton,
  Card,
  CardHeader,
  LinearProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import ContentItem from "../../components/Containers/ContentItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SyncingIndicator from "components/Bits/SyncingIndicator";
import { rmaAPI } from "src/AxiosParams";
import FeatureCard from "components/Containers/FeatureCard";
import PeopleIcon from "@mui/icons-material/People";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import useToken from "hooks/useToken";

const Broker = () => {
  const router = useRouter();

  const { id } = router.query;

  const accessToken = useToken();

  const { data, isLoading, error, isError, isRefetching } = useQuery(
    `broker${id}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Broker/Brokerage/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    },
  );

  return (
    <>
      {isLoading && <LinearProgress />}
      <SyncingIndicator isRefetching={isRefetching} />
      <PageHeader
        title="Broker"
        subTitle="Manage Broker"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Brokers",
            href: "/Brokers",
          },
          {
            title: `${id}`,
            href: `/Brokers/${id}`,
          },
        ]}
      />

      <Stack mb={3}>
        {isLoading ? (
          <>
            <Grid container>
              <Grid item xs={12}>
                <Skeleton variant="rectangular" height={40} />
              </Grid>
              <Grid item xs={4}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
              <Grid item xs={4}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
              <Grid item xs={4}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={data?.data?.name}
                  subheader={data?.data?.name}
                />

                <Grid container>
                  <Grid item xs={3}>
                    <FeatureCard
                      title="Schemes"
                      link={`/Brokers/${id}/Schemes`}
                      Icon={AccountTreeIcon}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FeatureCard
                      title="Representatives"
                      link={`/BrokerManager/Representative/${id}`}
                      Icon={PersonPinIcon}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FeatureCard
                      title="Manage Broker Users"
                      link={`/BrokerManager/UserManagement/${id}`}
                      Icon={PeopleIcon}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FeatureCard
                      title="File Upload"
                      link={`/Onboarding/FileUpload/${id}`}
                      Icon={ContentPasteSearchIcon}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </>
        )}
      </Stack>
      {isLoading ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={300} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={300} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={300} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={300} />
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{
                width: "100%",
              }}
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
                <ContentItem title="Name" value={data?.data?.name} />
                <ContentItem title="FSP Number" value={data?.data?.fspNumber} />
              </Stack>

              <Stack direction="row">
                <ContentItem
                  title="Registration Number"
                  value={data?.data?.regNo}
                />
                <ContentItem
                  title="Legal Capacity"
                  value={data?.data?.legalCapacity}
                />
              </Stack>
              <Stack direction="row">
                <ContentItem
                  title="Company Type"
                  value={data?.data?.companyType}
                />
                <ContentItem title="Status" value={data?.data?.status} />
              </Stack>
              <Stack direction="row">
                <ContentItem title="faxNo" value={data?.data?.faxNo} />
                <ContentItem title="telNo" value={data?.data?.telNo} />
              </Stack>
              <Stack direction="row">
                <ContentItem
                  title="fspWebsite"
                  value={data?.data?.fspWebsite}
                />
                <ContentItem
                  title="finYearEnd"
                  value={data?.data?.finYearEnd}
                />
              </Stack>

              <ContentItem
                title="medicalAccreditationNo"
                value={data?.data?.medicalAccreditationNo}
              />
            </List>

            <List
              dense
              sx={{
                mt: 2,
                width: "100%",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  Brokerage Banking Details
                </ListSubheader>
              }
            >
              {data?.data?.brokerageBankAccounts?.map((details) => (
                <Stack key={details.id}>
                  <Divider />
                  <BankDetails details={details} />
                </Stack>
              ))}
            </List>

            <List
              dense
              sx={{
                mt: 2,
                pb: 0,
                width: "100%",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  Addresses
                </ListSubheader>
              }
            >
              {data?.data?.addresses?.map((address) => (
                <AddressCard key={address.id} address={address} />
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List
              dense
              sx={{
                mb: 2,
                width: "100%",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  Brokerage Broker Consultants
                </ListSubheader>
              }
            >
              {data?.data?.brokerageBrokerConsultants?.map((details) => (
                <Stack key={details.id}>
                  <Divider />
                  <BrokerageConsultants details={details} />
                </Stack>
              ))}
            </List>
            <List
              dense
              sx={{
                mb: 2,
                pb: 0,
                width: "100%",
                bgcolor: "background.paper",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  Key Individuals
                </ListSubheader>
              }
            >
              {data?.data?.keyIndividuals?.map((contact) => (
                <KeyIndividuals key={contact.id} contact={contact} />
              ))}
            </List>
            <List
              dense
              sx={{
                mb: 2,
                pb: 0,
                width: "100%",
                bgcolor: "background.paper",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  Contacts
                </ListSubheader>
              }
            >
              {data?.data?.contacts?.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </List>
            <List
              dense
              sx={{
                mb: 0,
                pb: 0,
                width: "100%",
                bgcolor: "background.paper",
              }}
              subheader={
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  Representatives
                </ListSubheader>
              }
            >
              {data?.data?.representatives?.map((rep) => (
                <Representative key={rep.id} rep={rep} />
              ))}
            </List>
          </Grid>
        </Grid>
      )}

      {isError && <div>Error: {error.message}</div>}
    </>
  );
};

export default Broker;

const ContactCard = ({ contact }) => {
  return (
    <Accordion square>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${contact.id}a-content`}
        id={`panel${contact.id}a-header`}
      >
        <Stack direction="row" sx={{ width: " 100%" }}>
          <ContentItem title="Name" value={contact.firstName} />
          <ContentItem title="Surname" value={contact.lastName} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: "background.default",
        }}
      >
        <Stack direction="row">
          <ContentItem title="ID Number" value={contact?.idNumber} />
          <ContentItem title="ID Type" value={contact?.idType} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="Contact Type" value={contact?.contactType} />
          <ContentItem title="Email" value={contact?.email} />
        </Stack>

        <Stack direction="row">
          <ContentItem
            title="Telephone Number"
            value={contact?.telephoneNumber}
          />
          <ContentItem title="Mobile Number" value={contact?.mobileNumber} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const KeyIndividuals = ({ contact }) => {
  return (
    <Accordion square>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${contact.id}a-content`}
        id={`panel${contact.id}a-header`}
      >
        <Stack direction="row" sx={{ width: " 100%" }}>
          <ContentItem title="First Name" value={contact?.firstName} />
          <ContentItem
            title="Surname Or Company Name"
            value={contact?.surnameOrCompanyName}
          />
        </Stack>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          bgcolor: "background.default",
        }}
      >
        <Stack direction="row">
          <ContentItem title="title" value={contact?.title} />
          <ContentItem title="initials" value={contact?.initials} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="First Name" value={contact?.firstName} />
          <ContentItem
            title="Surname Or Company Name"
            value={contact?.surnameOrCompanyName}
          />
        </Stack>
        <Stack direction="row">
          <ContentItem title="dateOfBirth" value={contact?.dateOfBirth} />
          <ContentItem
            title="countryOfRegistration"
            value={contact?.countryOfRegistration}
          />
        </Stack>
        <Stack direction="row">
          <ContentItem
            title="dateOfAppointment"
            value={contact?.dateOfAppointment}
          />
          <ContentItem
            title="medicalAccreditationNo"
            value={contact?.medicalAccreditationNo}
          />
        </Stack>
        <Stack direction="row">
          <ContentItem title="contactNumber" value={contact?.contactNumber} />
          <ContentItem title="email" value={contact?.email} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="code" value={contact?.code} />

          <ContentItem title="paymentMethod" value={contact?.paymentMethod} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const AddressCard = ({ address }) => {
  return (
    <Accordion square>
      <AccordionSummary
        sx={{
          width: "100%",
        }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${address.id}a-content`}
        id={`panel${address.id}a-header`}
      >
        <Stack direction="row" sx={{ width: " 100%" }}>
          <ContentItem title="addressLine1" value={address.addressLine1} />
          <ContentItem title="addressLine2" value={address.addressLine2} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: "background.default",
        }}
      >
        <Stack direction="row">
          <ContentItem title="Name" value={address.addressLine1} />
          <ContentItem title="Surname" value={address.addressLine2} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="Contact Type" value={address?.postalCode} />
          <ContentItem title="Email" value={address?.city} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
const BankDetails = ({ details }) => {
  return (
    <>
      <Stack direction="row">
        <ContentItem title="accountNumber" value={details.accountNumber} />
        <ContentItem
          title="accountHolderName"
          value={details.accountHolderName}
        />
      </Stack>
      <Stack direction="row">
        <ContentItem title="branchCode" value={details?.branchCode} />
        <ContentItem title="isApproved" value={details?.isApproved} />
      </Stack>
    </>
  );
};
const BrokerageConsultants = ({ details }) => {
  return (
    <>
      <Stack direction="row">
        <ContentItem title="displayName" value={details.displayName} />
        <ContentItem title="email" value={details.email} />
      </Stack>
      <Stack direction="row">
        <ContentItem title="telNo" value={details?.telNo} />
      </Stack>
    </>
  );
};

export const Representative = ({ rep }) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel${rep.id}a-content`}
        id={`panel${rep.id}a-header`}
      >
        <Stack direction="row" sx={{ width: " 100%" }}>
          <ContentItem title="firstName" value={rep.firstName} />
          <ContentItem
            title="surnameOrCompanyName"
            value={rep.surnameOrCompanyName}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: "background.default",
        }}
      >
        <Stack direction="row">
          <ContentItem title="title" value={rep.title} />
          <ContentItem title="initials" value={rep.initials} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="firstName" value={rep?.firstName} />
          <ContentItem
            title="surnameOrCompanyName"
            value={rep?.surnameOrCompanyName}
          />
        </Stack>
        <Stack direction="row">
          <ContentItem title="idNumber" value={rep?.idNumber} />
          <ContentItem title="idType" value={rep?.idType} />
        </Stack>
        <Stack direction="row">
          <ContentItem title="dateOfBirth" value={rep?.dateOfBirth} />
          <ContentItem
            title="countryOfRegistration"
            value={rep?.countryOfRegistration}
          />
        </Stack>
        <Stack direction="row">
          <ContentItem
            title="medicalAccreditationNo"
            value={rep?.medicalAccreditationNo}
          />
          <ContentItem
            title="dateOfAppointment"
            value={rep?.dateOfAppointment}
          />
        </Stack>
        <Stack direction="row">
          <ContentItem title="code" value={rep?.code} />
          <ContentItem
            title="dateOfAppointment"
            value={rep?.dateOfAppointment}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

// title: null
// initials: "KP"
// firstName: "KAREN"
// surnameOrCompanyName: "HART-CILLIERS"
// idNumber: "6909040218089"
// idType: 1
// dateOfBirth: "1969-09-04T00:00:00"
// countryOfRegistration: "RSA"
// ▶ physicalAddress 5 items
// dateOfAppointment: "2017-12-01T00:00:00"
// medicalAccreditationNo: "BR791"
// categories: []
// qualifications: []
// repType: 1
// id: 753
// code: "NR:01358"
// contactNumber: null
// email: null
// isDeleted: false
// createdBy: "MMwelase@randmutual.co.za"
// createdDate: "2020-02-19T15:56:55.14"
// modifiedBy: "MMwelase@randmutual.co.za"
// modifiedDate: "2020-02-19T15:56:55.14"
// paymentMethod: null
// paymentFrequency: null
// representativeBankAccounts: []
// ▶ brokerageRepresentatives 2 items
// representativeNotes: []
// name: "KAREN HART-CILLIERS"
// representativeChecks: []
// ▶ activeBrokerage 12 items
