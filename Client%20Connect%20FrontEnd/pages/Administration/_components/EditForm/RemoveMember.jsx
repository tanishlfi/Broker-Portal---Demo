import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  IconButton,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { set } from "nprogress";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function RemoveMember({
  id,
  setPolicyMembers,
  noEdit,
  insuredLifeRemovalReason,
}) {
  const [open, setOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [removalReason, setRemovalReason] = React.useState("");

  const [EffectiveFrom, setEffectiveFrom] = React.useState(null);

  // First determine minimum date
  const today = dayjs();
  const isBeforeCutoff = today.date() < 16;
  const minDate = isBeforeCutoff
    ? today.endOf("month")
    : today.add(1, "month").endOf("month");
  const minMinDate = minDate.add(-1, "year").endOf("month");

  // Maximum date is 3 months from minimum date
  const maxDate = minDate.add(6, "month").endOf("month");
  // console.log("removalReason", insuredLifeRemovalReason);

  const handleRemove = async () => {
    setLoading(true);
    try {
      const reason = insuredLifeRemovalReason.find(
        (reason) => reason.id === removalReason,
      );

      // await axios.delete(`/api/members/${id}`);
      setPolicyMembers((prev) => {
        return prev.map((member) => {
          if (member.RolePlayerId === id) {
            return {
              ...member,
              MemberAction: 3,
              actionReason: reason.description,
              // EffectiveFrom: EffectiveFrom,
              insuredLifeStatusName: "Cancelled",
              insuredLifeStatus: 2,
              InsuredLifeRemovalReason: removalReason,
            };
          }
          return member;
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <IconButton color="warning" onClick={handleClickOpen}>
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {"Are you sure you want to remove this member?"}
        </DialogTitle>
        <DialogContent>
          <Stack sx={{ my: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="removal-reason-label">Removal Reason</InputLabel>
              <Select
                labelId="removal-reason-label"
                name="removalReason"
                label="Removal Reason"
                value={removalReason}
                onChange={(event) => {
                  setRemovalReason(event.target.value);
                }}
              >
                {insuredLifeRemovalReason.map((reason) => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          {
            // add date picker for cancellation date
            // input name is cancellation date
            // needs to be last day of the month and date
          }
          {/* <Grid item xs={6}>
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  views={["year", "month"]}
                  openTo="month"
                  maxDate={maxDate}
                  minDate={minMinDate}
                  label="Cancellation Date"
                  name="EffectiveFrom"
                  value={EffectiveFrom || minDate}
                  onChange={(newValue) => {
                    let date = dayjs(newValue);

                    date = date.endOf("month");

                    setEffectiveFrom(date);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemove}
            disabled={removalReason.length < 2 || noEdit ? true : false}
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
