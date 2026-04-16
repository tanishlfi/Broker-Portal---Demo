import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import SelectBroker from "components/FormComponents.jsx/SelectBroker";
import SelectScheme from "components/FormComponents.jsx/SelectScheme";
import { Stack } from "@mui/material";
import SelectSchemeMultiSelect from "./SelectSchemeMultiSelect";

export default function AllocateSchemeAndBroker({
  HandleSubmit,
  selectedBroker,
  setSelectedBroker,
  selectedScheme,
  setSelectedScheme,
  isNew,
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
      {isNew ? (
        <Button variant="contained" onClick={handleClickOpen}>
          Allocate Broker and Scheme To user
        </Button>
      ) : (
        <Button onClick={handleClickOpen}>
          Allocate Broker and Scheme To user
        </Button>
      )}

      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
        <DialogTitle> Allocate Broker and Scheme To user</DialogTitle>

        <DialogContent sx={{ my: 2 }}>
          <Stack spacing={2}>
            <SelectBroker
              select={selectedBroker}
              setSelect={setSelectedBroker}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {selectedBroker && selectedScheme && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                HandleSubmit();
                handleClose();
              }}>
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
