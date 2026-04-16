import React from "react";
import { Card, Chip, Box } from "@mui/material";
import RemoveMemberFormTableDialog from "components/PolicyForms/RemoveMemberFormTableDialog";
import MainMemberForm from "components/PolicyForms/MainMemberForm";
import SpouseForm from "components/PolicyForms/SpouseForm";
import MemberForm from "components/PolicyForms/MemberForm";
import {
  DataGridPremium,
  GridToolbar,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GRID_AGGREGATION_FUNCTIONS,
} from "@mui/x-data-grid-premium";
import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import ChildForm from "components/PolicyForms/ChildForm";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import SubMemberForm from "components/PolicyForms/SubMemberForm";
import BeneficiaryForm from "components/PolicyForms/BeneficiaryForm";
import ChangeMemberType from "components/PolicyForms/ChangeMemberType";
import styled from "@emotion/styled";
import RestoreDeletedUser from "components/PolicyForms/RestoreDeletedUser";
import SupportDocumentsMenu from "components/FormComponents.jsx/SupportDocumentsMenu";
import MemberStatusChip from "components/Bits/MemberStatusChip";

const ConfirmMembersTable = ({
  members,
  setMembers,
  policyInceptionDate,
  waitingPeriod,
  maxCover,
  coverAmount,
  productOptionId,
}) => {
  // console.log("confirmmemberstable", benefits);
  return (
    <>
      <MuiGrid
        members={members}
        setMembers={setMembers}
        policyInceptionDate={policyInceptionDate}
        waitingPeriod={waitingPeriod}
        maxCover={maxCover}
        coverAmount={coverAmount}
        productOptionId={productOptionId}
      />
    </>
  );
};

export default ConfirmMembersTable;

const MuiGrid = ({
  members,
  setMembers,
  policyInceptionDate,
  waitingPeriod,
  maxCover,
  coverAmount,
  productOptionId,
}) => {
  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => {
        if (params?.row?.status)
          return <MemberStatusChip status={params?.row?.status} />;
      },
    },
    {
      field: "exceptions",
      headerName: "Errors",
      width: 70,
      renderCell: (params) => {
        if (params?.row?.exceptions?.length === undefined) {
          return;
        }

        if (params?.row?.exceptions?.length === 0) {
          return <Chip label="0" color="success" />;
        } else {
          return <Chip label={params?.row?.exceptions?.length} color="error" />;
        }
      },
    },
    // combine firstName and surname
    {
      field: "fullName",
      headerName: "Member",
      width: 250,
    },
    {
      field: "age",
      headerName: "Age",
      width: 70,
      renderCell: (params) => {
        if (!params.row.dateOfBirth) {
          return;
        }

        params.row.dateOfBirth = new Date(params.row.dateOfBirth);
        const today = new Date();
        const birthDate = new Date(params.row.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        return age;
      },
    },

    {
      field: "memberType",
      headerName: "Member Type",
      width: 200,
      renderCell: (params) => {
        if (params?.row?.memberTypeId) {
          return <CoverMemberTypeChip id={params?.row?.memberType} />;
        }
      },
    },
    {
      field: "isBeneficiary",
      headerName: "Also Beneficiary",
      width: 150,
      renderCell: (params) => {
        if (params?.row?.isBeneficiary && params?.row?.memberTypeId !== 6) {
          return <CheckCircleOutlineIcon color="secondary" />;
        } else {
          return "";
        }
      },
    },
    {
      field: "idTypeId",
      headerName: "Id Type",
      width: 130,
      valueGetter: (params) => {
        if (!params.row.idTypeId) {
          return;
        }
        return params.row.idTypeId === 1 ? "SA ID" : "Passport";
      },
    },
    { field: "idNumber", headerName: "Id Number", width: 180 },
    { field: "statedBenefit", headerName: "Benefit Name", width: 400 },
    // {
    //   field: "premium",
    //   headerName: "Benefit Rate",
    //   width: 130,
    //   type: "number",
    //   groupable: false,
    //   // set 2 decimal places
    //   valueFormatter: (params) => {
    //     if (typeof params.value === "number") {
    //       return params.value.toFixed(2); // This sets the precision to 2 decimal places
    //     } else {
    //       // Return a default or placeholder value if params.value is not a number
    //       return "N/A"; // Adjust this based on your needs
    //     }
    //   },
    //   valueGetter: (params) => {
    //     if (!params?.row?.premium || params?.row?.status === "Deleted") {
    //       return;
    //     }

    //     return Number(params?.row?.premium);
    //   },
    // },
    {
      field: "remove",
      headerName: "Remove",
      width: 130,
      renderCell: (params) => {
        if (!params.row.status || params?.row?.memberTypeId === 1) {
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

  const rows = members.map((member, index) => {
    return {
      id: member.id,
      // edit: "edit",
      exceptions: member?.exceptions,
      firstName: member?.firstName,
      surname: member?.surname,
      fullName: `${member?.firstName} ${member?.surname}`,
      memberTypeId: member?.memberTypeId,
      memberType: member.memberTypeId,
      idNumber: member?.idNumber,
      isVopdVerified: member?.isVopdVerified,
      dateVopdVerified: member?.dateVopdVerified,
      statedBenefit: member?.statedBenefit,
      premium: member?.premium,
      status: member?.status,
      supportDocument: member?.supportDocument,
      VOPD: member?.vopdResponse?.status,
      isBeneficiary: member?.isBeneficiary || "",
      ...member,
    };
  });

  const hasMainMember = members?.some((member) => {
    return member?.memberTypeId === 1;
  });

  const hasSpouse = members?.some((member) => {
    return member.memberTypeId === 2;
  });

  // count Children

  const childrenCount = members?.filter((member) => {
    return member.memberTypeId === 3;
  });

  const getDetailPanelContent = React.useCallback(
    ({ row }) => {
      // clearErrorStatus(row);
      return (
        <Box>
          <Card>
            <ChangeMemberType
              id={row.id}
              hasMainMember={hasMainMember}
              hasSpouse={hasSpouse}
              childrenCount={childrenCount.length}
              setMembers={setMembers}
              open={row.memberTypeId === 0 || row.memberTypeId === null}
            />
            {row.memberTypeId === 1 ? (
              <MainMemberForm
                isEdit={true}
                data={row}
                setMembers={setMembers}
                policyInceptionDate={policyInceptionDate}
                waitingPeriod={waitingPeriod}
                maxCover={maxCover}
                coverAmount={coverAmount}
                productOptionId={productOptionId}
              />
            ) : row.memberTypeId === 2 ? (
              <MemberForm
                memberType={"Spouse"}
                edit={true}
                setMembers={setMembers}
                data={row}
                policyInceptionDate={policyInceptionDate}
                waitingPeriod={waitingPeriod}
                maxCover={maxCover}
              />
            ) : row.memberTypeId === 3 ? (
              <MemberForm
                memberType={"Child"}
                data={row}
                edit={true}
                setMembers={setMembers}
                policyInceptionDate={policyInceptionDate}
                waitingPeriod={waitingPeriod}
                maxCover={maxCover}
              />
            ) : row.memberTypeId === 4 ? (
              <MemberForm
                memberType={"Extended Family"}
                data={row}
                edit={true}
                setMembers={setMembers}
                policyInceptionDate={policyInceptionDate}
                waitingPeriod={waitingPeriod}
                maxCover={maxCover}
              />
            ) : row.memberTypeId === 6 ? (
              <BeneficiaryForm data={row} edit={true} setMembers={setMembers} />
            ) : (
              <>
                <SubMemberForm
                  data={row}
                  edit={true}
                  setMembers={setMembers}
                  policyInceptionDate={policyInceptionDate}
                  waitingPeriod={waitingPeriod}
                  maxCover={maxCover}
                />
              </>
            )}
          </Card>
        </Box>
      );
    },
    [
      setMembers,
      hasMainMember,
      hasSpouse,
      childrenCount,
      policyInceptionDate,
      waitingPeriod,
      maxCover,
      productOptionId,
      coverAmount,
    ]
  );

  return (
    <Box
      style={{
        // maxWidth: "94vw",
        "& .Deleted": {
          backgroundColor: "red",
          color: "gray",
        },
      }}
    >
      <StyledDataGrid
        slots={{
          toolbar: GridToolbar,
        }}
        autoHeight
        rows={rows}
        columns={columns}
        rowThreshold={0}
        getDetailPanelHeight={({ row }) => "auto"}
        getDetailPanelContent={getDetailPanelContent}
        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
        pinnedColumns={{ left: [GRID_DETAIL_PANEL_TOGGLE_FIELD] }}
        initialState={{
          ...rows.initialState,
          sorting: {
            ...rows.initialState?.sorting,
            sortModel: [{ field: "memberType", sort: "asc" }],
          },
          aggregation: {
            model: {
              premium: "sum",
            },
          },
        }}
      />
    </Box>
  );
};

const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  "& .super-app-theme--Deleted": {
    opacity: 0.5,
  },
}));
