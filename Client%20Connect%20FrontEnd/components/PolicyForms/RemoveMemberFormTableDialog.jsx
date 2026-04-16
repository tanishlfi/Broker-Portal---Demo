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

const RemoveMemberFormTableDialog = ({ member, setMembers }) => {
  const [open, setOpen] = React.useState(false);

  // console.log("member", member);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const HandleRemove = () => {
    setMembers((prev) => {
      return prev.map((item) => {
        if (item.id === member.id) {
          item.status = "Deleted";
          item.deletedAt = new Date().toISOString();
          item.CoverAmount = 0;
          item.benefitRate = 0;
          item.exceptions = [];
          item.premium = 0;
          item.statedBenefitId = null;
          item.statedBenefit = null;
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

export default RemoveMemberFormTableDialog;
