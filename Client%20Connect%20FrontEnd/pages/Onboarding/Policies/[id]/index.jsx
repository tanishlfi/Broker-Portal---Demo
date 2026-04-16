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
  Chip,
} from "@mui/material";
import axios from "axios";
import AlertPopup from "components/Bits/AlertPopup";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";
import PageHeader from "components/Bits/PageHeader";
import ConfirmMembersTable from "components/Containers/ConfirmMembersTable";
import ViewPolicyCard from "components/Containers/ViewPolicyCard";
import PolicyNotes from "components/FormComponents.jsx/PolicyNotes";
import RejectPolicy from "components/FormComponents.jsx/RejectPolicy";

import CreatePolicyDetails from "components/PolicyForms/CreatePolicyDetails";
import PolicyButtons from "components/PolicyForms/PolicyButtons";
// import PolicyDetailsSelector2 from "components/PolicyForms/PolicyDetailsSelector2";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { nodeSa, rmaAPI } from "src/AxiosParams";
import GetEuropAssist from "../../_components/GetEuropAssist";
import ContentItem from "components/Containers/ContentItem";
import NoMainMember from "components/FormComponents.jsx/NoMainMember";
import dayjs from "dayjs";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { generateMemberChanges } from "components/utils/generateMemberChanges";
import cloneDeep from "lodash/cloneDeep"; // Assuming you'll use this for deep cloning

function addBusinessDays(date, days) {
  let result = dayjs(date);
  let added = 0;
  while (added < days) {
    result = result.add(1, "day");
    // 0 = Sunday, 6 = Saturday
    if (result.day() !== 0 && result.day() !== 6) {
      added++;
    }
  }
  return result;
}

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

  const [initPolicyDetails, setInitPolicyDetails] = useState({});

  const [policyInceptionDate, setPolicyInceptionDate] = useState("");
  const [waitingPeriod, setWaitingPeriod] = useState(0);
  const [maxCover, setMaxCover] = useState(0);

  const [updatedMainMember, setUpdatedMainMember] = useState({});
  const [productOptionId, setProductOptionId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [coverAmount, setCoverAmount] = useState(null);
  const [refetchBenefits, setRefetchBenefits] = useState(false);
  const [ownPolicy, setOwnPolicy] = useState(false);
  const [statedBenefitIds, setStatedBenefitIds] = useState([]);
  let { europeAssistFee } = GetEuropAssist();
  const [members, setMembers] = useState([]);
  const [initMembers, setInitMembers] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Flag

  useEffect(() => {
    setInitialDataLoaded(false);
    setMembers([]);
    setInitMembers([]);
  }, []);

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
        const policyData = data.data.data; // Convenience variable
        setPolicyDetails({
          ...data.data.data,
        });

        setWaitingPeriod(
          dayjs(data.data.data?.joinDate).format("YYYY-MM-DD") <
            dayjs("2022-03-01").format("YYYY-MM-DD")
            ? 6
            : 3,
        );
        setPolicyInceptionDate(data.data.data?.joinDate);
        setMaxCover(data.data.data?.coverAmount);

        // Set members for editing
        setMembers(cloneDeep(policyData?.members || [])); // Always use fresh data for 'members'

        // Only set initMembers if it hasn't been set yet
        if (!initialDataLoaded) {
          setInitMembers(cloneDeep(policyData?.members || [])); // Deep clone for safety
          setInitialDataLoaded(true); // Set the flag
        }

        let statedBenefitIds = [];
        data.data.data?.members.map((member) => {
          if (member.statedBenefitId) {
            statedBenefitIds.push(member.statedBenefitId);
          }
        });
        setStatedBenefitIds(statedBenefitIds);

        setRenderCounter(renderCounter + 1);

        setCoverAmount(data.data.data?.coverAmount);

        setOwnPolicy(data.data.data?.createdBy === user.user);
      },
    },
  );

  function isOlderThan10Days(createdAt) {
    if (!createdAt) return false;
    return dayjs().diff(dayjs(createdAt), "day") > 10;
  }

  if (isLoading || getPolicyDetails.isLoading) {
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
              href: `/Onboarding/Policies/${id}`,
            },
          ]}
        />

        <ViewPolicyCard policy={policyDetails} myPolicy={ownPolicy} />

        <Stack>
          <AppPolicyStatusChip status={policyDetails?.status} />

          <Alert severity="info" sx={{ my: 2 }} variant="outlined">
            {policyDetails?.status === "Expired" ? (
              <Box>
                <Typography fontWeight="bold">
                  Policy locked for editing (older than 10 working days)
                </Typography>
                <Typography variant="body2">
                  {policyDetails?.statusNote}
                </Typography>
                <Typography variant="body2">
                  Created At:{" "}
                  {policyDetails?.createdAt
                    ? dayjs(policyDetails.createdAt).format("YYYY-MM-DD")
                    : "N/A"}
                </Typography>
                <Typography variant="body2">
                  Expired Date:{" "}
                  {policyDetails?.createdAt
                    ? addBusinessDays(policyDetails.createdAt, 10).format(
                        "YYYY-MM-DD",
                      )
                    : "N/A"}
                </Typography>
              </Box>
            ) : (
              <>{policyDetails?.statusNote}</>
            )}
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

        <CreatePolicyDetails
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

        {members && members.length > 0 && productOptionId && (
          <>
            <NoMainMember members={members} setMembers={setMembers} />
            <ConfirmMembersTable
              members={members}
              setMembers={setMembers}
              policyInceptionDate={policyInceptionDate}
              waitingPeriod={waitingPeriod}
              maxCover={maxCover}
              coverAmount={coverAmount}
              productOptionId={productOptionId}
            />

            {policyDetails.status === "Draft" && (
              <PolicyButtons
                policyDetails={policyDetails}
                members={members}
                setMembers={setMembers}
                policyInceptionDate={policyInceptionDate}
                waitingPeriod={waitingPeriod}
                updatedMainMember={updatedMainMember}
                color="default"
              />
            )}

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

        {policyDetails.status === "Expired" ? (
          <Alert severity="error" sx={{ mt: 3 }}>
            Policy locked for editing (older than 10 days)
          </Alert>
        ) : (
          <>
            {" "}
            <Stack
              sx={{ mt: 3 }}
              direction="row"
              justifyContent="flex-start"
              spacing={2}
            >
              {policyDetails.status === "Draft" && (
                <PolicyButton
                  initMembers={initMembers}
                  setNodePolicyDetails={setPolicyDetails}
                  setNodeMembers={setMembers}
                  label="Save Changes"
                  status="Draft"
                  noValidate={true}
                  statusNote="Changes Saved"
                  data={{ ...policyDetails, members: [...members] }}
                  color="primary"
                  variant="contained"
                />
              )}

              {(policyDetails.status === "Processing" ||
                policyDetails.status === "Error" ||
                policyDetails.status === "Rejected" ||
                policyDetails.status === "Duplicate" ||
                policyDetails.status === "Submitted") && (
                <PolicyButton
                  initMembers={initMembers}
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

              {policyDetails.status === "Error" ||
              policyDetails.status === "Issue" ||
              policyDetails.status === "Rejected" ||
              policyDetails.status === "Draft" ||
              policyDetails.status === "Duplicate" ? (
                <SubmitForProcessing
                  initMembers={initMembers}
                  setPolicyDetails={setPolicyDetails}
                  policyDetails={policyDetails}
                  members={members}
                  setNodeMembers={setMembers}
                />
              ) : policyDetails.status === "Submitted" &&
                policyDetails.approverId &&
                policyDetails.approverId === user.user ? (
                <>
                  <PolicyButton
                    initMembers={initMembers}
                    setNodePolicyDetails={setPolicyDetails}
                    setNodeMembers={setMembers}
                    label="Approve Policy"
                    status="Approved"
                    statusNote="Policy Approved"
                    data={{ ...policyDetails, members: [...members] }}
                    color="success"
                    variant="contained"
                  />
                </>
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
          </>
        )}
      </Stack>
      {/* <AppPolicyStatusChip status={policyDetails?.status} /> */}
      {/* <AlertPopup
        severity="success"
        open={UpdatePolicy.isSuccess}
        message="Policy Updated Successfully"
      />
      <AlertPopup
        severity="error"
        open={UpdatePolicy.isError}
        message={
          UpdatePolicy.error?.response?.data?.message ||
          "An error occurred while updating the policy."
        }
      /> */}
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
  initMembers,
}) => {
  const accessToken = useToken();

  const queryClient = useQueryClient();

  let url = `${nodeSa}/onboarding/policies/${data.id}`;

  if (noValidate) {
    url = `${nodeSa}/onboarding/policies/${data.id}/save`;
  }

  // const UpdatePolicy = useMutation(
  //   (data) => {
  //     return axios.post(url, data, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //   },
  //   {
  //     enabled: !!accessToken,
  //     onSuccess: () => {
  //       queryClient.invalidateQueries(`getPolicyDetails`);
  //       // rerender CreatePolicyDetails component
  //     },
  //   }
  // );

  const UpdatePolicy = useMutation({
    mutationFn: (data) => {
      console.log("UpdatePolicy Data:", data);
      const url = `${nodeSa}/onboarding/policies/${data.id}`;
      return axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    enabled: !!accessToken,
    mutationKey: [`UpdatePolicy`, data.id],
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries(`getPolicyDetails`);
      }, 1000); // Delay to ensure UI updates before invalidation
    },
  });

  const handleSubmit = () => {
    data.status = status;
    data.statusNote = statusNote;

    const fieldsToLogChangesFor = [
      "coverAmount",
      "PreviousInsurer",
      "PreviousInsurerCancellationDate",
      "PreviousInsurerCoverAmount",
      "PreviousInsurerJoinDate",
      "PreviousInsurerPolicyNumber",
      "addressLine1",
      "addressLine2",
      "alsoMember",
      "benefitName",
      "cellNumber",
      "city",
      "client_type",
      "country",
      "dateOfBirth",
      "dateOfDeath",
      "dateVopdVerified",
      "deletedAt",
      "emailAddress",
      "exceptions",
      "fileId",
      "fileRow",
      "firstName",
      "gender",
      "idNumber",
      "id",
      "idTypeId",
      "idValid",
      "isBeneficiary",
      "isDisabled",
      "isStudent",
      "isVopdVerified",
      "joinDate",
      "mainMemberLinkId",
      "memberTypeId",
      "notes",
      "policyId",
      "postCode",
      "postalAddress1",
      "postalAddress2",
      "postalCity",
      "postalCode",
      "postalCountry",
      "postalProvince",
      "preferredCommunicationTypeId",
      "premium",
      "province",
      "rolePlayerId",
      "statedBenefit",
      "statedBenefitId",
      "status",
      "supportDocument",
      "surname",
      "tellNumber",
      "updatedAt",
      "updatedBy",
      "vopdResponse",
    ];

    const memberChanges = generateMemberChanges(
      initMembers,
      data.members,
      fieldsToLogChangesFor,
      ["createdAt"],
    );

    data.memberChanges = memberChanges;

    data.members = data.members.map((obj) => {
      let newObj = { ...obj };

      if (!Number.isInteger(newObj.id)) {
        delete newObj.id;
      }

      for (const prop in newObj) {
        if (newObj[prop] === "") {
          newObj[prop] = null;
        }
      }

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
          disabled={UpdatePolicy.isLoading}
          sx={{
            minWidth: 150, // Set the minimum width to 150px
          }}
          variant={variant ? variant : "contained"}
          color={color}
        >
          {UpdatePolicy.isLoading ? " Updating..." : label}
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
        message={UpdatePolicy.error?.response?.data?.message}
      />
    </Stack>
  );
};

const TotalPremium = ({
  statedBenefitIds,
  policyDetails,
  accessToken,
  europAssistFee,
}) => {
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

  const memberFee = europAssistFee / (1 - policyDetails?.commissionPercentage);

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

function SubmitForProcessing({
  policyDetails,
  setPolicyDetails,
  initMembers,
  setMembers,
  members,
}) {
  const today = dayjs();
  const joinDate = dayjs(policyDetails.joinDate);

  let isBefore = joinDate.isBefore(today.startOf("month"));

  let willChange = false;
  if (joinDate.isSame(today, "month")) {
    if (today.date() > 15 && !joinDate.isSame(today.add(1, "month"), "month")) {
      willChange = true;
    }
  }

  const handleSubmitForProcessing = () => {
    let newJoinDate = joinDate;
    // if join date is in current month → adjust depending on cutoff
    if (joinDate.isSame(today, "month")) {
      newJoinDate =
        today.date() > 15
          ? today.add(1, "month").startOf("month")
          : today.startOf("month");
    }

    setPolicyDetails((prev) => ({
      ...prev,
      joinDate: newJoinDate,
      status: "Processing",
      statusNote: "Policy Submitted for Processing",
    }));
  };

  return (
    <>
      {isBefore && (
        <Alert severity="error" sx={{ mb: 2 }}>
          ⚠️ The join date is in the past. Please correct it before submitting.
        </Alert>
      )}

      {willChange && (
        <Alert severity="info" sx={{ mb: 2 }}>
          ⚠️ The join date will be changed to next month due to the cutoff date
          being the 15th of the month.
        </Alert>
      )}

      {isBefore ? (
        <Button color="warning" variant="contained" disabled>
          Submit for Processing
        </Button>
      ) : (
        <PolicyButton
          initMembers={initMembers}
          setNodePolicyDetails={setPolicyDetails}
          setNodeMembers={setMembers}
          label="Submit for Processing"
          status="Processing"
          statusNote="Policy Submitted for Processing"
          data={{ ...policyDetails, members: [...members] }}
          color="warning"
          variant="contained"
          onClick={handleSubmitForProcessing}
        />
      )}
    </>
  );
}
