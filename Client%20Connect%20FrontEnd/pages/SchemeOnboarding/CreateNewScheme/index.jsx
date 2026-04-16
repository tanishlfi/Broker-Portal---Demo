import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardHeader,
  List,
  ListSubheader,
  Paper,
  Stack,
  Skeleton,
} from "@mui/material";
import PageHeader from "../../../components/Bits/PageHeader";
import SelectBroker from "../../../components/FormComponents.jsx/SelectBroker";
import ContentItem from "../../../components/Containers/ContentItem";
import { useQuery } from "react-query";
import axios from "axios";
import useToken from "../../../hooks/useToken";
import { rmaAPI } from "../../../src/AxiosParams";

import StartNewScheme from "../../../components/NewGroupScheme/StartNewScheme";

const CreateNewScheme = () => {
  const accessToken = useToken();

  const [selectedBroker, setSelectBroker] = useState("");

  const [broker, setBroker] = useState("");

  const brokerById = useQuery(
    `broker${selectedBroker?.id}`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Broker/Brokerage/${selectedBroker?.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!selectedBroker?.id && !!accessToken,
      onSuccess: (data) => {
        setBroker(data.data);
      },
    }
  );

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Create New Scheme"
        description="Create a new scheme for a Brokerage"
      />
      <Stack sx={{ mb: 2 }}>
        <Typography variant="h6">To Get Started Select a Broker.</Typography>
        <Typography variant="caption" color="text.secondary">
          This will help you to create a new scheme for the selected Broker.
        </Typography>
      </Stack>
      <SelectBroker setSelect={setSelectBroker} />

      {selectedBroker && (
        <>
          <BrokerCard broker={broker} isLoading={brokerById?.isLoading} />

          <Stack sx={{ mb: 2 }}>
            <Typography variant="h6">Confirm</Typography>
            <Typography variant="caption" color="text.secondary">
              Please confirm the selected broker and start a new scheme for the
              selected broker.
            </Typography>
          </Stack>

          <StartNewScheme id={selectedBroker?.id} />
        </>
      )}
    </Container>
  );
};

export default CreateNewScheme;

const BrokerCard = ({ broker, isLoading }) => {
  console.log("broker", broker);

  if (isLoading) {
    return (
      <Grid sx={{ mt: 2 }} container spacing={2}>
        <Grid item xs={12} md={12}>
          <Stack spacing={1}>
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={300} />
          </Stack>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={broker?.name} subheader={broker?.name} />

          <List
            dense
            sx={{
              width: "100%",
            }}
            subheader={
              <ListSubheader
                color="inherit"
                variant="outlined"
                component={Paper}>
                Broker Details
              </ListSubheader>
            }>
            <Stack direction="row">
              <ContentItem title="Name" value={broker?.name} />
              <ContentItem title="FSP Number" value={broker?.fspNumber} />
            </Stack>

            <Stack direction="row">
              <ContentItem title="Registration Number" value={broker?.regNo} />
              <ContentItem
                title="Legal Capacity"
                value={broker?.legalCapacity}
              />
            </Stack>
            <Stack direction="row">
              <ContentItem title="Company Type" value={broker?.companyType} />
              <ContentItem title="Status" value={broker?.status} />
            </Stack>
          </List>
        </Card>
      </Grid>
    </Grid>
  );
};
