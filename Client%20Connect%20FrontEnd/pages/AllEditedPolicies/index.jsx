import {
  DataGridPremium,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import { Button, LinearProgress, Chip, Box, Portal } from "@mui/material";
import PageHeader from "components/Bits/PageHeader";
import { nodeSa } from "src/AxiosParams";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "react-query";
import React from "react";
import axios from "axios";
import useToken from "hooks/useToken";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import RejectPolicyDialog from "components/PolicyForms/RejectPolicyDialog";

const getAllUserPolicies = (accessToken) => {
  return axios.get(`${nodeSa}/edit/policies`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

function MyCustomToolbar(props) {
  return (
    <React.Fragment>
      <Portal container={() => document.getElementById("filter-panel")}>
        <GridToolbarQuickFilter />
      </Portal>
      <GridToolbar {...props} />
    </React.Fragment>
  );
}

const AllEditedPolicies = () => {
  const router = useRouter();

  const accessToken = useToken();

  const getPolicies = useQuery(
    "getAllUserPolicies",
    () => getAllUserPolicies(accessToken),
    {
      enabled: !!accessToken,
    },
  );

  const ChangeStatusOfMarkedPolicies = useMutation(
    async (data) => {
      return await axios.post(
        `${nodeSa}/onboarding/policies/bulkUpdateStatus`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
    {
      onSuccess: () => {
        getPolicies.refetch();
      },
    },
  );

  const columns = [
    {
      field: "Manage Policy",
      headerName: "Mange Policy",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Button
              variant="contained"
              onClick={() => {
                router.push(
                  `/BrokerManager/UserPolicies/Edited/${params.row.providerId}`,
                );
              }}
            >
              View Edits
            </Button>
          </>
        );
      },
    },

    {
      field: "status",
      headerName: "Status",
      width: 130,

      renderCell: (params) => {
        return <AppPolicyStatusChip status={params.row.status} />;
      },
    },

    {
      field: "statusNote",
      headerName: "Comment",
      width: 130,
    },
    {
      field: "exceptionCount",
      headerName: "Errors",
      width: 100,
      renderCell: (params) => {
        return <Chip label={params.row.exceptionCount} variant="outlined" />;
      },
    },
    { field: "providerId", headerName: "Provider Id", width: 100 },
    { field: "policyMember", headerName: "Main Member ID", width: 180 },
    { field: "firstName", headerName: "firstName", width: 250 },
    { field: "surname", headerName: "surname", width: 200 },
    {
      field: "isApproved",
      headerName: "Is Approved",
      width: 100,
      renderCell: (params) => {
        return (
          <Chip
            label={params.row.isApproved ? "Yes" : "No"}
            color={params.row.isApproved ? "success" : "error"}
          />
        );
      },
    },

    { field: "createdAt", headerName: "Created At", width: 150 },
    // { field: "fileName", headerName: "File Name", width: 200 },
    {
      field: "rejectPolicy",
      headerName: "Reject Policy",
      width: 70,

      renderCell: (params) => {
        return (
          <RejectPolicyDialog
            policy={params.row}
            ChangeRequest={ChangeStatusOfMarkedPolicies}
          />
        );
      },
    },
  ];

  console.log(getPolicies?.data?.data?.data);

  console.log(getPolicies?.data?.data);
  const rows = getPolicies?.data?.data.data
    ? getPolicies?.data?.data.data?.map((row) => {
        const policyMainMember = row.members.find(
          (member) => member.PolicyMember.memberTypeId === 1,
        );
        return {
          id: row.id,
          status: row.status,
          statusNote: row.statusNote,
          providerId: row.providerId,
          policyMember: policyMainMember?.idNumber,
          firstName: policyMainMember?.firstName,
          surname: policyMainMember?.surname,
          fromFile: row?.File?.orgFileName,
          fileName: row?.File?.orgFileName,
          createdAt: new Date(row.createdAt).toLocaleString(),
          exceptionCount: row.exceptionCount,
        };
      })
    : [];

  return (
    <>
      <PageHeader
        title="User Edited Policies"
        subTitle={`
        This page shows all the policies that have been edited by the user.
        `}
      />
      {/* <Grid container></Grid> */}

      {getPolicies?.isLoading && <LinearProgress />}

      <div
        style={{
          height: 900,
          width: "94vw",
        }}
      >
        <Box id="filter-panel" />
        {rows && rows.length > 0 && (
          <DataGridPremium
            rows={rows}
            columns={columns}
            virtualization
            slots={{
              toolbar: MyCustomToolbar,
            }}
            initialState={{
              filter: {
                filterModel: {
                  items: [],
                  quickFilterExcludeHiddenColumns: true,
                },
              },
            }}
          />
        )}
      </div>
    </>
  );
};

export default AllEditedPolicies;
