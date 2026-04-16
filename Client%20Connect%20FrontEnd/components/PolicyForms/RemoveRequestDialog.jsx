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

const RemoveRequestDialog = ({ request, ChangeRequest }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    ChangeRequest.mutate(request.id, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <div>
      <Tooltip title="Delete Request">
        <IconButton
          onClick={handleClickOpen}
          color="error"
          aria-label="Remove Request"
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
        aria-describedby="Remove_member"
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleSubmit}>
            Remove Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RemoveRequestDialog;
