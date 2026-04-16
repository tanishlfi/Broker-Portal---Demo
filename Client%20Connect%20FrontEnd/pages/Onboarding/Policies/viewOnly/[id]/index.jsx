import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Alert,
  Button,
  List,
  ListSubheader,
  Paper,
  Stack,
  Tooltip,
  LinearProgress,
  Box,
  Card,
  CardHeader,
  Typography,
} from "@mui/material";
import axios from "axios";
import AlertPopup from "components/Bits/AlertPopup";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import PageHeader from "components/Bits/PageHeader";
import ConfirmMembersTableView from "components/Containers/ConfirmMembersTableView";
import ViewPolicyCard from "components/Containers/ViewPolicyCard";
import PolicyNotes from "components/FormComponents.jsx/PolicyNotes";
import RejectPolicy from "components/FormComponents.jsx/RejectPolicy";
import SavePolicyWithoutValidation from "components/FormComponents.jsx/SavePolicyWithoutValidation";
import SavePolicyWithoutValidationSetDraft from "components/FormComponents.jsx/SavePolicyWithoutValidationSetDraft";
import AllocateBenefitsAndRates from "components/PolicyForms/AllocateBenefitsAndRates";
import CreatePolicyDetailsViewOnly from "components/PolicyForms/CreatePolicyDetailsViewOnly";
import PolicyButtons from "components/PolicyForms/PolicyButtons";
// import PolicyDetailsSelector2 from "components/PolicyForms/PolicyDetailsSelector2";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { nodeSa, rmaAPI } from "src/AxiosParams";
import GetEuropAssist from "../../../_components/GetEuropAssist";

import ContentItem from "components/Containers/ContentItem";
import NoMainMember from "components/FormComponents.jsx/NoMainMember";
import dayjs from "dayjs";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const ApprovePolicy = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const queryClient = useQueryClient();

  // added the render counter to force a rerender of the CreatePolicyDetails component
  const [renderCounter, setRenderCounter] = useState(0);

  const { id } = router.query;
  const accessToken = useToken();
  const [policyDetails, setPolicyDetails] = useState({
    joinDate: "",
    selectedCategory: "",
    coverAmount: "",
    productType: "Scheme",
    rules: "",
    representativeId: "",
    adminPercentage: "",
    commissionPercentage: "",
    paymentFrequencyId: "",
    regularInstallmentDayOfMonth: "",
    binderFeePercentage: "",
    SchemeRolePlayerId: "",
    productOptionId: "",
    policyInceptionDate: "",
    brokerageName: "",
    providerName: "",
  });

  const [members, setMembers] = useState([]);
  const [policyInceptionDate, setPolicyInceptionDate] = useState("");
  const [waitingPeriod, setWaitingPeriod] = useState(0);
  const [maxCover, setMaxCover] = useState(0);
  const [benefits, setBenefits] = useState([]);
  const [updatedMainMember, setUpdatedMainMember] = useState({});
  const [productOptionId, setProductOptionId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [coverAmount, setCoverAmount] = useState("");
  const [refetchBenefits, setRefetchBenefits] = useState(false);
  const [ownPolicy, setOwnPolicy] = useState(false);
  const [statedBenefitIds, setStatedBenefitIds] = useState([]);

  let { europeAssistFee } = GetEuropAssist();

  const getPolicyDetails = useQuery(
    [`getPolicyDetails`, id],
    () => {
      return axios.get(`${nodeSa}/onboarding/policies/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    {
      enabled: !!accessToken && !!id,

      onSuccess: (data) => {
        // console.log("policyDetails", data.data.data);
        setPolicyDetails({
          ...data.data.data,
          // categoryId: data.data.data?.selectedCategory,
        });
        // convert "2022-03-01" to a date object
        setWaitingPeriod(
          dayjs(data.data.data?.policyInceptionDate).format("YYYY-MM-DD") <
            dayjs("2022-03-01").format("YYYY-MM-DD")
            ? 6
            : 3,
        );
        setPolicyInceptionDate(data.data.data?.joinDate);
        setMaxCover(data.data.data?.coverAmount);

        // let mem = data.data.data?.members.map((member) => {
        //   return {
        //     ...member,
        //     PolicyMember: {
        //       ...member.PolicyMember,

        //     },
        //   };
        // });
        setMembers(data.data.data?.members);
        // setStatedBenefitIds to an array, append statedBenefitId in the data.data.data?.members to statedBenefitIds
        let statedBenefitIds = [];
        data.data.data?.members.map((member) => {
          if (member.statedBenefitId) {
            statedBenefitIds.push(member.statedBenefitId);
          }
        });
        setStatedBenefitIds(statedBenefitIds);

        setRenderCounter(renderCounter + 1);
        // set ownPolicy to true if the policy belongs to the user
        setOwnPolicy(data.data.data?.createdBy === user.user);
      },
    },
  );

  const UpdatePolicy = useMutation(
    (data) => {
      return axios.post(`${nodeSa}/onboarding/policies`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries(`getPolicyDetails`);
      },
    },
  );
  // get benefits if policyDetails.productOptionId and selectedCategory is available
  const getBenefits = useQuery(
    `getBenefits${policyDetails.productOptionId}`,
    async () =>
      await axios.get(
        `${nodeSa}/benefits/${productOptionId}?selectedCategory=${selectedCategory}&coverAmount=${coverAmount}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    {
      enabled:
        !!accessToken &&
        !!productOptionId &&
        !!selectedCategory &&
        !!coverAmount,
      onSuccess: (data) => {
        setBenefits(data?.data?.data);
        setRefetchBenefits(false);
        // console.log("getBenefits", data?.data?.data);
      },
    },
  );

  // rerun getBenefits if productOptionId and selectedCategory and coverAmount is changed
  React.useEffect(() => {
    if (refetchBenefits && productOptionId && selectedCategory && coverAmount) {
      getBenefits.refetch();
    }
  }, [
    refetchBenefits,
    productOptionId,
    selectedCategory,
    coverAmount,
    getBenefits,
  ]);

  const clearData = () => {
    // set PolicyDetails Status to Processing

    let clear = members.map((obj) => {
      let newObj = { ...obj };
      // If policyId doesn't exist, add a policyId property with the desired value
      if (!newObj.policyId) {
        newObj = {
          ...newObj,
          PolicyMember: {
            ...newObj.PolicyMember,
            policyId: id,
          },
        };
      }
      for (const prop in newObj) {
        if (newObj[prop] === "") {
          newObj[prop] = null;
        }
      }
      if (
        typeof newObj.id === "string" &&
        newObj.id.match(
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        )
      ) {
        // If the id is a UUID, remove it
        const { id, ...rest } = newObj;
        return rest;
      } else if (typeof newObj.id === "number") {
        // If the id is a number, keep it
        return newObj;
      }
      return newObj;
    });
    let clearPolicyDetails = { ...policyDetails, status: "Processing" };
    const data = {
      ...clearPolicyDetails,
      members: clear,
    };

    return data;
  };

  const handleSubmit4Approval = () => {
    // set PolicyDetails Status to Processing

    UpdatePolicy.mutate(clearData());
  };

  const handleSubmitApproved = () => {
    UpdatePolicy.mutate(clearData());
  };

  const handleSubmit = () => {
    UpdatePolicy.mutate(clearData());
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <div>
      <Stack sx={{ mb: 4 }}>
        <PageHeader
          title="Onboarding"
          subTitle="Manage Policy"
          breadcrumbs={[
            {
              title: "Home",
              href: "/",
            },
            {
              title: `Policies`,
              href: `/Onboarding/Policies`,
            },
            {
              title: `Policy Details`,
              href: `/Onboarding/Policies/viewOnly/${id}`,
            },
          ]}
        />

        <ViewPolicyCard policy={policyDetails} myPolicy={ownPolicy} />

        <Stack>
          <AppPolicyStatusChip status={policyDetails?.status} />
          <Alert severity="info" sx={{ my: 2 }} variant="outlined">
            {policyDetails?.statusNote}
          </Alert>

          {policyDetails?.status === "Processing" && (
            <>
              <Stack direction="row">
                {policyDetails?.checks?.map((check, index) => {
                  return (
                    <ContentItem
                      key={index}
                      title={check.checkDescr}
                      value={
                        <Tooltip
                          title={
                            check.status === true ? "Complete" : "Processing"
                          }
                        >
                          <>
                            {check.status === true ? "Complete" : "Processing"}
                          </>
                        </Tooltip>
                      }
                    />
                  );
                })}
              </Stack>
            </>
          )}
        </Stack>

        <CreatePolicyDetailsViewOnly
          key={renderCounter}
          policyDetails={policyDetails}
          setPolicyDetails={setPolicyDetails}
          RMAPolicy={policyDetails.providerId}
          setMaxCover={setMaxCover}
          setWaitingPeriod={setWaitingPeriod}
          setPolicyInceptionDate={setPolicyInceptionDate}
          setCoverAmount={setCoverAmount}
          setProductOptionId={setProductOptionId}
          setSelectedCategory={setSelectedCategory}
          setRefetchBenefits={setRefetchBenefits}
        />

        {/* <PolicyDetailsSelector2
          productOptionId={getPolicyDetails?.data?.data?.data?.productOptionId}
          policyDetails={policyDetails}
          setPolicyDetails={setPolicyDetails}
        /> */}

        {members && members.length > 0 && (
          <>
            <NoMainMember members={members} setMembers={setMembers} />
            <ConfirmMembersTableView
              members={members}
              setMembers={setMembers}
              policyInceptionDate={policyInceptionDate}
              waitingPeriod={waitingPeriod}
              maxCover={maxCover}
              benefits={benefits}
            />
            {/* {console.log("policyDetails", policyDetails)} */}
            {"premiumAdjustmentPercentage" in policyDetails && (
              <TotalPremium
                statedBenefitIds={statedBenefitIds}
                policyDetails={policyDetails}
                accessToken={accessToken}
                europAssistFee={europeAssistFee}
              />
            )}
            <PolicyNotes
              policyId={getPolicyDetails?.data?.data?.data?.id}
              onboarding_logs={
                getPolicyDetails?.data?.data?.data?.onboarding_logs
              }
            />
          </>
        )}

        {/* {console.log("mem3", policyDetails)}
        {console.log("user", user)}
        {console.log(
          `result ${policyDetails.approverId} = ${user.user} `,
          policyDetails.approverId === user.user,
        )} */}
        <Stack
          sx={{ mt: 3 }}
          direction="row"
          justifyContent="flex-start"
          spacing={2}
        >
          {(policyDetails.status === "Processing" ||
            policyDetails.status === "Error" ||
            policyDetails.status === "Rejected" ||
            policyDetails.status === "Duplicate" ||
            policyDetails.status === "Submitted") &&
            policyDetails.createdBy &&
            policyDetails.createdBy === user.user && (
              <PolicyButton
                setNodePolicyDetails={setPolicyDetails}
                setNodeMembers={setMembers}
                label="Return to Draft"
                status="Draft"
                statusNote="Policy Returned to Draft"
                data={{ ...policyDetails, members: [...members] }}
                color="primary"
                variant="contained"
              />
            )}

          {policyDetails.status === "Submitted" &&
          policyDetails.approverId &&
          policyDetails.approverId === user.user ? (
            <PolicyButton
              setNodePolicyDetails={setPolicyDetails}
              setNodeMembers={setMembers}
              label="Approve Policy"
              status="Approved"
              statusNote="Policy Approved"
              data={{ ...policyDetails, members: [...members] }}
              color="success"
              variant="contained"
            />
          ) : (
            <></>
          )}

          {policyDetails.status === "Submitted" &&
            policyDetails.approverId &&
            policyDetails.approverId === user.user && (
              <RejectPolicy
                policy={{ ...policyDetails, members: [...members] }}
                setMembers={setMembers}
                setPolicyDetails={setPolicyDetails}
              />
            )}
        </Stack>
      </Stack>
      {/* <AppPolicyStatusChip status={policyDetails?.status} /> */}
      <AlertPopup
        severity="success"
        open={UpdatePolicy.isSuccess}
        message="Policy Updated Successfully"
      />
      <AlertPopup
        severity="error"
        open={UpdatePolicy.isError}
        message="Error Updating Policy"
      />
    </div>
  );
};

export default ApprovePolicy;

const PolicyButton = ({
  setNodePolicyDetails,
  setNodeMembers,
  label,
  status,
  statusNote,
  data,
  color,
  noValidate,
  variant,
}) => {
  const router = useRouter();
  const accessToken = useToken();

  const queryClient = useQueryClient();

  let url = `${nodeSa}/onboarding/policies/${data.id}`;

  if (noValidate) {
    url = `${nodeSa}/onboarding/policies/${data.id}/save`;
  }

  const UpdatePolicy = useMutation(
    (data) => {
      // console.log("data", data);
      return axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        // redirect to /onboarding/policies/{id}
        if (["Draft", "Rejected"].includes(status)) {
          // router.push(`/Onboarding/Policies/${data.id}`);
          setTimeout(() => {
            // change redirect endpoint for consistency from `/BrokerManager/UserPolicies/Created/${data.data.data.id}?policyId=${id}&schemeId=${schemeId}`
            router.push(`/Onboarding/Policies/${data.id}`);
          }, 1000);
        } else {
          queryClient.invalidateQueries(`getPolicyDetails`);
        }
        // rerender CreatePolicyDetails component
      },
    },
  );

  const handleSubmit = () => {
    data.status = status;
    data.statusNote = statusNote;

    // check for id not integer and then remove it on data.members
    data.members = data.members.map((obj) => {
      let newObj = { ...obj };
      // Check if the id is not an integer and remove it
      if (!Number.isInteger(newObj.id)) {
        delete newObj.id;
      }

      // check all keys for "" and replace with null
      for (const prop in newObj) {
        if (newObj[prop] === "") {
          newObj[prop] = null;
        }
      }

      // check all keys for "" and replace with null for PolicyMember
      for (const prop in newObj.PolicyMember) {
        if (newObj.PolicyMember[prop] === "") {
          newObj.PolicyMember[prop] = null;
        }
      }

      return newObj;
    });

    // console.log("Data", data);

    UpdatePolicy.mutate(data, {
      onSuccess: (data) => {
        setNodePolicyDetails(data.data.data);
        setNodeMembers(data.data.data?.members);
      },
    });
  };

  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between">
        <Button
          onClick={() => {
            handleSubmit();
          }}
          // size="large"
          sx={{
            minWidth: 150, // Set the minimum width to 150px
          }}
          variant={variant ? variant : "contained"}
          color={color}
        >
          {label}
        </Button>
      </Stack>

      <AlertPopup
        severity="success"
        open={UpdatePolicy?.isSuccess}
        message="Policy Updated Successfully"
      />

      <AlertPopup
        severity="error"
        open={UpdatePolicy?.isError}
        message="Error Updating Policy"
      />
    </Stack>
  );
};

// total premium function that takes in all the stated benefits and policyDetails and returns the total premium
const TotalPremium = ({
  statedBenefitIds,
  policyDetails,
  accessToken,
  europAssistFee,
}) => {
  // console.log("statedBenefits", statedBenefitIds);
  // console.log("policyDetailsCalc", policyDetails);

  const [baseRate, setBaseRate] = useState(0);

  const getMemberBenefits = useQuery(
    [`getMemberBenefits`, statedBenefitIds],
    () => {
      return Promise.all(
        statedBenefitIds.map(async (item) => {
          return await axios.get(
            `${rmaAPI}/clc/api/Product/Benefit/${item}`,
            {},
          );
        }),
      );
    },
    {
      enabled: !!statedBenefitIds && !!accessToken,
      onSuccess: async (data) => {
        const resolvedData = await Promise.all(data);
        let baseRateCalc = 0;
        resolvedData.map((item) => {
          if (
            item.data?.benefitRates.length > 0 &&
            item.data?.benefitRates[0].baseRate > 0
          ) {
            baseRateCalc += item.data?.benefitRates[0].baseRate;
          }
        });

        setBaseRate(
          baseRateCalc * (1 + policyDetails?.premiumAdjustmentPercentage),
        );
      },
    },
  );

  // console.log("baseRate", baseRate);

  // once baseRate is set, get calculated premium
  const getCalculatedPremium = useQuery(
    [
      "getCalculatedPremium",
      policyDetails?.SchemeRolePlayerId,
      policyDetails?.productOptionId,
      baseRate,
      policyDetails?.adminPercentage,
      policyDetails?.commissionPercentage,
      policyDetails?.binderFeePercentage,
    ],
    () => {
      const data = {
        benefitRate: baseRate,
        // premiumAdjustmentPercentage: policyDetails?.premiumAdjustmentPercentage,
        adminFeePercentage: policyDetails?.adminPercentage,
        commissionPercentage: policyDetails?.commissionPercentage,
        binderFeePercentage: policyDetails?.binderFeePercentage,
      };

      return axios.post(`${nodeSa}/premiumCalculator`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken && getMemberBenefits.isSuccess && baseRate > 0,
    },
  );

  // console.log("getCalculatedPremium", getCalculatedPremium);
  // console.log("eurAssistFee", europAssistFee);

  const memberFee = europAssistFee / (1 - policyDetails?.commissionPercentage);
  // console.log(
  //   "getCalculatedPremium",
  //   getCalculatedPremium?.data?.data?.data + europAssistFee,
  // );

  // if getCalculatedPremium is successful, return the total premium
  if (getCalculatedPremium.isSuccess) {
    return (
      <Card sx={{ my: 4 }}>
        <CardHeader
          align="right"
          title={`Total Premium: R ${
            ![376524, 462645].includes(policyDetails?.providerId) &&
            new Date(policyDetails?.providerInceptionDate) <
              new Date("2023-11-01")
              ? Math.round(
                  getCalculatedPremium?.data?.data?.data + europAssistFee,
                ).toFixed(2)
              : (
                  getCalculatedPremium?.data?.data?.data + europAssistFee
                ).toFixed(2) || "0.00"
          }`}
          subheader={
            <Stack>
              <Typography>{`Admin Fee : R ${(
                getCalculatedPremium?.data?.data?.data -
                baseRate +
                memberFee
              )
                ?.toFixed(2)
                ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")}
             
              `}</Typography>
              {policyDetails.isEuropAssist && (
                <Typography
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  Europ Assist :&nbsp;
                  <CheckBoxIcon style={{ color: "green" }} />
                </Typography>
              )}
            </Stack>
          }
        />
      </Card>
    );
  }
};
