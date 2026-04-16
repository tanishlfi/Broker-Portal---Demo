import React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Typography,
  Skeleton,
  Stack,
} from "@mui/material";
import axios from "axios";
import ContentItem from "components/Containers/ContentItem";
import useToken from "hooks/useToken";
import { useQueries } from "react-query";
import { rmaAPI } from "src/AxiosParams";
import RemoveSchemeDialog from "./RemoveSchemeButton";

// Constants for better maintainability
const API_ENDPOINTS = {
  POLICY_DETAILS: (id) => `${rmaAPI}/clc/api/Policy/Policy/${id}`,
};

const MESSAGES = {
  ERROR: (message) => `Error fetching policy details: ${message}`,
};

const POLICY_FIELDS = [
  { title: "Policy ID", key: "policyId" },
  { title: "Brokerage Name", key: "clientName" },
  { title: "Policy Number", key: "policyNumber" },
];

const ViewSchemeDetails = ({ schemeIds, user }) => {
  const accessToken = useToken();
  const uniqueSchemeIds = Array.from(new Set(schemeIds));

  const schemeDetailsQueries = useQueries(
    uniqueSchemeIds.map((id) => ({
      queryKey: ["GetPolicyById", id],
      queryFn: () =>
        axios.get(API_ENDPOINTS.POLICY_DETAILS(id), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      enabled: !!accessToken && !!id,
    }))
  );

  const isLoadingComplete = schemeDetailsQueries.every(
    (query) => !query.isLoading
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 3, py: 2 }}
      >
        <Typography variant="h5" component="h2">
          Scheme Details
        </Typography>
      </Stack>

      <Divider />

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {schemeDetailsQueries.map((schemeQuery, index) => {
            if (schemeQuery.isLoading) {
              return (
                <Grid item xs={12} md={6} key={`skeleton-${index}`}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      height: "100%",
                      backgroundColor: "background.default",
                    }}
                  >
                    <Skeleton variant="text" sx={{ mb: 2, height: 32 }} />
                    <Stack spacing={2}>
                      {[1, 2, 3].map((n) => (
                        <Skeleton
                          key={n}
                          variant="rectangular"
                          height={24}
                          sx={{ borderRadius: 1 }}
                        />
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              );
            }

            if (schemeQuery.isError) {
              return (
                <Grid item xs={12} key={`error-${index}`}>
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        fontSize: "1.5rem",
                      },
                    }}
                  >
                    {MESSAGES.ERROR(schemeQuery.error.message)}
                  </Alert>
                </Grid>
              );
            }

            const policyData = schemeQuery.data?.data;

            return (
              <Grid item xs={12} md={6} key={uniqueSchemeIds[index]}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (theme) => theme.shadows[2],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          pb: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          fontWeight: 500,
                        }}
                      >
                        Policy Details
                      </Typography>

                      <Stack spacing={2}>
                        {POLICY_FIELDS.map(({ title, key }) => (
                          <ContentItem
                            key={key}
                            title={title}
                            value={policyData?.[key] || "N/A"}
                          />
                        ))}
                      </Stack>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          pt: 1,
                        }}
                      >
                        <RemoveSchemeDialog
                          schemeIdToRemove={uniqueSchemeIds[index]}
                          user={user}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {!isLoadingComplete && (
          <LinearProgress
            sx={{
              mt: 3,
              height: 6,
              borderRadius: 3,
              backgroundColor: "background.neutral",
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ViewSchemeDetails;
