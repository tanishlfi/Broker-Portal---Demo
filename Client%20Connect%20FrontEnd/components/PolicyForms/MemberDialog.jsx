import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";

import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import MemberForm from "./MemberForm";
import { Stack } from "@mui/material";

export default function MemberDialog({
  memberType,
  edit,
  setMembers,
  data,
  waitingPeriod,
  policyInceptionDate,
  benefits,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const buttonColor =
    memberType === "Spouse"
      ? "secondary"
      : memberType === "Child"
      ? "success"
      : "inherit";

  return (
    <div>
      <Button variant="contained" color={buttonColor} onClick={handleClickOpen}>
        {edit ? `Edit ${memberType}` : `Add ${memberType}`}
      </Button>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            {edit ? `Edit ${memberType}` : `Add ${memberType}`}
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleClose}
              sx={{ ml: "auto" }}
            >
              Cancel
            </Button>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <MemberForm
            memberType={memberType}
            edit={edit}
            setMembers={setMembers}
            data={data}
            waitingPeriod={waitingPeriod}
            policyInceptionDate={policyInceptionDate}
            benefits={benefits}
            setOpen={setOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
