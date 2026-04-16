import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";

const RemoveMemberFromCreateTable = ({ member, setMembers }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const HandleRemove = () => {
    // set PolicyMember.status to isDeleted
    setMembers((prev) => {
      // pop the member from the list
      return prev.filter((item) => item.id !== member.id);
    });
    setOpen(false);
  };

  return (
    <div>
      <IconButton
        onClick={handleClickOpen}
        color="error"
        aria-label="Remove Member"
        component="label"
      >
        <DeleteIcon />
      </IconButton>
      <Dialog
        sx={{ border: 5, borderColor: "error.main" }}
        open={open}
        maxWidth="md"
        fullWidth
        keepMounted
        onClose={handleClose}
        aria-describedby="Remove_member"
      >
        <DialogTitle>Are you sure? </DialogTitle>
        <DialogContent>
          <DialogContentText id="Remove_member_content">
            Remove Member : {member.firstName} {member.surname}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={HandleRemove}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RemoveMemberFromCreateTable;
