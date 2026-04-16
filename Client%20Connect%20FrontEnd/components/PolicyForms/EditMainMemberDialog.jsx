import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik, Form } from "formik";
import TextfieldWrapper from "components/FormComponents.jsx/TextFieldWrapper";
import VopdRequest from "components/FormComponents.jsx/VopdRequest";
import DOBPicker from "components/FormComponents.jsx/DobPicker";
import SelectWrapper from "components/FormComponents.jsx/SelectWrapper";
import PreferredCommunicationSelect from "components/FormComponents.jsx/PreferredCommunicationSelect";
import { Grid } from "@mui/material";
import useIdTypes from "hooks/LookUps/useIdTypes";
import MainMemberForm from "./MainMemberForm";
// import * as Yup from "Yup";

export default function EditMainMemberDialog({ data, setMembers }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleClickOpen}>Edit</Button>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle> Edit Main Member</DialogTitle>

        <DialogContent>
          <MainMemberForm
            handleClose={handleClose}
            isEdit={true}
            data={data}
            setMembers={setMembers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
