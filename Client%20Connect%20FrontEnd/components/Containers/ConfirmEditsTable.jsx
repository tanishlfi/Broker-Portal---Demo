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
} from "@mui/material";
import RemoveMemberFormTableDialog from "components/PolicyForms/RemoveMemberFormTableDialog";
import MainMemberForm from "components/PolicyForms/MainMemberForm";
import SpouseForm from "components/PolicyForms/SpouseForm";
import {
  DataGridPremium,
  GridToolbar,
  useGridApiContext,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
} from "@mui/x-data-grid-premium";
import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import dayjs from "dayjs";
import ChildForm from "components/PolicyForms/ChildForm";
import SubMemberForm from "components/PolicyForms/SubMemberForm";
import BeneficiaryForm from "components/PolicyForms/BeneficiaryForm";
import SupportDocumentsMenu from "components/FormComponents.jsx/SupportDocumentsMenu";
import MemberStatusChip from "components/Bits/MemberStatusChip";
import RestoreDeletedUser from "components/PolicyForms/RestoreDeletedUser";

const ConfirmEditsTable = ({
  members,
  setMembers,
  diffArray,
  disabledFields,
}) => {
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
      field: "supportDocument",
      headerName: "Support Document",
      width: 100,
      renderCell: (params) => {
        return (
          <>
            {params?.row?.supportDocument &&
            params?.row?.supportDocument.length > 0 ? (
              <SupportDocumentsMenu
                supportDocument={params?.row?.supportDocument}
              />
            ) : (
              ""
            )}
          </>
        );
      },
    },
    {
      field: "rolePlayerId",
      headerName: "Role Player Id",
      width: 100,
      editable: true,
    },
    {
      field: "firstName",
      headerName: "First Name",
      width: 180,
      editable: true,
    },
    { field: "surname", headerName: "Surname", width: 150, editable: true },

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
      field: "idTypeId",
      headerName: "Id Type",
      width: 100,
      valueGetter: (params) => {
        if (params.row.idTypeId)
          return params.row.idTypeId === 1 ? "SA ID" : "Passport  ";
      },
    },
    { field: "idNumber", headerName: "Id Number", width: 130 },
    {
      field: "isVopdVerified",
      headerName: "VOPD",
      width: 100,
      valueGetter: (params) => {
        if (params.row.isVopdVerified)
          return params.row.isVopdVerified ? "Verified" : "Not Verified";
      },
    },

    {
      field: "is Beneficiary",
      headerName: "Beneficiary",
      width: 100,
      renderCell: (params) => {
        return params?.row?.PolicyMember?.isBeneficiary && <Chip label="Yes" />;
      },
    },

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
      field: "benefit",
      headerName: "Benefit Name",
      width: 230,
      valueGetter: (params) => {
        return params?.row?.PolicyMember?.benefit;
      },
    },
    {
      field: "benefitRate",
      headerName: "Benefit Rate",
      width: 130,
      type: "number",
      groupable: false,
      valueGetter: (params) => {
        if (
          !params?.row?.PolicyMember?.benefitRate ||
          params?.row?.status === "Deleted"
        ) {
          return;
        }

        return Number(params?.row?.PolicyMember?.benefitRate);
      },
    },

    {
      field: "remove",
      headerName: "Remove",
      width: 130,
      renderCell: (params) => {
        if (
          !params.row.status ||
          params?.row?.PolicyMember?.memberTypeId === 1
        ) {
          return;
        }

        if (params.row.status === "Deleted") {
          return (
            <RestoreDeletedUser member={params.row} setMembers={setMembers} />
          );
        } else {
          return (
            <RemoveMemberFormTableDialog
              member={params.row}
              setMembers={setMembers}
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
      firstName: member.firstName,
      surname: member.surname,
      memberType: member.PolicyMember.memberTypeId,
      idNumber: member.idNumber,
      isVopdVerified: member.isVopdVerified,
      dateVopdVerified: member.dateVopdVerified,
      remove: "remove",
      supportDocument: member?.PolicyMember?.supportDocument,
      PolicyMember: member.PolicyMember,
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
            <MainMemberForm
              disabledFields={disabledFields?.mainMember}
              diff={row?.diffArray}
              handleClose={() => {}}
              isEdit={true}
              data={row}
              setMembers={setMembers}
            />
          ) : row.PolicyMember.memberTypeId === 2 ? (
            <SpouseForm
              diff={row?.diffArray}
              edit={true}
              setMembers={setMembers}
              data={row}
            />
          ) : row.PolicyMember.memberTypeId === 3 ? (
            <ChildForm
              diff={row?.diffArray}
              data={row}
              edit={true}
              setMembers={setMembers}
            />
          ) : row.PolicyMember.memberTypeId === 4 ? (
            <SubMemberForm
              diff={row?.diffArray}
              data={row}
              edit={true}
              setMembers={setMembers}
            />
          ) : (
            <BeneficiaryForm
              diff={row?.diffArray}
              data={row}
              edit={true}
              setMembers={setMembers}
            />
          )}
        </Card>
      );
    },
    [setMembers, disabledFields],
  );

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
        rowThreshold={0}
        getDetailPanelHeight={({ row }) => "auto"}
        getDetailPanelContent={getDetailPanelContent}
        initialState={{
          ...rows.initialState,
          sorting: {
            ...rows.initialState?.sorting,
            sortModel: [{ field: "memberType", sort: "asc" }],
          },
        }}
      />
    </Stack>
  );
};

export default ConfirmEditsTable;
