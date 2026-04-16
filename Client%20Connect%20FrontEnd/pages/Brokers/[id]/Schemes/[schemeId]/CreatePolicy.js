import { useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Stack } from "@mui/system";
import PageHeader from "components/Bits/PageHeader";
import CreateMainMemberWrapper from "components/PolicyForms/MainMemberForm";
import SubMemberDialog from "components/PolicyForms/SubMemberDialog";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useLocalStorage } from "hooks/useLocalStorage";
import {
  StyledTableCell,
  StyledTableRow,
} from "components/Bits/TableCellAndTableRow";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const CreatePolicy = () => {
  const router = useRouter();

  const { id, schemeId } = router.query;
  const [members, setMembers] = useLocalStorage(`createPolicy${schemeId}`, []);

  const [date, setDate] = useLocalStorage(`createPolicy${schemeId}date`, null);

  const [editMain, setEditMain] = useState(false);

  // const [members, setMembers] = React.useState([]);

  const accessToken = useToken();

  const [selectedCategory, setSelectedCategory] = useLocalStorage(
    `selectedCategory${schemeId}`,
    ""
  );
  const [selectedAmount, setSelectedAmount] = useLocalStorage(
    `selectedAmount${schemeId}`,
    ""
  );

  const hasMainMember = members.some(
    (member) => member.client_type === "main_member"
  );
  const hasSpouse = members.some((member) => member.client_type === "spouse");

  const CountChildren = () => {
    let count = 0;
    members.forEach((member) => {
      if (member.client_type === "child") {
        count++;
      }
    });
    return count;
  };

  const CountFamilyMembers = () => {
    let count = 0;
    members.forEach((member) => {
      if (member.client_type !== "family") {
        count++;
      }
    });
    return count;
  };

  const CountExtendedMembers = () => {
    let count = 0;
    members.forEach((member) => {
      if (member.client_type !== "extended") {
        count++;
      }
    });
    return count;
  };

  const CountOther = () => {
    let count = 0;
    members.forEach((member) => {
      if (member.client_type !== "other") {
        count++;
      }
    });
    return count;
  };

  const handleSubmit = () => {
    console.log(members);
  };

  const handleReset = () => {
    setMembers([]);
    setSelectedCategory("");
    setSelectedAmount("");
  };

  return (
    <>
      <PageHeader
        title="Scheme"
        subTitle="Manage Scheme"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Brokers",
            href: "/Brokers",
          },
          {
            title: "Scheme",
            href: `/Brokers/${id}/Schemes/${schemeId}`,
          },
        ]}
      />

      <Stack sx={{ my: 4 }} direction="row" spacing={2}>
        <Box sx={{ maxWidth: 500, minWidth: 500 }}>
          <FormControl fullWidth>
            <InputLabel id="select_category">Select category</InputLabel>
            <Select
              labelId="select_category"
              id="select_category_id"
              value={selectedCategory}
              label="Select category"
              onChange={(event) => {
                setSelectedCategory(event.target.value);
              }}>
              {CoverCategory.map((category, index) => {
                return (
                  <MenuItem key={index} value={category.id}>
                    {category?.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ maxWidth: 200, minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel id="select_cover">Cover Amount</InputLabel>
            <Select
              labelId="select_cover"
              id="select_cover_id"
              value={selectedAmount}
              label="Select cover amount"
              onChange={(event) => {
                setSelectedAmount(event.target.value);
              }}>
              {/* {benefits.map((benefit) => (
            <Benefit accessToken={accessToken} key={benefit.id} B={benefit} />
          ))} */}
              {Amounts.map((amount, index) => {
                return (
                  <MenuItem key={index} value={amount.value}>
                    {amount?.title}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <FormControl margin="normal">
            <DatePicker
              views={["month", "year"]}
              margin="normal"
              label="Join Date"
              name="join_date"
              value={date}
              onChange={(event) => setDate(event)}
              variant="inline"
              inputVariant="outlined"
              fullWidth
              renderInput={(params) => <TextField {...params} />}
            />
          </FormControl>
        </LocalizationProvider>
      </Stack>

      {members && members.length > 0 && (
        <Stack sx={{ mb: 4 }}>
          <MembersTable
            setMembers={setMembers}
            members={members}
            editMain={editMain}
            setEditMain={setEditMain}
          />
        </Stack>
      )}

      {selectedCategory === 1 && selectedAmount && date && (
        <>
          {!hasMainMember ? (
            <Card>
              <CardHeader title="Add Main Member" />

              <CardContent>
                <CreateMainMemberWrapper
                  selectedCategory={selectedCategory}
                  setMembers={setMembers}
                  accessToken={accessToken}
                />
              </CardContent>
            </Card>
          ) : (
            <Stack
              sx={{ mt: 4 }}
              direction="row"
              justifyContent="space-between"
              spacing={2}>
              <Button variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
              <Button color="inherit" onClick={handleReset}>
                Reset
              </Button>
            </Stack>
          )}
        </>
      )}

      {editMain && (
        <CreateMainMemberWrapper
          selectedCategory={selectedCategory}
          data={members.find((member) => member.client_type === "main_member")}
          setMembers={setMembers}
          accessToken={accessToken}
        />
      )}

      {selectedCategory === 2 && selectedAmount && date && (
        <>
          {!hasMainMember && (
            <Card>
              <CardHeader title="Add Main Member" />
              <CardContent>
                <CreateMainMemberWrapper
                  setMembers={setMembers}
                  accessToken={accessToken}
                />
              </CardContent>
            </Card>
          )}

          {hasMainMember && selectedAmount && date && (
            <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
              {!hasSpouse && (
                <SubMemberDialog
                  selectedCategory={selectedCategory}
                  client_type="spouse"
                  setMembers={setMembers}
                />
              )}

              {CountChildren() < 4 && (
                <SubMemberDialog
                  selectedCategory={selectedCategory}
                  client_type="child"
                  setMembers={setMembers}
                />
              )}
            </Stack>
          )}
          <Stack
            sx={{ mt: 4 }}
            direction="row"
            justifyContent="space-between"
            spacing={2}>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
            <Button color="inherit" onClick={handleReset}>
              Reset
            </Button>
          </Stack>
        </>
      )}
      {selectedCategory === 3 && (
        <>
          {!hasMainMember && (
            <Card>
              <CardHeader title="Add Main Member" />
              <CardContent>
                <CreateMainMemberWrapper
                  selectedCategory={selectedCategory}
                  setMembers={setMembers}
                  accessToken={accessToken}
                />
              </CardContent>
            </Card>
          )}

          <Stack sx={{ mt: 2 }} direction="row" spacing={2}>
            {!hasSpouse && (
              <SubMemberDialog
                selectedCategory={selectedCategory}
                client_type="spouse"
                setMembers={setMembers}
              />
            )}

            {CountChildren() < 4 && (
              <SubMemberDialog
                selectedCategory={selectedCategory}
                client_type="child"
                setMembers={setMembers}
              />
            )}
            {CountFamilyMembers() < 4 && (
              <SubMemberDialog
                selectedCategory={selectedCategory}
                client_type="family"
                setMembers={setMembers}
              />
            )}

            {CountExtendedMembers() < 4 && (
              <SubMemberDialog
                selectedCategory={selectedCategory}
                client_type="extended"
                setMembers={setMembers}
              />
            )}
            {CountOther() < 4 && (
              <SubMemberDialog
                selectedCategory={selectedCategory}
                client_type="other"
                setMembers={setMembers}
              />
            )}
          </Stack>
        </>
      )}
    </>
  );
};

export default CreatePolicy;

const CoverCategory = [
  {
    id: 1,
    name: "Main member Only Cover",
    main_member: {
      amount: 1,
      maxAge: 65,
      coverMemberType: 1,
    },
    spouse: false,
    children: false,
    family: false,
    other: false,
  },
  {
    id: 2,
    name: "Main Member And Family Cover",
    main_member: {
      amount: 1,
      maxAge: 65,
      coverMemberType: 1,
    },
    spouse: {
      amount: 1,
      maxAge: 65,
      coverMemberType: 2,
    },
    children: {
      amount: 6,
      maxAge: 65,
      coverMemberType: 3,
    },
    family_extended: false,
    other: false,
  },
  {
    id: 3,
    name: "Main Member, Family And Extended Cover",
    main_member: {
      amount: 1,
      maxAge: 65,
      coverMemberType: 1,
    },
    spouse: {
      amount: 1,
      maxAge: 65,
      coverMemberType: 2,
    },
    children: {
      amount: 6,
      maxAge: 25,
      coverMemberType: 3,
    },
    family: {
      amount: 4,
      maxAge: 85,
      coverMemberType: 4,
    },
    extended: {
      amount: 4,
      maxAge: 65,
      coverMemberType: 4,
    },
    other: {
      amount: "any",
      maxAge: 200,
      coverMemberType: 6,
    },
  },
];

const Amounts = [
  { title: "10K", value: "10K" },
  { title: "15K", value: "15K" },
  { title: "20K", value: "20K" },
  { title: "30K", value: "30K" },
];

const MembersTable = ({ members, setMembers, editMain, setEditMain }) => {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead
          sx={{
            backgroundColor: "background.paper",
          }}>
          <TableRow>
            <TableCell>Id Number</TableCell>
            <TableCell align="right">First Name</TableCell>
            <TableCell align="right">Surname</TableCell>
            <TableCell align="right">Client Type</TableCell>
            <TableCell align="right">Edit</TableCell>
            <TableCell align="right">Remove</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((row, index) => (
            <StyledTableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {row.idNumber}
              </TableCell>
              <StyledTableCell align="right">{row.firstName}</StyledTableCell>
              <StyledTableCell align="right">{row.surname}</StyledTableCell>
              <StyledTableCell align="right">{row.client_type}</StyledTableCell>
              <StyledTableCell align="right">
                {row.client_type === "main_member" ? (
                  <EditMainMemberDialog setMembers={setMembers} data={row} />
                ) : (
                  <Button variant="outlined" color="warning">
                    Edit
                  </Button>
                )}
              </StyledTableCell>
              <StyledTableCell align="right">
                <RemoveMember member={row} setMembers={setMembers} />
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

import DeleteIcon from "@mui/icons-material/Delete";
import EditMainMemberDialog from "components/PolicyForms/EditMainMemberDialog";
import useToken from "hooks/useToken";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function RemoveMember({ member, setMembers }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const HandleRemove = () => {
    setMembers((prev) => {
      return prev.filter((item) => item.id !== member.id);
    });
    setOpen(false);
  };

  return (
    <div>
      <IconButton
        onClick={handleClickOpen}
        color="error"
        aria-label="Remove Member"
        component="label">
        <DeleteIcon />
      </IconButton>
      <Dialog
        sx={{ border: 5, borderColor: "error.main" }}
        open={open}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="Remove_member">
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
}
