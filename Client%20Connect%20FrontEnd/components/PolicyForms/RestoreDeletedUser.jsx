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
import React from "react";
import { RestoreFromTrash } from "@mui/icons-material";

const RestoreDeletedUser = ({ member, setMembers }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const HandleAdd = () => {
    // set PolicyMember.status to New
    setMembers((prev) => {
      return prev.map((item) => {
        if (item.id === member.id) {
          item.status = "New";
          item.deletedAt = null;
        }
        return item;
      });
    });

    setOpen(false);
  };

  return (
    <div>
      <IconButton
        onClick={handleClickOpen}
        color="success"
        aria-label="enable Member"
        component="label"
      >
        <RestoreFromTrash />
      </IconButton>

      <Dialog
        sx={{ border: 5, borderColor: "success.main" }}
        open={open}
        maxWidth="md"
        fullWidth
        keepMounted
        onClose={handleClose}
        aria-describedby="enable_member"
      >
        <DialogTitle>Are you sure? </DialogTitle>
        <DialogContent>
          <DialogContentText id="enable_member_content">
            Restore Member : {member.firstName} {member.surname}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button color="success" variant="contained" onClick={HandleAdd}>
            Enable
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RestoreDeletedUser;
