import {
  Alert,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  List,
} from "@mui/material";
import axios from "axios";
import ContentItem from "components/Containers/ContentItem";
import useToken from "hooks/useToken";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import AllocateUserRole from "./AllocateUserRole";
import AlertPopup from "components/Bits/AlertPopup";

// Constants for better maintainability
const API_ENDPOINTS = {
  ALL_ROLES: "/api/UserManagement/AllRoles",
  CHANGE_ROLE: "/api/UserManagement/ChangeRole",
};

const MESSAGES = {
  SUCCESS: "Role successfully updated",
  ERROR: "Failed to update role. Please try again.",
  NO_ROLE: "This user does not have a role assigned to them.",
};

const ManageUserRole = ({ user, userRole }) => {
  const accessToken = useToken();
  const queryClient = useQueryClient();

  const getAllRoles = useQuery(
    `getAllRoles`,
    async () => {
      const response = await axios.get(API_ENDPOINTS.ALL_ROLES, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data;
    },
    {
      enabled: !!accessToken,
    }
  );

  const AllocateRoleToUser = useMutation(
    `AllocateRoleToUser`,
    async (data) => {
      const subdata = {
        ...data,
        id: user?.user_id,
      };

      const response = await axios.post(API_ENDPOINTS.CHANGE_ROLE, subdata, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data;
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries(["getUserById", user?.user_id]);
      },
    }
  );

  const currentRole = getAllRoles?.data?.data?.find(
    (role) => role.id === userRole
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
          User Role
        </Typography>
      </Stack>

      <CardContent sx={{ pt: 1, pb: 3 }}>
        {userRole ? (
          <>
            <List dense>
              <ContentItem title="Role Name" value={currentRole?.name} />
              <ContentItem
                title="Role Description"
                value={currentRole?.description}
              />
            </List>
            <Box sx={{ mt: 3 }}>
              <AllocateUserRole
                AllocateRoleToUser={AllocateRoleToUser}
                roles={getAllRoles?.data?.data}
              />
            </Box>
          </>
        ) : (
          <>
            <AllocateUserRole
              AllocateRoleToUser={AllocateRoleToUser}
              roles={getAllRoles?.data?.data}
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">{MESSAGES.NO_ROLE}</Typography>
            </Alert>
          </>
        )}

        <AlertPopup
          open={AllocateRoleToUser?.isSuccess}
          severity="success"
          message={MESSAGES.SUCCESS}
          autoHideDuration={4000}
        />
        <AlertPopup
          open={AllocateRoleToUser?.isError}
          severity="error"
          message={MESSAGES.ERROR}
          autoHideDuration={4000}
        />
      </CardContent>
    </Card>
  );
};

export default ManageUserRole;
