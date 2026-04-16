import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik, Form } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";

import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import { Grid } from "@mui/material";
import useIdTypes from "hooks/LookUps/useIdTypes";
import SubMemberForm from "./SubMemberForm";
// import * as Yup from "Yup";

export default function SubMemberDialog({
  edit,
  addSubmember,
  setMembers,
  data,
  waitingPeriod,
  policyInceptionDate,
  benefits,
}) {
  const [open, setOpen] = React.useState(false);

  const idTypes = useIdTypes();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="inherit" onClick={handleClickOpen}>
        {edit ? "Edit" : "Add"} Extended Member
      </Button>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle> {edit ? "Edit" : "Add"} Extended Member</DialogTitle>

        <DialogContent>
          <SubMemberForm
            handleClose={handleClose}
            edit={edit}
            addSubmember={addSubmember}
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
