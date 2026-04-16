import {
  Box,
  Card,
  LinearProgress,
  List,
  ListSubheader,
  Paper,
  Stack,
  Grid,
  Button,
} from "@mui/material";
import React from "react";
import ContentItem from "./ContentItem";

import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import axios from "axios";
import { useRouter } from "next/router";

const ViewPolicyCard = ({ policy, myPolicy = true }) => {
  const router = useRouter();

  const policyQuery = useQuery(
    ["GetPolicyDetailsById", policy?.providerId],
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/${policy?.providerId}`,
        {},
      ),
    {
      enabled: policy?.providerId ? true : false,
    },
  );

  const policyInceptionDate = policyQuery?.data?.data?.policyInceptionDate;
  const date = new Date(policyInceptionDate);
  // const formattedDate = date.toLocaleDateString(); // This will format the date based on the user's locale
  const formattedDate = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"), // +1 because getMonth() returns 0-11
    date.getDate().toString().padStart(2, "0"),
  ].join("-");

  // console.log("policyQuery", policyQuery);

  const handleRowClick = (fileId) => {
    const url = myPolicy
      ? `/Onboarding/MyFiles/${fileId}`
      : `/Onboarding/AllFiles/${fileId}`;
    router.push(url);
  };

  return (
    <div>
      {policyQuery?.isLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <Stack spacing={2} sx={{ pb: 2 }}>
          <Card>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ListSubheader
                  color="inherit"
                  variant="outlined"
                  component={Paper}
                >
                  Policy Details
                </ListSubheader>
              </Grid>

              <Grid item xs={6}>
                <List
                  dense
                  sx={{
                    width: "100%",
                  }}
                >
                  <ContentItem
                    title="Brokerage Name"
                    value={policyQuery?.data?.data?.brokerageName}
                  />
                  <ContentItem
                    title="Scheme / Representative Name"
                    value={policyQuery?.data?.data?.clientName}
                  />
                  {policy?.createdBy && (
                    <ContentItem
                      title="Policy Created By"
                      value={policy?.createdBy}
                    />
                  )}
                </List>
              </Grid>
              <Grid item xs={6}>
                <List
                  dense
                  sx={{
                    width: "100%",
                  }}
                >
                  <ContentItem
                    title={"Scheme Policy Number"}
                    value={policyQuery.data?.data?.policyNumber}
                  />
                  <ContentItem
                    title={"Scheme Inception Date"}
                    value={formattedDate}
                  />
                  {policy?.approverId && (
                    <ContentItem
                      title="Policy Approver"
                      value={policy?.approverId}
                    />
                  )}
                </List>
              </Grid>
            </Grid>
            {policy?.fileId && (
              <Grid container sx={{ p: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleRowClick(policy?.fileId)}
                  >
                    View File
                  </Button>
                </Stack>
              </Grid>
            )}
          </Card>
        </Stack>
      )}
    </div>
  );
};

export default ViewPolicyCard;
