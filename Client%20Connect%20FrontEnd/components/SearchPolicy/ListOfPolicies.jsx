import { useUser } from "@auth0/nextjs-auth0/client";
import { Button, Chip, Stack, Alert, LinearProgress } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import axios from "axios";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import Scheme from "pages/Brokers/[id]/Schemes/[schemeId]";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const ListOfPolicies = ({ policies, setSearchComplete }) => {
  const accessToken = useToken();

  const router = useRouter();

  // console.log(policies);

  const [policyInfo, setPolicyInfo] = React.useState([]);

  const [onSuccessComplete, setOnSuccessComplete] = React.useState(false);

  // console.log(policies);

  // get brokerage and scheme details for each policy in PolicyInfo IN getPolicy
  // /clc/api/Policy/Policy/:id
  const getPolicyDetails = async (policyId) => {
    const result = await axios.get(
      `${rmaAPI}/clc/api/Policy/Policy/${policyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        enabled: !!accessToken,
        onError: (error) => {
          console.log("Error", error);
        },
      },
    );
    return result.data;
  };

  // get all scheme names from ${rmaAPI}/clc/api/Policy/Policy/policyId for each policy in policies
  const getPolicy = async () => {
    const policyDetailsPromises = policies.map((policy) =>
      getPolicyDetails(policy.policyId),
    );

    const policiesDetails = await Promise.all(policyDetailsPromises);

    const parentPolicyDetailsPromises = policies.map((policy) =>
      getPolicyDetails(policy.parentPolicyId),
    );

    const parentPoliciesDetails = await Promise.all(
      parentPolicyDetailsPromises,
    );

    // console.log(parentPoliciesDetails);

    let policyDetails = policies.map((policy, index) => {
      const policyDetailsArr = policiesDetails.filter(
        (policyDetail) => policyDetail.policyId === policy.policyId,
      )[0];

      // add scheme name from parentPolicyDetails
      const schemeName = parentPoliciesDetails.filter(
        (policyDetail) => policyDetail.policyId === policy.parentPolicyId,
      )[0];

      // console.log("schemeName", schemeName);

      return {
        id: policy.policyId,
        policyId: policy.policyId,
        policyNumber: policy.policyNumber,
        brokerageId: policy.brokerageId,
        parentPolicyId: policy.parentPolicyId,
        schemeName: schemeName?.clientName || "",
        brokerageName: policyDetailsArr?.brokerageName || "",
      };
    });

    setPolicyInfo(policyDetails);

    // console.log(policyDetails);

    setOnSuccessComplete(true);
    setSearchComplete(false);
  };

  // run getPolicy function
  if (policies && policies.length > 0 && !onSuccessComplete) {
    getPolicy();
  }

  const columns = [
    {
      field: "View",
      headerName: "View Policy",
      width: 250,

      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            onClick={() => {
              router.push(
                `/Administration/EditPolicy/${params.row.brokerageId}?schemeId=${params.row.parentPolicyId}&policyId=${params.row.policyId}`,
              );
            }}
          >
            View Policy
          </Button>
        );
      },
    },
    {
      field: "brokerageName",
      headerName: "Brokerage",
      width: 300,
    },
    {
      field: "schemeName",
      headerName: "Scheme",
      width: 300,
    },
    {
      field: "policyNumber",
      headerName: "Policy Number",
      width: 180,
    },

    // {
    //   field: "Members List",
    //   headerName: "Members List",
    //   width: 200,
    //   renderCell: (params) => {
    //     return (
    //       <>
    //         {params.row?.statusDescription === "Uploaded members" ? (
    //           <Button
    //             onClick={() => {
    //               router.push(returnLink(params.row.id));
    //             }}
    //             variant="contained"
    //             color="secondary"
    //           >
    //             View Members List
    //           </Button>
    //         ) : (
    //           ""
    //         )}
    //       </>
    //     );
    //   },
    // },
  ];

  return (
    <div>
      <Stack sx={{ mt: 4 }}>
        {!onSuccessComplete && <LinearProgress />}
        {onSuccessComplete && policyInfo && policyInfo?.length > 0 && (
          <DataGridPremium
            autoHeight
            rows={policyInfo}
            columns={columns}
            getRowId={(row) => row.policyId}
          />
        )}
      </Stack>
    </div>
  );
};

export default ListOfPolicies;
