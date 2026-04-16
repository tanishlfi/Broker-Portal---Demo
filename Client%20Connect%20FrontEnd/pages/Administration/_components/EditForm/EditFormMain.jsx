import {
  DataGridPremium,
  GRID_AGGREGATION_FUNCTIONS,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
  useGridApiContext,
  useGridSelector,
  gridDetailPanelExpandedRowsContentCacheSelector,
} from "@mui/x-data-grid-premium";
import React, { useMemo } from "react";
import CoverMemberTypeChip from "../../../../components/Bits/CoverMemberTypeChip";
import { Alert, Card, Chip, IconButton, Stack, Tooltip } from "@mui/material";
import MainMemberEditForm from "./MainMemberEditForm";
import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OtherMembers from "./OtherMembers";
import RemoveMember from "./RemoveMember";
import EnableMember from "./EnableMember";
import SelectBenefit from "../SelectBenefit";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";

import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import DeletePolicyMember from "./DeletePolicyMember";

const EditFormMain = ({
  noEdit = false,
  PolicyMembers,
  setPolicyMembers,
  differences,
  PolicyData,
  benefits,
  insuredLifeRemovalReason,
}) => {
  const rows = useMemo(
    () =>
      PolicyMembers.map((member, index) => ({
        ...member,
        id: member.id || index,
      })),
    [PolicyMembers],
  );

  // console.log("PolicyMembers", PolicyMembers);

  // console.log("PolicyMembers", rows);

  const columns = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      width: 60,
      flex: 0,
      renderCell: (params) => {
        if (!params?.row?.id) {
          return null;
        }

        return <CustomDetailPanelToggle id={params.id} value={params.value} />;
      },
    },
    {
      field: "insuredLifeStatusName",
      headerName: "Status",
      width: 100,
      flex: 0,
      renderCell: (params) => {
        if (!params?.row?.id) {
          return null;
        }
        if (params.row.exceptions && params.row.exceptions.length > 0) {
          return <Chip label="Error" variant="outlined" color="error" />;
        }

        if (params?.row?.insuredLifeStatusName === "undefined") return null;
        return (
          <Chip
            label={params?.row?.insuredLifeStatusName}
            variant="outlined"
            color={
              params?.row?.insuredLifeStatusName === "Active"
                ? "success"
                : params?.row?.insuredLifeStatusName === "Inactive"
                ? "error"
                : "default"
            }
          />
        );
      },
    },
    {
      field: "MemberAction",
      headerName: "MemberAction",
      maxWidth: 130,
      flex: 1,
      renderCell: (params) => {
        if (typeof params?.row?.MemberAction === "undefined") return null;
        return <MemberActions MemberAction={params?.row?.MemberAction} />;
      },
    },
    // { field: "RolePlayerId", headerName: "Role Player Id", width: 130 },

    {
      field: "FullName",
      headerName: "Member",
      width: 300,
      flex: 1,
      valueGetter: (params) => {
        if (
          params?.row?.FirstName.toUpperCase() ||
          params?.row?.Surname.toUpperCase()
        ) {
          return `${params?.row?.FirstName.toUpperCase()} ${params?.row?.Surname.toUpperCase()}`;
        }
      },
    },
    {
      field: "MemberTypeId",
      headerName: "Member Type",
      width: 75,
      flex: 1,
      renderCell: (params) => {
        if (params?.row?.MemberTypeId)
          return <CoverMemberTypeChip id={params?.row?.MemberTypeId} />;
      },
    },

    { field: "IdNumber", headerName: "Id Number", width: 130 },
    {
      field: "IsBeneficiary",
      headerName: "Beneficiary",
      width: 75,
      renderCell: (params) => {
        if (params?.row?.IsBeneficiary) {
          return <StarIcon color="primary" />;
        }
        return "";
      },
    },
    {
      field: "IsVopdVerified",
      headerName: "VOPD",
      width: 50,
      renderCell: (params) => {
        if (params?.row?.IdTypeId === 1) {
          if (params?.row?.IsVopdVerified ? true : false) {
            return <CheckCircleOutlineIcon color="success" />;
          }
          return <CloseIcon color="warning" />;
        } else if (params?.row?.IdTypeId === 2) {
          return (
            <Tooltip
              label="Not a South African ID"
              title="Not a South African ID"
            >
              <AirplaneTicketIcon color="disabled" />
            </Tooltip>
          );
        } else {
          return null;
        }
      },
    },

    // {
    //   field: "benefitId",
    //   headerName: "benefitId",
    //   width: 50,
    // },

    {
      field: "Benefit",
      headerName: "Benefit",
      width: 270,
      flex: 1,
      renderCell: (params) => {
        // if (!params?.row?.RolePlayerId) {
        //   return null;
        // }

        if (
          params?.row?.MemberTypeId === "6" ||
          params?.row?.MemberTypeId === 6
        ) {
          return null;
        }

        if (params?.row?.insuredLifeStatusName === "Inactive") {
          return null;
        }

        if (params?.row?.Benefit) return params?.row?.Benefit;

        if (
          params?.row?.AlternativeOptions &&
          params?.row?.AlternativeOptions.length > 0
        ) {
          return (
            <SelectBenefit
              currentBenefit={params?.row?.benefitId}
              id={params?.row?.RolePlayerId}
              setPolicyMembers={setPolicyMembers}
              benefits={params?.row?.AlternativeOptions}
            />
          );
        } else {
          return <Alert severity="error">Select Allocate benefits</Alert>;
        }
      },
    },

    {
      field: "CoverAmount",
      headerName: "CoverAmount",
      width: 130,
      type: "number",
      flex: 1,
      groupable: false,
      valueFormatter: (params) => {
        if (typeof params?.value === "undefined") return null;
        // format to southAfrican currency
        return `R ${params?.value
          ?.toFixed(2)
          ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
      },
    },
    // {
    //   field: "Premium",
    //   headerName: "Premium",
    //   width: 130,
    //   type: "number",
    //   flex: 1,
    //   groupable: false,
    //   valueFormatter: (params) => {
    //     if (typeof params?.value === "undefined") return null;
    //     // format to southAfrican currency
    //     return `R ${params?.value
    //       ?.toFixed(2)
    //       ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    //   },
    // },
    // {
    //   field: "CalculatedPremium",
    //   headerName: "CalculatedPremium",
    //   width: 130,
    //   type: "number",
    //   flex: 1,
    //   groupable: false,
    //   valueFormatter: (params) => {
    //     if (typeof params?.value === "undefined") return null;
    //     // format to southAfrican currency
    //     return `R ${params?.value
    //       ?.toFixed(2)
    //       ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    //   },
    // },
    {
      field: "Remove",
      headerName: "Action",
      width: 130,
      flex: 0,

      renderCell: (params) => {
        if (noEdit) {
          return null;
        }

        if (!params?.row?.id) {
          return null;
        }
        if (params?.row?.MemberTypeId === 1) {
          return null;
        }

        if (params?.row?.insuredLifeStatusName === "Inactive") {
          return null;
        }

        if (
          params.row.RolePlayerId > 0 &&
          (params.row.insuredLifeStatusName === "Cancelled" ||
            params.row.MemberAction === 3)
        )
          return (
            <EnableMember
              noEdit={noEdit}
              id={params.row.RolePlayerId}
              setPolicyMembers={setPolicyMembers}
            />
          );

        if (params?.row?.MemberAction === 1) {
          return (
            <DeletePolicyMember
              noEdit={noEdit}
              id={params.row.id}
              setPolicyMembers={setPolicyMembers}
              PolicyMembers={PolicyMembers}
            />
          );
        }

        if (params.row.RolePlayerId > 0) {
          return (
            <RemoveMember
              noEdit={noEdit}
              id={params.row.RolePlayerId}
              setPolicyMembers={setPolicyMembers}
              insuredLifeRemovalReason={insuredLifeRemovalReason}
            />
          );
        }
      },
    },
  ];

  const getDetailPanelContent = React.useCallback(
    ({ row }) => {
      return (
        <Card sx={{ p: 2 }}>
          {row?.exceptions &&
            row?.exceptions?.length > 0 &&
            row?.exceptions.map((exception, index) => {
              return (
                <Alert key={index} severity={"error"}>
                  {exception?.field} : {exception?.message}
                </Alert>
              );
            })}

          {row.MemberTypeId === 1 ? (
            <MainMemberEditForm
              noEdit={noEdit}
              PolicyData={PolicyData}
              memberBenefits={benefits.filter(
                (benefit) => benefit.MemberTypeId === 1,
              )}
              differences={differences.find(
                (diff) => diff.RolePlayerId === row.RolePlayerId,
              )}
              action={row.MemberAction === 1 ? 1 : 2}
              setPolicyMembers={setPolicyMembers}
              data={row}
              insuredLifeRemovalReason={insuredLifeRemovalReason}
            />
          ) : row.MemberTypeId === 2 ? (
            <OtherMembers
              noEdit={noEdit}
              PolicyData={PolicyData}
              clientType="Spouse"
              differences={differences.find(
                (diff) => diff.RolePlayerId === row.RolePlayerId,
              )}
              action={row.MemberAction === 1 ? 1 : 2}
              setPolicyMembers={setPolicyMembers}
              data={row}
              insuredLifeRemovalReason={insuredLifeRemovalReason}
            />
          ) : row.MemberTypeId === 3 ? (
            <OtherMembers
              noEdit={noEdit}
              PolicyData={PolicyData}
              clientType="Child"
              differences={differences.find(
                (diff) => diff.RolePlayerId === row.RolePlayerId,
              )}
              action={row.MemberAction === 1 ? 1 : 2}
              setPolicyMembers={setPolicyMembers}
              data={row}
              insuredLifeRemovalReason={insuredLifeRemovalReason}
            />
          ) : row.MemberTypeId === 4 ? (
            <OtherMembers
              noEdit={noEdit}
              PolicyData={PolicyData}
              clientType="Extended"
              differences={differences.find(
                (diff) => diff.RolePlayerId === row.RolePlayerId,
              )}
              action={row.MemberAction === 1 ? 1 : 2}
              setPolicyMembers={setPolicyMembers}
              data={row}
              insuredLifeRemovalReason={insuredLifeRemovalReason}
            />
          ) : row.MemberTypeId === 6 ? (
            <OtherMembers
              noEdit={noEdit}
              PolicyData={PolicyData}
              clientType="Beneficiary"
              differences={differences.find(
                (diff) => diff.RolePlayerId === row.RolePlayerId,
              )}
              action={row.MemberAction === 1 ? 1 : 2}
              setPolicyMembers={setPolicyMembers}
              data={row}
              insuredLifeRemovalReason={insuredLifeRemovalReason}
            />
          ) : (
            <>
              {/* Select Member type */}

              <Alert severity="error">
                <strong>Select Member Type</strong>
              </Alert>

              <></>
            </>
          )}
        </Card>
      );
    },

    [
      setPolicyMembers,
      differences,
      benefits,
      PolicyData,
      noEdit,
      insuredLifeRemovalReason,
    ],
  );

  const customSumPremium = () => {
    let total = 0;

    total = PolicyMembers.filter(
      (row) => row.insuredLifeStatusName !== "Cancelled",
    ).reduce((acc, row) => acc + (row.Premium || 0), 0);

    return total;
  };

  return (
    <Card sx={{ width: "100%" }}>
      <StyledDataGrid
        slots={{
          showQuickFilter: true,
          // toolbar: GridToolbar,
        }}
        autoHeight
        rows={rows}
        columns={columns}
        getDetailPanelHeight={({ row }) => "auto"}
        // getRowId={(row) => row.RolePlayerId}
        getRowClassName={(params) =>
          `super-app-theme--${params.row.insuredLifeStatusName}`
        }
        style={gridContainerStyle}
        getDetailPanelContent={getDetailPanelContent}
        initialState={{
          ...rows.initialState,
          sorting: {
            ...rows.initialState?.sorting,
            sortModel: [
              { field: "insuredLifeStatusName", sort: "asc" },
              { field: "MemberTypeId", sort: "asc" },
            ],
          },
          pinnedColumns: {
            left: ["insuredLifeStatusName", "__detail_panel_toggle__"],
            right: ["Remove"],
          },
          // aggregation: {
          //   model: {
          //     Premium: "customSum",
          //   },
          // },
        }}
        // aggregationFunctions={{
        //   ...GRID_AGGREGATION_FUNCTIONS,
        //   customSum: customSumPremium,
        // }}
        hideFooter
      />
    </Card>
  );
};

const gridContainerStyle = {
  width: "100%",
  height: "100%",
  minWidth: "800px", // Ensure minimum width for pinned columns
  overflow: "auto",
};

export default EditFormMain;

const MemberActions = ({ MemberAction }) => {
  return (
    <Chip
      label={
        MemberAction === 0
          ? "No Change"
          : MemberAction === 1
          ? "New Member"
          : MemberAction === 2
          ? "Update"
          : MemberAction === 3
          ? "Deleted"
          : "No Change"
      }
      variant="contained"
      color={
        MemberAction === 0
          ? "default"
          : MemberAction === 1
          ? "success"
          : MemberAction === 2
          ? "warning"
          : MemberAction === 3
          ? "error"
          : "default"
      }
    />
  );
};

const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  "& .super-app-theme--Cancelled": {
    opacity: 0.5,
  },
}));

function CustomDetailPanelToggle(props) {
  const { id, value: isExpanded } = props;
  const apiRef = useGridApiContext();

  // To avoid calling ´getDetailPanelContent` all the time, the following selector
  // gives an object with the detail panel content for each row id.
  const contentCache = useGridSelector(
    apiRef,
    gridDetailPanelExpandedRowsContentCacheSelector,
  );

  // If the value is not a valid React element, it means that the row has no detail panel.
  const hasDetail = React.isValidElement(contentCache[id]);

  return (
    <IconButton
      edge={false}
      size="small"
      tabIndex={-1}
      disabled={!hasDetail}
      aria-label={isExpanded ? "Close" : "Open"}
    >
      <ExpandMoreIcon
        fontSize="large"
        sx={(theme) => ({
          transform: `rotateZ(${isExpanded ? 180 : 0}deg)`,
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.standard,
          }),
        })}
      />
    </IconButton>
  );
}
