import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import dayjs from "dayjs";
import ChildForm from "./ChildForm";
import BeneficiaryForm from "./BeneficiaryForm";
import { Stack } from "@mui/material";

export default function BeneficiaryDialog({ edit, setMembers, data }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="inherit" onClick={handleClickOpen}>
        {edit ? `Edit Beneficiary` : `Add Beneficiary`}
      </Button>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            {edit ? `Edit Beneficiary` : `Add Beneficiary`}
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
          <BeneficiaryForm
            edit={edit}
            setMembers={setMembers}
            data={data}
            handleClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
