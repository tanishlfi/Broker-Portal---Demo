import React from "react";
import { Card, Chip, Box } from "@mui/material";
import RemoveMemberFormTableDialog from "components/PolicyForms/RemoveMemberFormTableDialog";
import OnboardingMemberFormViewOnly from "components/PolicyForms/OnboardingMemberFormViewOnly";
import {
  DataGridPremium,
  GridToolbar,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GRID_AGGREGATION_FUNCTIONS,
} from "@mui/x-data-grid-premium";
import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import styled from "@emotion/styled";
import RestoreDeletedUser from "components/PolicyForms/RestoreDeletedUser";
import MemberStatusChip from "components/Bits/MemberStatusChip";

const ConfirmMembersTableView = ({
  members,
  setMembers,
  policyInceptionDate,
  waitingPeriod,
  maxCover,
  benefits,
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
        benefits={benefits}
      />
    </>
  );
};

export default ConfirmMembersTableView;

const MuiGrid = ({
  members,
  setMembers,
  policyInceptionDate,
  waitingPeriod,
  maxCover,
  benefits,
}) => {
  // console.log("MuiGrid", members);

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
    // combine firstName and surname
    {
      field: "fullName",
      headerName: "Member",
      width: 250,
    },
    // {
    //   field: "firstName",
    //   headerName: "First Name",
    //   width: 180,
    // },
    // { field: "surname", headerName: "Surname", width: 150 },
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
  ];

  const rows = members.map((member, index) => {
    return {
      id: member.id,
      // edit: "edit",
      exceptions: member.exceptions,
      firstName: member.firstName,
      surname: member.surname,
      fullName: `${member.firstName} ${member.surname}`,
      memberType: member.memberTypeId,
      idNumber: member.idNumber,
      isVopdVerified: member.isVopdVerified,
      dateVopdVerified: member.dateVopdVerified,
      statedBenefit: member.statedBenefit,
      premium: member.premium,
      status: member.status,
      supportDocument: member?.supportDocument,
      VOPD: member?.AstuteResponse?.status,
      ...member,
    };
  });

  const getDetailPanelContent = React.useCallback(
    ({ row }) => {
      // const clearErrorStatus = (data) => {
      //   console.log("row", row);
      //   if (
      //     (data.exceptions.length === 0,
      //     data?.status === "Error")
      //   ) {
      //     data.status = "New";
      //     setMembers(
      //       members.map((member) => {
      //         if (member.id === data.id) {
      //           return data;
      //         }
      //         return member;
      //       })
      //     );
      //   }
      // };

      // clearErrorStatus(row);
      return (
        <Box>
          <Card sx={{ p: 2 }}>
            <OnboardingMemberFormViewOnly
              isEdit={true}
              data={row}
              setMembers={setMembers}
              policyInceptionDate={policyInceptionDate}
              waitingPeriod={waitingPeriod}
              maxCover={maxCover}
              benefits={benefits}
            />
          </Card>
        </Box>
      );
    },
    [benefits, policyInceptionDate, setMembers, waitingPeriod, maxCover],
  );

  // const customSumAggregation = {
  //   label: "Sum excluding deleted",
  //   apply: (params) => {
  //     return params.values.reduce((sum, value, index) => {
  //       const row = params.current.getRow(index);
  //       if (row && row.status !== "isDeleted") {
  //         return sum + value;
  //       }
  //       return sum;
  //     }, 0);
  //   },
  //   columnTypes: ["number"],
  // };

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
        // aggregationFunctions={{
        //   ...GRID_AGGREGATION_FUNCTIONS,
        //   customSum: customSumAggregation,
        // }}
        initialState={{
          ...rows.initialState,
          sorting: {
            ...rows.initialState?.sorting,
            sortModel: [
              { field: "memberType", sort: "asc" },
              { field: "status", sort: "asc" },
            ],
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
