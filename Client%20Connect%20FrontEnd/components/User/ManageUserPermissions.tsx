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

// Constants for better maintainability
const PERMISSIONS = {
  POLICY_ADMINISTRATOR: "PolicyAdministrator",
  ROLE_ADMINISTRATOR: "Administrator",
};

const MESSAGES = {
  SUCCESS: "User permissions updated successfully.",
  ERROR: "Failed to update user permissions. Please try again.",
  TOOLTIP: "This user will have 'Policy Administrator' privileges.",
};

const API_ENDPOINTS = {
  USER_PERMISSIONS: "/api/UserManagement/UserPermissions",
};

const QUERY_KEYS = {
  USER_DATA: "getUserData",
};

const ManageUserPermissions = ({ user }) => {
  const accessToken = useToken();
  const queryClient = useQueryClient();

  const [isChecked, setIsChecked] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  // console.log("ManageUserPermissions user:", user);
  // Extract user permission state safely
  const getUserPermissionState = useCallback((userData) => {
    try {
      return (
        userData?.user_metadata?.Modules?.[0]?.PolicyAdministrator?.Enabled ||
        false
      );
    } catch (error) {
      console.error("Error extracting user permission state:", error);
      return false;
    }
  }, []);

  // Set initial checkbox state from user metadata
  useEffect(() => {
    if (user) {
      const enabled = getUserPermissionState(user);
      setIsChecked(enabled);
    }
  }, [user, getUserPermissionState]);

  // Show alert with auto-hide
  const showAlertMessage = useCallback((severity, message) => {
    setAlertSeverity(severity);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  // Mutation to update permissions in backend
  const updatePermissionsMutation = useMutation(
    async (newValue) => {
      if (!user?.user_id || !accessToken) {
        throw new Error("Missing required data for permission update");
      }

      const response = await axios.post(
        API_ENDPOINTS.USER_PERMISSIONS,
        {
          user_id: user.user_id,
          module: PERMISSIONS.POLICY_ADMINISTRATOR,
          updates: {
            Role: PERMISSIONS.ROLE_ADMINISTRATOR,
            Enabled: newValue,
          },
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
        queryClient.invalidateQueries(QUERY_KEYS.USER_DATA);
      },
      onError: (error) => {
        console.error("Permission update failed:", error);
        // Revert checkbox state on error
        setIsChecked((prev) => !prev);
        showAlertMessage("error", MESSAGES.ERROR);
      },
    },
  );

  const handleCheckboxChange = useCallback(
    (event) => {
      const newValue = event.target.checked;
      setIsChecked(newValue);
      updatePermissionsMutation.mutate(newValue);
    },
    [updatePermissionsMutation],
  );

  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  // Don't render if user data is not available
  if (!user) {
    return null;
  }

  const isLoading = updatePermissionsMutation.isLoading;

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
            Manage User Permissions
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
            <FormControlLabel
              control={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    disabled={isLoading}
                    sx={{
                      "&.Mui-disabled": {
                        opacity: 0.6,
                      },
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
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: isLoading ? "text.secondary" : "text.primary",
                  }}
                >
                  Policy Administrator
                </Typography>
              }
              disabled={isLoading}
            />
          </FormGroup>

          {user?.name && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, ml: 4 }}
            >
              Managing permissions for: <strong>{user.name}</strong>
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

export default ManageUserPermissions;
