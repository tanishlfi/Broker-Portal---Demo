import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import ChildDialog from "components/PolicyForms/ChildDialog";
import SubMemberDialog from "components/PolicyForms/SubMemberDialog";

const {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} = require("@mui/material");
const {
  StyledTableRow,
  StyledTableCell,
} = require("components/Bits/TableCellAndTableRow");
const {
  default: EditMainMemberDialog,
} = require("components/PolicyForms/EditMainMemberDialog");
const {
  default: RemoveMemberFormTableDialog,
} = require("components/PolicyForms/RemoveMemberFormTableDialog");
const { default: SpouseDialog } = require("components/Routes/SpouseDialog");

const MembersTable = ({ members, setMembers }) => {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead
          sx={{
            backgroundColor: "background.paper",
          }}>
          <TableRow>
            <TableCell>VOPD</TableCell>
            <TableCell>Id Number</TableCell>
            <TableCell align="right">First Name</TableCell>
            <TableCell align="right">Surname</TableCell>
            <TableCell align="right">Client Type</TableCell>
            <TableCell align="right">Is Beneficiary</TableCell>
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
                <Chip
                  label={row.isVopdVerified ? "Verified" : "Not Verified"}
                  color={row.isVopdVerified ? "success" : "error"}
                />
              </TableCell>
              <TableCell component="th" scope="row">
                {row.idNumber}
              </TableCell>
              <StyledTableCell align="right">{row.firstName}</StyledTableCell>
              <StyledTableCell align="right">{row.surname}</StyledTableCell>
              <StyledTableCell align="right">
                <CoverMemberTypeChip id={row.PolicyMember.memberTypeId} />
              </StyledTableCell>
              <StyledTableCell align="right">
                {row.PolicyMember.isBeneficiary ? <Chip label="true" /> : null}
              </StyledTableCell>
              <StyledTableCell align="right">
                {row.PolicyMember.memberTypeId === 1 ? (
                  <EditMainMemberDialog setMembers={setMembers} data={row} />
                ) : row.PolicyMember.memberTypeId === 2 ? (
                  <SpouseDialog
                    edit={true}
                    client_type="spouse"
                    setMembers={setMembers}
                    data={row}
                  />
                ) : row.PolicyMember.memberTypeId === 3 ? (
                  <ChildDialog data={row} setMembers={setMembers} edit={true} />
                ) : (
                  <SubMemberDialog
                    data={row}
                    setMembers={setMembers}
                    edit={true}
                  />
                )}
              </StyledTableCell>
              <StyledTableCell align="right">
                <RemoveMemberFormTableDialog
                  member={row}
                  setMembers={setMembers}
                />
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MembersTable;
