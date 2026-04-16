import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";

const RemoveMemberFormEditTableDialog = ({
  member,
  setMembers,
  removalReasons,
}) => {
  const [open, setOpen] = React.useState(false);
  const [removalReasonId, setRemovalReasonId] = React.useState("");
  const [otherReason, setOtherReason] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState("");

  // console.log("member", member);
  // console.log("removalReasons", removalReasons);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelect = (e) => {
    setRemovalReasonId(e.target.value);
    // check if removalReason if value is other based on id
    if (e.target.value) {
      const reason = removalReasons.find(
        (reason) => reason.id === e.target.value,
      );
      if (reason.description === "Other") {
        setOtherReason(true);
      } else {
        setOtherReason(false);
      }
    }
  };

  const handleOtherReason = (e) => {
    setCancellationReason(e.target.value);
  };

  const HandleRemove = () => {
    // set PolicyMember.status to Deleted
    setMembers((prev) => {
      return prev.map((item) => {
        if (item.id === member.id) {
          item.PolicyMember.status = "Deleted";
          item.PolicyMember.deletedAt = new Date().toISOString();
          item.PolicyMember.CoverAmount = 0;
          item.PolicyMember.benefitRate = 0;
          item.PolicyMember.exceptions = [];
          item.PolicyMember.Premium = 0;
          item.PolicyMember.statedBenefitId = null;
          item.PolicyMember.statedBenefit = null;
          item.PolicyMember.benefit = null;
          item.PolicyMember.PolicyMemberStatusId = removalReasonId;
          item.PolicyMember.PolicyMemberStatusReason = otherReason
            ? cancellationReason
            : removalReasons.find((reason) => reason.id === removalReasonId)
                .description;
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
          <br />
          <FormControl
            sx={{
              width: "350px",
            }}
          >
            {
              // select removal reason
            }
            <InputLabel id="select_remove_reaso">
              Select Removal Reason
            </InputLabel>
            <Select
              labelId="select_remove_reason"
              id="selectRemoveReason"
              name="removalReasonId"
              label="Select Cancellation Reason"
              value={removalReasonId}
              onChange={handleSelect}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {removalReasons.map((reason) => {
                // if ([ ].includes(reason.description)) {
                return (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.description}
                  </MenuItem>
                );
                // }
              })}
            </Select>
            <br />
            {
              // if removal reason is other, show text field
            }
            {otherReason && (
              <TextField
                id="outlined-multiline-static"
                label="Other Reason"
                name="cancellationReason"
                multiline
                rows={4}
                defaultValue=""
                onChange={handleOtherReason}
              />
            )}
          </FormControl>
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

export default RemoveMemberFormEditTableDialog;
