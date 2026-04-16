import { Card, CardContent, Stack, Typography, Alert } from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import React from "react";
import { useMutation, useQueryClient } from "react-query";
import AllocateBroker from "./AllocateBroker";
import SelectSchemeMultiSelect from "./SelectSchemeMultiSelect";
import AlertPopup from "components/Bits/AlertPopup";
import ViewBasicBrokerDetails from "components/User/ViewBasicBrokerDetails";
import AddMetaDataToAuth0 from "./AddMetaDataToAuth0";
import ViewSchemeDetails from "./ViewSchemeDetails";

// Constants for better maintainability
const API_ENDPOINTS = {
  UPDATE_USER: "/api/UserManagement/UpdateUser",
};

const MESSAGES = {
  SUCCESS: "Connection successfully added",
  ERROR: "Failed to add connection. Please try again.",
  NO_SCHEMES: "No scheme details available.",
  INVALID_SCHEMES: "Scheme IDs are not properly formatted or empty.",
};

const ManageUserConnections = ({ user, userRole }) => {
  const accessToken = useToken();
  const queryClient = useQueryClient();
  const [selectedScheme, setSelectedScheme] = React.useState(null);

  const AllocateUserDetails = useMutation(
    `AllocateUserDetails${user?.user_id}`,
    async (data) => {
      const response = await axios.post(API_ENDPOINTS.UPDATE_USER, data, {
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

  const HandleSubmit = () => {
    let user_metadata = {
      BrokerageIds: [selectedBroker?.id],
    };

    if (selectedScheme) {
      user_metadata = { ...user_metadata, SchemeIds: [selectedScheme?.id] };
    }

    AllocateUserDetails.mutate({ user_metadata, user_id: user?.user_id });
    setSelectedBroker(null);
    setSelectedScheme(null);
  };

  const showAllocateBroker = user?.user_metadata?.BrokerageIds?.length === 0;
  const showSchemeMultiSelect = user?.user_metadata?.BrokerageIds?.length > 0;
  const schemeIds = user?.user_metadata?.SchemeIds;

  if (!user?.user_metadata) {
    return <AddMetaDataToAuth0 user_id={user?.user_id} />;
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 3, py: 2 }}
      >
        <Typography variant="h5" component="h2">
          User Connections
        </Typography>
      </Stack>

      <CardContent sx={{ pt: 1, pb: 3 }}>
        {showAllocateBroker && (
          <AllocateBroker user={user} HandleSubmit={HandleSubmit} />
        )}

        {showSchemeMultiSelect && (
          <Stack spacing={3}>
            {user?.user_metadata?.BrokerageIds?.map((row, index) => (
              <Stack key={index} spacing={2}>
                <ViewBasicBrokerDetails id={row} />
                <SelectSchemeMultiSelect
                  filterSchemes={schemeIds}
                  user={user}
                  id={row}
                />
                <UserSchemeDetails user={user} />
              </Stack>
            ))}
          </Stack>
        )}

        <AlertPopup
          open={AllocateUserDetails?.isSuccess}
          severity="success"
          message={MESSAGES.SUCCESS}
          autoHideDuration={4000}
        />
        <AlertPopup
          open={AllocateUserDetails?.isError}
          severity="error"
          message={MESSAGES.ERROR}
          autoHideDuration={4000}
        />
      </CardContent>
    </Card>
  );
};

export default ManageUserConnections;

const UserSchemeDetails = ({ user }) => {
  const schemeIds = user?.user_metadata?.SchemeIds;

  if (!schemeIds) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">{MESSAGES.NO_SCHEMES}</Typography>
      </Alert>
    );
  }

  if (!Array.isArray(schemeIds) || schemeIds.length === 0) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">{MESSAGES.INVALID_SCHEMES}</Typography>
      </Alert>
    );
  }

  return <ViewSchemeDetails user={user} schemeIds={schemeIds} />;
};
