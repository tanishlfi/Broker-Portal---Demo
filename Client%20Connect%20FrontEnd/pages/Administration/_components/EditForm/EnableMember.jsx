import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EnableMember({ id, setPolicyMembers, noEdit }) {
  const [open, setOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      // await axios.delete(`/api/members/${id}`);
      setPolicyMembers((prev) => {
        return prev.map((member) => {
          if (member.RolePlayerId === id && member.MemberAction === 3) {
            return {
              ...member,
              MemberAction: 0,
              insuredLifeStatusName: "Active",
              insuredLifeStatus: 1,
            };
          } else if (member.RolePlayerId === id) {
            return {
              ...member,
              MemberAction: 1,
              insuredLifeStatusName: "Active",
              insuredLifeStatus: 1,
            };
          }
          return member;
        });
      });
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
      <IconButton color="success" onClick={handleClickOpen}>
        <AddIcon />
      </IconButton>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Enable Member</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to enable this member?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button
            disabled={noEdit}
            color="success"
            variant="contained"
            onClick={handleRemove}
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
