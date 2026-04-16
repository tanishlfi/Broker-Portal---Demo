import React from "react";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import Button from "@mui/material/Button";
import useToken from "hooks/useToken";
import { Alert, Stack } from "@mui/material";
import { nodeSa } from "src/AxiosParams";

const AddMetaDataToAuth0 = ({ user_id }) => {
  const accessToken = useToken();

  const queryClient = useQueryClient();

  const AllocateUserDetails = useMutation(
    ["AllocateUserDetails", user_id],
    async () => {
      const data = {
        user_metadata: {
          BrokerageIds: [],
          SchemeIds: [],
        },
      };
      let response = await axios.patch(
        `${nodeSa}/auth0/user/${user_id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    {
      // The mutation is enabled only if we have a valid accessToken and user_id
      enabled: !!accessToken && !!user_id,
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["getUserById", user_id]);
      },
      // You can also add onError, onSettled for error handling and additional effects
    }
  );

  return (
    <Stack spacing={2}>
      <Alert severity="error" variant="outlined">
        This user does not have any metadata. Please add metadata to this user.
      </Alert>
      <Button
        fullWidth
        variant="contained"
        color="warning"
        onClick={() => AllocateUserDetails.mutate()}
        disabled={AllocateUserDetails.isLoading}>
        {AllocateUserDetails.isLoading ? "Updating..." : "Add MetaData"}
      </Button>
    </Stack>
  );
};

export default AddMetaDataToAuth0;
