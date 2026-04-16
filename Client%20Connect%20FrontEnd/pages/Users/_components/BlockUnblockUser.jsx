import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BlockUnblockUser({ user, handleDisableUser }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  let isBlocked = user?.blocked ? user?.blocked : false;

  return (
    <React.Fragment>
      <Button
        variant="contained"
        onClick={handleClickOpen}
        color={isBlocked ? "success" : "error"}>
        {isBlocked
          ? "Enable users access to the system"
          : "Disable users access to the system"}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description">
        <DialogTitle>{isBlocked ? "Unblock User" : "Block User"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {isBlocked
              ? "Are you sure you want to unblock this user?"
              : "Are you sure you want to block this user   ?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button
            color={isBlocked ? "error" : "success"}
            onClick={() => {
              handleDisableUser({ id: user.user_id, blocked: !isBlocked });
              handleClose();
            }}>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
