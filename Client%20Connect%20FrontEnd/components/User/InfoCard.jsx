import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  Card,
  CardHeader,
  Chip,
  Grid,
  List,
  Stack,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import {
  Info as InfoIcon,
  Verified as VerifiedIcon,
  ErrorRounded as ErrorRoundedIcon,
  AdminPanelSettings,
} from "@mui/icons-material";
import ContentItem from "components/Containers/ContentItem";
import PersonIcon from "@mui/icons-material/Person";

// Constants
const USER_STATES = {
  NOT_ASSIGNED: "Not Assigned",
  UNKNOWN_STATE: "Unknown State",
  ERROR: "Error",
};

const TOOLTIPS = {
  EMAIL_VERIFIED: "Email Verified",
  EMAIL_NOT_VERIFIED: "Email Not Verified",
  POLICY_ADMINISTRATOR: "Policy Administrator",
};

const InfoCard = ({ user }) => {
  return (
    <Box>
      <ViewUserDetails user={user} />
    </Box>
  );
};

export default InfoCard;

const ViewUserDetails = ({ user }) => {
  const [userTag, setUserTag] = useState(USER_STATES.NOT_ASSIGNED);

  // Extract user role logic into a separate function for better readability
  const extractUserRole = (user) => {
    try {
      const modules = user?.user_metadata?.Modules;

      if (!Array.isArray(modules) || modules.length === 0) {
        return USER_STATES.NOT_ASSIGNED;
      }

      const policyAdmin = modules[0]?.PolicyAdministrator;
      if (!policyAdmin) {
        return USER_STATES.NOT_ASSIGNED;
      }

      const { Role: userRole, Enabled: userState } = policyAdmin;

      if (userState === true) {
        return userRole || USER_STATES.NOT_ASSIGNED;
      } else if (userState === false) {
        return USER_STATES.NOT_ASSIGNED;
      } else {
        return USER_STATES.UNKNOWN_STATE;
      }
    } catch (error) {
      console.error("Error processing Policy Administrator data:", error);
      return USER_STATES.ERROR;
    }
  };

  useEffect(() => {
    if (user) {
      const role = extractUserRole(user);
      setUserTag(role);
    }
  }, [user]);

  // Memoize verification icon to prevent unnecessary re-renders
  const verificationIcon = useMemo(() => {
    return user?.email_verified ? (
      <Tooltip arrow title={TOOLTIPS.EMAIL_VERIFIED}>
        <VerifiedIcon fontSize="small" color="primary" />
      </Tooltip>
    ) : (
      <Tooltip arrow title={TOOLTIPS.EMAIL_NOT_VERIFIED}>
        <ErrorRoundedIcon fontSize="small" color="error" />
      </Tooltip>
    );
  }, [user?.email_verified]);

  // Format date helper function
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
  };

  // Get primary identity provider safely
  const primaryProvider = user?.identities?.[0]?.provider || "N/A";

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, pr: 2 }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{ width: 56, height: 56 }}
              src={user?.picture}
              alt={user?.name || "User avatar"}
            />
          }
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" component="h2">
                {user?.name || "Unknown User"}
              </Typography>
              {verificationIcon}
            </Stack>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {`User ID: ${user?.user_id || "N/A"}`}
            </Typography>
          }
        />

        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            variant="outlined"
            label={
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Tooltip arrow title={TOOLTIPS.POLICY_ADMINISTRATOR}>
                  <AdminPanelSettings
                    sx={{ color: "primary.main" }}
                    fontSize="small"
                  />
                </Tooltip>
                {userTag}
              </span>
            }
            sx={{
              borderColor: "primary.main",
              fontWeight: 500,
            }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <List dense>
            <ContentItem
              title={
                <span>
                  <PersonIcon fontSize="small" />
                  &nbsp;Name
                </span>
              }
              value={user?.name}
            />
            <ContentItem title="Nickname" value={user?.nickname} />
          </List>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <List dense>
            <ContentItem title="Email" value={user?.email} />
            <ContentItem
              title="Primary Identity Provider"
              value={primaryProvider}
            />
          </List>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <List dense>
            {user?.created_at && (
              <ContentItem
                title="Signed Up"
                value={formatDateTime(user.created_at)}
              />
            )}
            {user?.last_login && (
              <ContentItem
                title="Last Login"
                value={formatDateTime(user.last_login)}
              />
            )}
          </List>
        </Grid>
      </Grid>
    </Card>
  );
};
