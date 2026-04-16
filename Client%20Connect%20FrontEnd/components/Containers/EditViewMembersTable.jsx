import React from "react";
import { Card, Chip, Box } from "@mui/material";
import MemberFormViewOnly from "components/PolicyForms/MemberFormViewOnly";
import {
  DataGridPremium,
  GridToolbar,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GRID_AGGREGATION_FUNCTIONS,
} from "@mui/x-data-grid-premium";
import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import styled from "@emotion/styled";
import MemberStatusChip from "components/Bits/MemberStatusChip";
import StarIcon from "@mui/icons-material/Star";

const EditViewMembersTable = ({ members, preferredCommunicationMethod }) => {
  // console.log("confirmmemberstable", members);
  return (
    <>
      <MuiGrid
        members={members}
        preferredCommunicationMethod={preferredCommunicationMethod}
      />
    </>
  );
};

export default EditViewMembersTable;

const MuiGrid = ({ members, preferredCommunicationMethod }) => {
  // console.log("MuiGrid", policyDetails);

  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => {
        if (params?.row?.PolicyMember?.status)
          return (
            <MemberStatusChip status={params?.row?.PolicyMember?.status} />
          );
      },
    },

    // combine firstName and surname
    {
      field: "fullName",
      headerName: "Member",
      width: 300,
    },
    // {
    //   field: "age",
    //   headerName: "Age",
    //   width: 70,
    //   renderCell: (params) => {
    //     if (!params.row.dateOfBirth) {
    //       return;
    //     }

    //     params.row.dateOfBirth = new Date(params.row.dateOfBirth);
    //     const today = new Date();
    //     const birthDate = new Date(params.row.dateOfBirth);
    //     let age = today.getFullYear() - birthDate.getFullYear();
    //     return age;
    //   },
    // },

    {
      field: "memberType",
      headerName: "Member Type",
      width: 200,
      renderCell: (params) => {
        if (!params?.row?.PolicyMember?.memberTypeId) {
          return;
        }

        if (!params?.row?.PolicyMember?.memberTypeId) {
          return <Chip label="Select Member Type" color="error" />;
        }
        return (
          <CoverMemberTypeChip
            id={params?.row?.PolicyMember?.memberTypeId}
            memberType={params?.row?.PolicyMember?.memberType}
          />
        );
      },
    },
    {
      field: "IsBeneficiary",
      headerName: "Beneficiary",
      width: 100,
      renderCell: (params) => {
        if (params?.row?.PolicyMember?.isBeneficiary) {
          return <StarIcon color="primary" />;
        }
        return "";
      },
    },
    // {
    //   field: "idTypeId",
    //   headerName: "Id Type",
    //   width: 130,
    //   valueGetter: (params) => {
    //     if (!params.row.idTypeId) {
    //       return;
    //     }
    //     return params.row.idTypeId === 1 ? "SA ID" : "Passport";
    //   },
    // },
    { field: "idNumber", headerName: "Id Number", width: 180 },
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
    // {
    //   field: "benefitRate",
    //   headerName: "Base Rate",
    //   width: 130,
    //   type: "number",
    //   groupable: false,
    //   // set 2 decimal places
    //   valueFormatter: (params) => {
    //     if (typeof params.value === "number") {
    //       if (params.value === 0) {
    //         return "N/A";
    //       }
    //       // return Math.round(params.value);
    //       return params.value.toFixed(2); // This sets the precision to 2 decimal places
    //     } else {
    //       // Return a default or placeholder value if params.value is not a number
    //       return "N/A"; // Adjust this based on your needs
    //     }
    //   },
    // },
  ];

  const rows = members.map((member, index) => {
    return {
      id: member.id,
      // edit: "edit",
      exceptions: member.PolicyMember.exceptions,
      firstName: member.firstName,
      surname: member.surname,
      fullName: `${member.firstName} ${member.surname}`,
      memberType: member.PolicyMember.memberTypeId,
      idNumber: member.idNumber,
      isVopdVerified: member.isVopdVerified,
      dateVopdVerified: member.dateVopdVerified,
      statedBenefit: member.PolicyMember.statedBenefit,
      benefitRate: member.PolicyMember.benefitRate,
      benefitAmount: member.PolicyMember.benefitAmount,
      status: member.PolicyMember.status,
      supportDocument: member?.PolicyMember?.supportDocument,
      VOPD: member?.AstuteResponse?.status,
      ...member,
    };
  });

  const hasMainMember = members?.some((member) => {
    return member.PolicyMember.memberTypeId === 1;
  });

  const hasSpouse = members?.some((member) => {
    return member.PolicyMember.memberTypeId === 2;
  });

  // count Children

  const childrenCount = members?.filter((member) => {
    return member.PolicyMember.memberTypeId === 3;
  });

  const getDetailPanelContent = React.useCallback(
    ({ row }) => {
      // const clearErrorStatus = (data) => {
      //   console.log("row", row);
      //   if (
      //     (data.PolicyMember.exceptions.length === 0,
      //     data?.PolicyMember.status === "Error")
      //   ) {
      //     data.PolicyMember.status = "New";
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
            {
              <MemberFormViewOnly
                isEdit={true}
                data={row}
                preferredCommunicationMethod={preferredCommunicationMethod}
              />
            }
          </Card>
        </Box>
      );
    },
    [preferredCommunicationMethod]
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
    <Box
      style={{
        maxWidth: "94vw",
        "& .Deleted": {
          backgroundColor: "red",
          color: "gray",
        },
      }}>
      <StyledDataGrid
        slots={{
          toolbar: GridToolbar,
        }}
        autoHeight
        hideFooter
        rows={rows}
        columns={columns}
        rowThreshold={0}
        getDetailPanelHeight={({ row }) => "auto"}
        getDetailPanelContent={getDetailPanelContent}
        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
        pinnedColumns={{ left: [GRID_DETAIL_PANEL_TOGGLE_FIELD] }}
        aggregationFunctions={{
          ...GRID_AGGREGATION_FUNCTIONS,
          customSum: customSumAggregation,
        }}
        initialState={{
          ...rows.initialState,
          sorting: {
            ...rows.initialState?.sorting,
            sortModel: [
              { field: "status", sort: "asc" },
              { field: "memberType", sort: "asc" },
            ],
          },
          aggregation: {
            model: {
              benefitRate: "sum",
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
