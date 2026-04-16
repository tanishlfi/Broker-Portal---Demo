import { Support } from "@mui/icons-material";
import { Alert, Card, Chip } from "@mui/material";
import {
  DataGridPremium,
  GridToolbar,
  useGridApiRef,
} from "@mui/x-data-grid-premium";
import CoverMemberTypeChip from "components/Bits/CoverMemberTypeChip";
import SupportDocumentsMenu from "components/FormComponents.jsx/SupportDocumentsMenu";
import BeneficiaryForm from "components/PolicyForms/BeneficiaryForm";
import ChangeMemberType from "components/PolicyForms/ChangeMemberType";
import ChildForm from "components/PolicyForms/ChildForm";
import MainMemberForm from "components/PolicyForms/MainMemberForm";
import MemberForm from "components/PolicyForms/MemberForm";
import RemoveMemberFormTableDialog from "components/PolicyForms/RemoveMemberFormTableDialog";
import RemoveMemberFromCreateTable from "components/PolicyForms/RemoveMemberFromCreateTable";
import SpouseForm from "components/PolicyForms/SpouseForm";
import SubMemberForm from "components/PolicyForms/SubMemberForm";
import dayjs from "dayjs";
import { set } from "nprogress";
import React from "react";

const MembersDataGrid = ({
  members,
  setMembers,
  disabledFields,
  maxCover,
  waitingPeriod,
  policyInceptionDate,
  benefits,
  setUpdatedMainMember,
  updatedMainMember,
}) => {
  const apiRef = useGridApiRef();

  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        return (
          <Chip
            label={params?.row?.status}
            variant="outlined"
            color={
              params?.row?.status === "inActive"
                ? "error"
                : params?.row?.status === "isActive"
                ? "primary"
                : params?.row?.status === "New"
                ? "secondary"
                : "warning"
            }
          />
        );
      },
    },
    {
      field: "fullName",
      headerName: "Member",
      width: 300,
    },

    {
      field: "memberType",
      headerName: "Member Type",
      width: 130,
      renderCell: (params) => {
        if (params?.row?.memberTypeId) {
          return <CoverMemberTypeChip id={params?.row?.memberTypeId} />;
        }
      },
    },

    { field: "idNumber", headerName: "Id Number", width: 130 },

    {
      field: "age",
      headerName: "age",
      width: 150,
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
      valueGetter: (params) => {
        return params?.row?.statedBenefit;
      },
    },
    {
      field: "benefitRate",
      headerName: "Benefit Rate",
      width: 130,
      type: "number",
      groupable: false,
      valueGetter: (params) => {
        return Number(params?.row?.benefitRate);
      },
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
        if (params.row.id) {
          return (
            <RemoveMemberFromCreateTable
              member={params.row}
              setMembers={setMembers}
            />
          );
        } else {
          return "Total";
        }
      },
    },
  ];

  const rows = members.map((member, index) => {
    return {
      firstName: member?.firstName,
      surname: member?.surname,
      fullName: `${member?.firstName} ${member?.surname}`,
      memberType: member?.memberTypeId,
      idNumber: member?.idNumber,
      isVopdVerified: member?.isVopdVerified,
      dateVopdVerified: member?.dateVopdVerified,
      supportDocument: member?.supportDocument,
      remove: "remove",
      ...member,
    };
  });

  const hasMainMember = members.some((member) => {
    return member.memberTypeId === 1;
  });

  const hasSpouse = members.some((member) => {
    return member.memberTypeId === 2;
  });

  const getDetailPanelContent = React.useCallback(
    ({ row }) => {
      return (
        <Card sx={{ p: 2 }}>
          {/* {row?.exceptions &&
            row?.exceptions?.length > 0 &&
            row?.exceptions.map((exception, index) => {
              return (
                <Alert key={index} severity={"error"}>
                  {exception?.error}
                </Alert>
              );
            })} */}

          <ChangeMemberType
            id={row.id}
            hasMainMember={hasMainMember}
            hasSpouse={hasSpouse}
            setMembers={setMembers}
            open={row.memberTypeId === 0 || row.memberTypeId === null}
          />
          {row.memberTypeId === 1 ? (
            <MainMemberForm
              handleClose={() => {}}
              isEdit={true}
              data={row}
              setMembers={setMembers}
              maxCover={maxCover}
              waitingPeriod={waitingPeriod}
              policyInceptionDate={policyInceptionDate}
              benefits={benefits}
              setUpdatedMainMember={setUpdatedMainMember}
            />
          ) : row.memberTypeId === 2 ? (
            // (console.log("Spouse", waitingPeriod),
            <MemberForm
              memberType={"Spouse"}
              edit={true}
              setMembers={setMembers}
              data={row}
              maxCover={maxCover}
              waitingPeriod={waitingPeriod}
              policyInceptionDate={policyInceptionDate}
              benefits={updatedMainMember}
            />
          ) : row.memberTypeId === 3 ? (
            <MemberForm
              memberType={"Child"}
              data={row}
              edit={true}
              setMembers={setMembers}
              maxCover={maxCover}
              waitingPeriod={waitingPeriod}
              policyInceptionDate={policyInceptionDate}
              benefits={updatedMainMember}
            />
          ) : row.memberTypeId === 4 ? (
            <MemberForm
              memberType={"Extended Family"}
              data={row}
              edit={true}
              setMembers={setMembers}
              maxCover={maxCover}
              waitingPeriod={waitingPeriod}
              policyInceptionDate={policyInceptionDate}
              benefits={updatedMainMember}
            />
          ) : row.memberTypeId === 6 ? (
            <BeneficiaryForm
              data={row}
              edit={true}
              setMembers={setMembers}
              maxCover={maxCover}
            />
          ) : (
            <>
              {/* Select Member type */}

              <Alert severity="error">
                <strong>Select Member Type</strong>
              </Alert>

              <SubMemberForm data={row} edit={true} setMembers={setMembers} />
            </>
          )}
        </Card>
      );
    },
    [
      setMembers,
      hasMainMember,
      hasSpouse,
      maxCover,
      waitingPeriod,
      policyInceptionDate,
      benefits,
      setUpdatedMainMember,
      updatedMainMember,
    ]
  );

  return (
    <div style={{ width: "100%" }}>
      <DataGridPremium
        slots={{
          showQuickFilter: true,
          toolbar: GridToolbar,
        }}
        autoHeight
        rows={rows}
        columns={columns}
        getDetailPanelHeight={({ row }) => "auto"}
        getRowId={(row) => row.id}
        getDetailPanelContent={getDetailPanelContent}
        initialState={{
          sorting: {
            sortModel: [{ field: "memberType", sort: "asc" }],
          },
          aggregation: {
            model: {
              benefitRate: "sum",
            },
          },
        }}
      />

      {/* <Stack sx={{ mt: 4 }}>
        <Button variant="outlined" color="warning">
          Test For Approval
        </Button>
      </Stack> */}
    </div>
  );
};

export default MembersDataGrid;
