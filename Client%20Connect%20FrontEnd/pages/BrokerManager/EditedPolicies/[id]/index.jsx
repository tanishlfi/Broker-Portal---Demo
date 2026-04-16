import { Button, LinearProgress } from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";
import axios from "axios";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import PageHeader from "components/Bits/PageHeader";
import dayjs from "dayjs";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";

const GetBrokerEditedPolicies = (accessToken, id) => {
  return axios.get(`${nodeSa}/edit/policies?brokerageId=${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const EditedPolicies = () => {
  const router = useRouter();

  const { id } = router.query;

  const accessToken = useToken();

  const getPolicies = useQuery(
    "getAllUserPolicies",
    () => GetBrokerEditedPolicies(accessToken, id),
    {
      enabled: !!accessToken,
    }
  );

  const row = getPolicies?.data?.data?.data
    ? getPolicies?.data?.data?.data.map((item) => {
        //get main member
        const mainMember = item?.members?.find(
          (member) => member?.PolicyMember?.memberTypeId === 1
        );

        return {
          id: item?.id,
          policyId: item.providerId,
          idNumber: mainMember?.idNumber,
          firstName: mainMember?.firstName,
          surname: mainMember?.surname,
          PolicyMemberId: mainMember?.PolicyMember?.PolicyMemberId,
          status: item?.status,
          providerInceptionDate: item?.providerInceptionDate,
          joinDate: item?.joinDate,
          updatedAt: item?.updatedAt,
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

      {getPolicies?.isLoading && <LinearProgress />}

      <DataGridPremium
        rows={row}
        columns={[
          {
            field: "ViewEdit",
            headerName: "View/Edit",
            width: 150,
            renderCell: (params) => {
              return (
                <Button
                  variant="contained"
                  onClick={() => {
                    router.push({
                      pathname: `/BrokerManager/UserPolicies/Edited/${params.row.policyId}`,
                    });
                  }}>
                  View/Edit
                </Button>
              );
            },
          },
          {
            field: "status",
            headerName: "status",
            width: 150,
            editable: false,
            renderCell: (params) => {
              return <AppPolicyStatusChip status={params.row.status} />;
            },
          },
          {
            field: "policyId",
            headerName: "Policy Id",
            width: 150,
            editable: false,
          },
          {
            field: "idNumber",
            headerName: "Id Number",
            width: 150,
            editable: false,
          },

          {
            field: "firstName",
            headerName: "First Name",
            width: 150,
            editable: false,
          },
          {
            field: "surname",
            headerName: "Surname",
            width: 150,
            editable: false,
          },

          {
            field: "providerInceptionDate",
            headerName: "Provider Inception Date",
            width: 150,
            editable: false,
            valueGetter: (params) => {
              return dayjs(params.row.providerInceptionDate).format(
                "DD/MM/YYYY:HH:mm"
              );
            },
          },

          {
            field: "PolicyMemberId",
            headerName: "Policy Member Id",
            width: 150,
            editable: false,
          },

          {
            field: "joinDate",
            headerName: "Join Date",
            width: 150,
            editable: false,
            valueGetter: (params) => {
              return dayjs(params.row.joinDate).format("DD/MM/YYYY:HH:mm");
            },
          },
          {
            field: "updatedAt",
            headerName: "Updated At",
            width: 150,
            editable: false,
            valueGetter: (params) => {
              return dayjs(params.row.updatedAt).format("DD/MM/YYYY:HH:mm");
            },
          },
        ]}
        slots={{
          toolbar: GridToolbar,
        }}
        autoHeight
        disableSelectionOnClick
      />
    </>
  );
};

export default EditedPolicies;
