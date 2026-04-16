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

const RejectPolicyDialog = ({ policy, ChangeRequest }) => {
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
        status: "Rejected",
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <div>
      <Tooltip title="Reject Policy">
        <IconButton
          onClick={handleClickOpen}
          color="error"
          aria-label="Remove Member"
          component="label">
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
        aria-describedby="Remove_member">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText id="Remove_member_content">
            Reject Policy : {policy?.id}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleSubmit}>
            Reject Policy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RejectPolicyDialog;
