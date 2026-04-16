import {
  Card,
  LinearProgress,
  Stack,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import axios from "axios";
import ContentItem from "components/Containers/ContentItem";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

// Constants for better maintainability
const API_ENDPOINTS = {
  BROKER_DETAILS: (id) => `${rmaAPI}/clc/api/Broker/Brokerage/${id}`,
};

const SECTIONS = {
  BASIC_INFO: [
    { title: "Name", key: "name" },
    { title: "FSP Number", key: "fspNumber" },
  ],
  COMPANY_INFO: [
    { title: "Registration Number", key: "regNo" },
    { title: "Legal Capacity", key: "legalCapacity" },
  ],
  STATUS_INFO: [
    { title: "Company Type", key: "companyType" },
    { title: "Status", key: "status" },
  ],
  CONTACT_INFO: [
    { title: "Fax Number", key: "faxNo" },
    { title: "Telephone", key: "telNo" },
  ],
  ADDITIONAL_INFO: [
    { title: "Website", key: "fspWebsite" },
    { title: "Financial Year End", key: "finYearEnd" },
    { title: "Medical Accreditation No.", key: "medicalAccreditationNo" },
  ],
};

const ViewBasicBrokerDetails = ({ id }) => {
  const accessToken = useToken();

  const { data, isLoading } = useQuery(
    `broker${id}`,
    () =>
      axios.get(API_ENDPOINTS.BROKER_DETAILS(id), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  if (isLoading) {
    return <LinearProgress />;
  }

  const brokerData = data?.data;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 3, py: 2 }}
      >
        <Typography variant="h6" component="h3">
          Broker Details
        </Typography>
      </Stack>

      <Divider />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              {SECTIONS.BASIC_INFO.map(({ title, key }) => (
                <ContentItem
                  key={key}
                  title={title}
                  value={brokerData?.[key] || "N/A"}
                />
              ))}
            </Stack>
          </Grid>

          {/* Company Information */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              {SECTIONS.COMPANY_INFO.map(({ title, key }) => (
                <ContentItem
                  key={key}
                  title={title}
                  value={brokerData?.[key] || "N/A"}
                />
              ))}
            </Stack>
          </Grid>

          {/* Status Information */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              {SECTIONS.STATUS_INFO.map(({ title, key }) => (
                <ContentItem
                  key={key}
                  title={title}
                  value={brokerData?.[key] || "N/A"}
                />
              ))}
            </Stack>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              {SECTIONS.CONTACT_INFO.map(({ title, key }) => (
                <ContentItem
                  key={key}
                  title={title}
                  value={brokerData?.[key] || "N/A"}
                />
              ))}
            </Stack>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              {SECTIONS.ADDITIONAL_INFO.map(({ title, key }) => (
                <ContentItem
                  key={key}
                  title={title}
                  value={brokerData?.[key] || "N/A"}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
};

export default ViewBasicBrokerDetails;
