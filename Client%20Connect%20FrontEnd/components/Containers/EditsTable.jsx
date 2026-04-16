import React from "react";
import {
  Card,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import RemoveMemberFormEditTableDialog from "components/PolicyForms/RemoveMemberFormEditTableDialog";
import MainMemberFormEdits from "components/PolicyForms/MainMemberFormEdits";
import MemberFormEdits from "components/PolicyForms/MemberFormEdits";
import SpouseForm from "components/PolicyForms/SpouseForm";
import {
  DataGridPremium,
  GridToolbar,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GRID_AGGREGATION_FUNCTIONS,
} from "@mui/x-data-grid-premium";
import styled from "@emotion/styled";
import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import dayjs from "dayjs";
import BeneficiaryFormEdits from "components/PolicyForms/BeneficiaryFormEdits";
import SupportDocumentsMenu from "components/FormComponents.jsx/SupportDocumentsMenu";
import MemberStatusChip from "components/Bits/MemberStatusChip";
import RestoreDeletedUser from "components/PolicyForms/RestoreDeletedUser";

const EditsTable = ({
  members,
  setMembers,
  diffArray,
  disabledFields,
  benefits,
  coverAmount,
  removalReasons,
}) => {
  // console.log("edits table", members);

  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        if (params?.row?.PolicyMember?.status)
          return (
            <MemberStatusChip status={params?.row?.PolicyMember?.status} />
          );
      },
    },
    {
      field: "hasDiff",
      headerName: "Is Edited",
      width: 100,
      editable: true,
      renderCell: (params) => {
        return (
          params.row.hasDiff && (
            <Chip label="Edited" variant="outlined" color="error" />
          )
        );
      },
    },

    {
      field: "memberType",
      headerName: "Member Type",
      width: 150,
      renderCell: (params) => {
        if (params?.row?.PolicyMember?.memberTypeId) {
          return (
            <CoverMemberTypeChip id={params?.row?.PolicyMember?.memberTypeId} />
          );
        }
      },
    },
    {
      field: "memberName",
      headerName: "Member",
      width: 250,
    },

    { field: "idNumber", headerName: "Id Number", width: 130 },

    {
      field: "age",
      headerName: "Age",
      width: 50,
      valueGetter: (params) => {
        if (params.row.dateOfBirth) {
          return dayjs().diff(params.row.dateOfBirth, "year");
        }
      },
    },

    {
      field: "statedBenefit",
      headerName: "Benefit Name",
      width: 350,
    },
    {
      field: "benefitAmount",
      headerName: "Benefit Amount",
      width: 130,
      type: "number",
      groupable: false,
    },
    {
      field: "benefitRate",
      headerName: "Benefit Rate",
      width: 130,
      type: "number",
      groupable: false,
      // set 2 decimal places
      valueFormatter: (params) => {
        if (typeof params.value === "number") {
          return params.value.toFixed(2); // This sets the precision to 2 decimal places
        } else {
          // Return a default or placeholder value if params.value is not a number
          return "N/A"; // Adjust this based on your needs
        }
      },
    },

    {
      field: "remove",
      headerName: "Remove",
      width: 130,
      renderCell: (params) => {
        if (
          !params?.row?.PolicyMember?.status ||
          params?.row?.PolicyMember?.memberTypeId === 1
        ) {
          return "";
        }

        if (params?.row?.PolicyMember?.status === "Deleted") {
          return (
            <RestoreDeletedUser member={params.row} setMembers={setMembers} />
          );
        } else {
          return (
            <RemoveMemberFormEditTableDialog
              member={params.row}
              setMembers={setMembers}
              removalReasons={removalReasons}
            />
          );
        }
      },
    },
  ];

  const rows = members?.map((member, index) => {
    return {
      id: index + 1,
      // edit: "edit",
      rolePlayerId: member.rolePlayerId,
      memberName: `${member.firstName} ${member.surname}`,
      firstName: member.firstName,
      surname: member.surname,
      memberType: member.PolicyMember.memberTypeId,
      idNumber: member.idNumber,
      isVopdVerified: member.isVopdVerified,
      dateVopdVerified: member.dateVopdVerified,
      remove: "remove",
      supportDocument: member?.PolicyMember?.supportDocument,
      PolicyMember: {
        ...member.PolicyMember,
        removalReason:
          member.PolicyMember.PolicyMemberStatusId > 1
            ? removalReasons?.find(
                (reason) =>
                  reason.id === member.PolicyMember.PolicyMemberStatusId,
              )?.description
            : "",
      },
      benefitRate: member.PolicyMember.benefitRate,
      statedBenefit: member.PolicyMember.statedBenefit,
      benefitAmount: member.PolicyMember.CoverAmount,
      diffArray: diffArray?.filter(
        (diff) => diff.rolePlayerId === member.rolePlayerId,
      )[0],
      hasDiff:
        diffArray?.filter((diff) => diff.rolePlayerId === member.rolePlayerId)
          .length > 0,
      ...member,
    };
  });

  const getDetailPanelContent = React.useCallback(
    ({ row }) => {
      return (
        <Card sx={{ p: 2 }}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h6">Changes</Typography>

              {dayjs(row?.diffArray?.updatedAt?.from) >
                dayjs(row?.diffArray?.updatedAt?.to) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  RMA Server Last Edit is newer than Client Server Last Edit
                </Alert>
              )}

              <List>
                <ListItem>
                  <ListItemText
                    primary={dayjs(row?.diffArray?.updatedAt?.from).format(
                      "DD/MM/YYYY HH:mm:ss",
                    )}
                    secondary="RMA Server Last Edit"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={dayjs(row?.diffArray?.updatedAt?.to).format(
                      "DD/MM/YYYY HH:mm:ss",
                    )}
                    secondary="Client Server Last Edit"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          {row.PolicyMember.memberTypeId === 1 ? (
            <MainMemberFormEdits
              disabledFields={disabledFields?.mainMember}
              diff={row?.diffArray}
              handleClose={() => {}}
              isEdit={true}
              data={row}
              setMembers={setMembers}
              benefits={benefits}
              coverAmount={coverAmount}
            />
          ) : row.PolicyMember.memberTypeId === 2 ? (
            <MemberFormEdits
              disabledFields={disabledFields?.mainMember}
              diff={row?.diffArray}
              handleClose={() => {}}
              isEdit={true}
              data={row}
              setMembers={setMembers}
            />
          ) : row.PolicyMember.memberTypeId === 3 ? (
            <MemberFormEdits
              disabledFields={disabledFields?.mainMember}
              diff={row?.diffArray}
              handleClose={() => {}}
              isEdit={true}
              data={row}
              setMembers={setMembers}
            />
          ) : row.PolicyMember.memberTypeId === 4 ? (
            <MemberFormEdits
              disabledFields={disabledFields?.mainMember}
              diff={row?.diffArray}
              handleClose={() => {}}
              isEdit={true}
              data={row}
              setMembers={setMembers}
            />
          ) : (
            <BeneficiaryFormEdits
              diff={row?.diffArray}
              data={row}
              edit={true}
              setMembers={setMembers}
            />
          )}
        </Card>
      );
    },
    [setMembers, disabledFields, benefits, coverAmount],
  );

  const customSumAggregation = {
    label: "Sum excluding deleted",
    apply: (params) => {
      return params.values.reduce((sum, value, index) => {
        const row = params.current.getRow(index);
        if (row && row.status !== "isDeleted") {
          return sum + value;
        }
        return sum;
      }, 0);
    },
    columnTypes: ["number"],
  };
  return (
    <Stack style={{ width: "94vw" }}>
      <DataGridPremium
        slots={{
          toolbar: GridToolbar,
        }}
        autoHeight
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        pinnedColumns={{ left: [GRID_DETAIL_PANEL_TOGGLE_FIELD, "status"] }}
        aggregationFunctions={{
          ...GRID_AGGREGATION_FUNCTIONS,
          customSum: customSumAggregation,
        }}
        rowThreshold={0}
        getDetailPanelHeight={({ row }) => "auto"}
        getDetailPanelContent={getDetailPanelContent}
        initialState={{
          ...rows.initialState,
          sorting: {
            ...rows.initialState?.sorting,
            sortModel: [{ field: "memberType", sort: "asc" }],
          },
          aggregation: {
            model: {
              benefitRate: "sum",
            },
          },
        }}
      />
    </Stack>
  );
};

const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  "& .super-app-theme--Deleted": {
    opacity: 0.5,
  },
}));

export default EditsTable;
