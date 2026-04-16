import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";

const RemovePolicyDialog = ({ policy, ChangeRequest }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    ChangeRequest.mutate(
      {
        policyIds: [policy.id],
        status: "Removed",
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <div>
      <Tooltip title="Remove Policy">
        <IconButton
          onClick={handleClickOpen}
          color="error"
          aria-label="Remove Policy"
          component="label"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        sx={{ border: 5, borderColor: "error.main" }}
        open={open}
        maxWidth="md"
        fullWidth
        keepMounted
        onClose={handleClose}
        aria-describedby="Remove_policy"
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText id="Remove_policy_content">
            Remove Policy for {policy?.fullName}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleSubmit}>
            Remove Policy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RemovePolicyDialog;
