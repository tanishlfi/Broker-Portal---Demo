import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Alert, Stack, TextField } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function RejectEdit({
  RejectEditFunction,
  isCancellation = false,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [reason, setReason] = React.useState("");

  const handleReject = () => {
    RejectEditFunction({ reason });
    handleClose();
  };

  return (
    <React.Fragment>
      <Button
        fullWidth
        color="error"
        variant="outlined"
        onClick={handleClickOpen}
      >
        {isCancellation ? "Reject Cancellation" : "Reject Edits"}
      </Button>
      <Dialog
        maxWidth="md"
        fullWidth
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {isCancellation ? "Reject Cancellation" : "Reject Edits"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="error">
              Are you sure you want to reject these edits?
            </Alert>
            <TextField
              multiline
              rows={4}
              label="Reason for Rejection"
              variant="outlined"
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={reason === ""}
            onClick={handleReject}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
