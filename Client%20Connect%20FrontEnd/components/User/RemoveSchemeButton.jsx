import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import { useMutation, useQueryClient } from "react-query";
import { nodeSa } from "src/AxiosParams";

const RemoveSchemeDialog = ({ user, schemeIdToRemove }) => {
  const [open, setOpen] = useState(false);
  const accessToken = useToken();
  const queryClient = useQueryClient();

  const removeSchemeMutation = useMutation(
    async (updatedSchemeIds) => {
      const response = await axios.patch(
        `${nodeSa}/auth0/user/${user?.user_id}`,
        {
          user_metadata: {
            ...user.user_metadata,
            SchemeIds: updatedSchemeIds,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch the user data to update the client state
        queryClient.invalidateQueries(["getUserById", user?.user_id]);
        handleClose(); // Close the dialog on success
      },
    }
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRemoveScheme = () => {
    // Create a new array excluding the schemeId to remove
    const updatedSchemeIds = user.user_metadata.SchemeIds.filter(
      (id) => id !== schemeIdToRemove
    );

    // Execute the mutation
    removeSchemeMutation.mutate(updatedSchemeIds);
  };

  if (!user?.user_metadata?.SchemeIds?.includes(schemeIdToRemove)) {
    // If the schemeId to remove is not in the user's SchemeIds, display an alert
    return (
      <Alert severity="info">Scheme not found in the user`&apos;s list.</Alert>
    );
  }

  return (
    <React.Fragment>
      <Button color="warning" onClick={handleClickOpen}>
        Remove Scheme access
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="remove-scheme-dialog-title"
        aria-describedby="remove-scheme-dialog-description"
      >
        <DialogTitle id="remove-scheme-dialog-title">
          {"Confirm Scheme Removal"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-scheme-dialog-description">
            Are you sure you want to remove this scheme
            {/* nice colorfull span  */}
            <span style={{ color: "red" }}> {schemeIdToRemove}</span> from the
            broker&apos;s list?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleRemoveScheme}
            color="error"
            disabled={removeSchemeMutation.isLoading}
          >
            {removeSchemeMutation.isLoading ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default RemoveSchemeDialog;
