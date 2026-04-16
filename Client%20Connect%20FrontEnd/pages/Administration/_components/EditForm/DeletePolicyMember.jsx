import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
} from "@mui/material";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { set } from "nprogress";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DeletePolicyMember = ({
  id,
  setPolicyMembers,
  noEdit,
  PolicyMembers,
}) => {
  const [open, setOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      // remove member from policy at position (id-1) in the policy members array
      setPolicyMembers((prev) => {
        return prev.filter((member, index) => index !== id - 1);
      });

      // console.log("PolicyMembers", PolicyMembers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <IconButton color="error" onClick={handleClickOpen}>
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {"Are you sure you want to remove this member?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button
            disabled={noEdit}
            color="error"
            variant="contained"
            onClick={handleRemove}
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default DeletePolicyMember;
