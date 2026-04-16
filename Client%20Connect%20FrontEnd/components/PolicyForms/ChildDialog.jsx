import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import dayjs from "dayjs";
import ChildForm from "./ChildForm";

export default function ChildDialog({
  edit,
  addChildRequest,
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

  return (
    <div>
      <Button variant="contained" color="success" onClick={handleClickOpen}>
        {edit ? "Edit Child" : "Add Child"}
      </Button>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle>{edit ? "Edit Child" : "Add Child"}</DialogTitle>
        <DialogContent>
          <ChildForm
            handleClose={handleClose}
            edit={edit}
            addChildRequest={addChildRequest}
            setMembers={setMembers}
            data={data}
            waitingPeriod={waitingPeriod}
            policyInceptionDate={policyInceptionDate}
            benefits={benefits}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
