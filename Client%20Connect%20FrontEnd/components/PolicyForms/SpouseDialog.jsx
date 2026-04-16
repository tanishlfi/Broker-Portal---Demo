import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";

import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import SpouseForm from "../PolicyForms/SpouseForm";

export default function SpouseDialog({
  edit,
  setMembers,
  data,
  addSpouseRequest,
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
      <Button variant="contained" color="secondary" onClick={handleClickOpen}>
        {edit ? "Edit Spouse" : "Add Spouse"}
      </Button>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle> {edit ? "Edit Spouse" : "Add Spouse"}</DialogTitle>

        <DialogContent>
          <SpouseForm
            addSpouseRequest={addSpouseRequest}
            edit={edit}
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
