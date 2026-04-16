import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Box,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import useToken from "@/hooks/useToken";
import AlertPopup from "../Bits/AlertPopup";
import AddMetaDataToAuth0 from "./AddMetaDataToAuth0";

const ENVIRONMENTS = [
  { key: "prod", label: "Production" },
  { key: "uat", label: "UAT" },
  { key: "test", label: "Test" },
];

const API_ENDPOINTS = {
  UPDATE_USER: "/api/UserManagement/UpdateUserAppMetaData",
};

const MESSAGES = {
  SUCCESS: "User environments updated successfully.",
  ERROR: "Failed to update user environments. Please try again.",
  TOOLTIP: "Select which environments this user can access.",
};

const QUERY_KEYS = {
  USER_BY_ID: "getUserById",
};

const ManageUserEnvironments = ({ user }) => {
  const accessToken = useToken();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const envs = user?.app_metadata?.allowed_environments;
    if (Array.isArray(envs)) {
      setSelected(envs);
    } else {
      setSelected([]);
    }
  }, [user]);

  const showAlertMessage = useCallback((severity, message) => {
    setAlertSeverity(severity);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  const updateEnvironmentsMutation = useMutation<string[], unknown, string[]>(
    async (newEnvs) => {
      if (!user?.user_id || !accessToken) {
        throw new Error("Missing required data for environment update");
      }

      const response = await axios.post(
        API_ENDPOINTS.UPDATE_USER,
        {
          user_id: user.user_id,
          app_metadata: { allowed_environments: newEnvs },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
    {
      onSuccess: () => {
        showAlertMessage("success", MESSAGES.SUCCESS);
        queryClient.invalidateQueries([QUERY_KEYS.USER_BY_ID, user?.user_id]);
      },
      onError: (error) => {
        console.error("Environment update failed:", error);
        showAlertMessage("error", MESSAGES.ERROR);
        // Revert to server state by refetching
        queryClient.invalidateQueries([QUERY_KEYS.USER_BY_ID, user?.user_id]);
      },
    },
  );

  const handleToggle = useCallback(
    (envKey) => {
      const isIncluded = selected.includes(envKey);
      const newSelected = isIncluded
        ? selected.filter((e) => e !== envKey)
        : [...selected, envKey];

      setSelected(newSelected);
      updateEnvironmentsMutation.mutate(newSelected);
    },
    [selected, updateEnvironmentsMutation],
  );

  if (!user) return null;

  if (!user?.app_metadata) {
    return <AddMetaDataToAuth0 user_id={user?.user_id} />;
  }

  const isLoading = updateEnvironmentsMutation.isLoading;

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: 3, py: 2 }}
        >
          <Typography variant="h5" component="h2">
            Manage User Environments
          </Typography>
          <Tooltip
            arrow
            title={
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                {MESSAGES.TOOLTIP}
              </Typography>
            }
          >
            <InfoIcon
              fontSize="small"
              sx={{ color: "primary.main", cursor: "help" }}
            />
          </Tooltip>
        </Stack>

        <CardContent sx={{ pt: 1, pb: 3 }}>
          <FormGroup>
            {ENVIRONMENTS.map((env) => (
              <FormControlLabel
                key={env.key}
                control={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={selected.includes(env.key)}
                      onChange={() => handleToggle(env.key)}
                      disabled={isLoading}
                      sx={{
                        "&.Mui-disabled": { opacity: 0.6 },
                      }}
                    />
                    {isLoading && (
                      <CircularProgress
                        size={16}
                        sx={{ ml: 1, color: "primary.main" }}
                      />
                    )}
                  </Box>
                }
                label={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {env.label}
                  </Typography>
                }
                disabled={isLoading}
              />
            ))}
          </FormGroup>

          {user?.name && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, ml: 4 }}
            >
              Managing environments for: <strong>{user.name}</strong>
            </Typography>
          )}
        </CardContent>
      </Card>

      <AlertPopup
        open={showAlert}
        severity={alertSeverity}
        message={alertMessage}
        autoHideDuration={4000}
      />
    </>
  );
};

export default ManageUserEnvironments;
