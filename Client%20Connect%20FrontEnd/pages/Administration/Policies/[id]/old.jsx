import { useUser } from "@auth0/nextjs-auth0/client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useToken from "hooks/useToken";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import axios from "axios";
import EditsTable from "components/Containers/EditsTable";
import { Alert, Button, Stack } from "@mui/material";
import PageHeader from "components/Bits/PageHeader";
import ViewEditPolicyCard from "components/Containers/ViewEditPolicyCard";
import DifferencesInPolicies from "components/FormComponents.jsx/DifferencesInPolicies";
import LoadingStack from "components/Containers/LoadingStack";
import EditPolicy from "components/FormComponents.jsx/EditPolicy";
import PolicyButtonsEdits from "components/PolicyForms/PolicyButtonsEdits";
import PolicyNotes from "components/FormComponents.jsx/PolicyNotes";
import RejectPolicy from "components/FormComponents.jsx/RejectPolicy";
import AlertPopup from "components/Bits/AlertPopup";
import dayjs from "dayjs";
import AppPolicyStatusChip from "components/Bits/AppPolicyStatusChip";

const Edited = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const { id } = router.query;

  const accessToken = useToken();
  const [NodeMembers, setNodeMembers] = useState([]);
  const [NodePolicyDetails, setNodePolicyDetails] = useState({
    brokerageName: "",
    providerName: "",
    providerInceptionDate: "",
    policyNumber: "",
    joinDate: "",
    createdBy: "",
    approverId: "",
    policyId: "",
    policyNumber: "",
    productOptionId: 0,
    selectedCategory: "1",
    coverAmount: 0,
    policyStatusId: 1,
    policyCancelReasonId: "",
    status: "",
    id: "",
  });
  
  const [RMAPolicy, setRMAPolicy] = useState({ coverAmount: 0 }); // [{}
  const [RMAMembers, setRMAMembers] = useState([]);
  const [coverLevels, setCoverLevels] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]); // [{}]
  const [policyStatus, setPolicyStatus] = useState([]);
  const [cancellationReasons, setCancellationReasons] = useState([]);
  const [removalReasons, setRemovalReasons] = useState([]); // [{}
  const [memberBenefitList, setMemberBenefitList] = useState([]);
  const [beneftis, setBeneftis] = useState([]);
  const [key, setKey] = useState(0);
  const [policyInceptionDate, setPolicyInceptionDate] = useState("");
  const [waitingPeriod, setWaitingPeriod] = useState(0);

  // get policyId from /edit/policies/:id
  const getPolicy = useQuery(
    ["getPolicy", id],
    () =>
      axios.get(`${nodeSa}/edit/requests/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken && !!id ? true : false,
      onSuccess: (data) => {
        // console.log("getPolicy", data);
        setNodePolicyDetails((prev) => ({
          ...prev,
          policyId: data.data.data.policyId,
          providerName: data.data.data.providerName,
          providerInceptionDate: data.data.data.providerInceptionDate,
          policyNumber: data.data.data.policyNumber,
          joinDate: data.data.data.joinDate,
          createdBy: data.data.data.createdBy,
          approverId: data.data.data.approverId,
          brokerageName: data.data.data.brokerageName,
          productOptionId: data.data.data.productOptionId,
          coverAmount: data.data.data.coverAmount,
          policyStatus: data.data.data.policyStatus,
          policyStatusId: data.data.data.policyStatusId,
          policyCancelReasonId: data.data.data.policyCancelReasonId,
          selectedCategory: data.data.data.selectedCategory,
          status: data.data.data.status,
          id: id,
        }));
        setNodeMembers(data.data.data.members);
      },
    }
  );

  console.log("getPolicy", getPolicy);

  const policyQuery = useQuery(
    `policyQuery${policyId}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${policyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),

    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        // console.log("policyQuery", data.data);
        setPolicyDetails((prev) => {
          return {
            ...prev,
            policyId: data?.data?.policyId,
            policyNumber: data?.data?.policyNumber,
            joinDate: data?.data?.policyInceptionDate,
            SchemeRolePlayerId: data?.data?.policyOwnerId,
            productType: "Scheme",
            providerId: data?.data?.parentPolicyId,
            coverAmount: "",
            selectedCategory: "1",
            policyStatusId: data?.data?.policyStatusId,
            productOptionId: data?.data?.productOptionId,
            brokerageId: data?.data?.brokerageId,
            representativeId: data?.data?.representativeId,
            adminPercentage: data?.data?.adminPercentage,
            commissionPercentage: data?.data?.commissionPercentage,
            binderFeePercentage: data?.data?.binderFeePercentage,
            regularInstallmentDayOfMonth:
              data?.data?.regularInstallmentDayOfMonth,
            paymentFrequencyId: data?.data?.paymentFrequencyId,
            premium: data?.data?.premium,
            brokerageName: data?.data?.brokerageName,
            notes: "",
          };
        });
      },
    }
  );

  // get RMA original policy details from /clc/api/Policy/Policy/:id
  const getRMAPolicy = useQuery(
    ["getRMAPolicy", id],
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/${NodePolicyDetails.policyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken && getPolicy.isSuccess,
      onSuccess: (data) => {
        // console.log("getRMAPolicy", data);
        setRMAPolicy((prev) => ({
          ...prev,
          ...data.data,
        }));
        setWaitingPeriod(
          dayjs(data.data.data?.policyInceptionDate).format("YYYY-MM-DD") <
            dayjs("2022-03-01").format("YYYY-MM-DD")
            ? 6
            : 3
        );
        setPolicyInceptionDate(data.data.data?.policyInceptionDate);
      },
    }
  );

  // get RMA Policies from /clc/api/Policy/InsuredLife/GetPolicyInsuredLives
  const getRMA = useQuery(
    ["getRMA", id],
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${NodePolicyDetails.policyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken && getPolicy.isSuccess,
      onSuccess: (data) => {
        // console.log("getRMA", data);
        data?.data?.forEach((item, index) => {
          if (item.statedBenefitId) {
            // push statedBenefitId to  memberBenefitList array only if it does not exist, memberBenefitList is integer array
            if (!memberBenefitList.includes(item.statedBenefitId)) {
              setMemberBenefitList((prev) => [...prev, item.statedBenefitId]);
            }
          }
          // setRMAPolicyDetails({
          //   ...RMAPolicyDetails,
          //   date: item.startDate,
          // });
          setRMAMembers((prev) => [
            ...prev,
            {
              dateOfBirth: new Date(item.rolePlayer.person.dateOfBirth),
              dateOfDeath: item.rolePlayer.person.dateOfDeath || "",
              dateVopdVerified: item.rolePlayer.person.dateVopdVerified || "",
              supportDocument: [],
              id: item.rolePlayerId,
              rolePlayerId: item.rolePlayer.rolePlayerId,
              idTypeId: item.rolePlayer.person.idType,
              idNumber: item.rolePlayer.person.idNumber,
              firstName: item.rolePlayer.person.firstName,
              surname: item.rolePlayer.person.surname,
              deathCertificateNumber:
                item.rolePlayer.person.deathCertificateNumber || "",
              isVopdVerified: item.rolePlayer.person.isVopdVerified,
              gender: item.rolePlayer.person.gender || "",
              isStudent: item.rolePlayer.person.isStudying,
              isDisabled: item.rolePlayer.person.isDisabled,
              preferredCommunicationTypeId:
                item.rolePlayer.preferredCommunicationTypeId || "",
              tellNumber: item.rolePlayer.tellNumber,
              cellNumber: item.rolePlayer.cellNumber,
              emailAddress: item.rolePlayer.emailAddress,
              addressTypeId: "",
              addressLine1: "",
              addressLine2: "",
              postalCode: "",
              city: "",
              province: "",
              countryId: 1,
              createdBy: item.createdBy,
              createdAt: item.createdDate,
              updatedBy: item.createdBy,
              updatedAt: item.createdDate,
              deletedAt: item.deletedDate,
              PolicyMember: {
                exceptions: [],
                memberTypeId: returnMemberType(item.rolePlayerTypeId),
                policyId: item.policyId,
                memberId: item.rolePlayerId,
                PolicyHolderMemberId: null,
                status: "",
                startDate: item.startDate.split("T")[0], // formatting startDate
                endDate: item.endDate,
                memberType: "",
                isBeneficiary: item.rolePlayer.person.isBeneficiary,
                benefitRate: 0,
                roleplayerTypeId: item.rolePlayerTypeId,
                statedBenefitId: item.statedBenefitId,
                statedBenefit: null,
                benefit: "",
                coverAmount: "",
                premium: null,
                fileRow: null,
                createdBy: "",
                updatedBy: "",
                createdAt: "",
                updatedAt: "",
              },
            },
          ]);
        });
      },
    }
  );

  // get benefit options available based on productOptionId from /rules/benefit/benefitOptions/:productOptionId
  const getBenefitOptions = useQuery(
    ["getBenefitOptions", NodePolicyDetails.productOptionId],
    () =>
      axios.get(
        `${nodeSa}/rules/benefitOptions/${NodePolicyDetails.productOptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled:
        !!accessToken && NodePolicyDetails.productOptionId ? true : false,
      onSuccess: (data) => {
        // console.log("getBenefitOptions", data);
        setCoverLevels(data?.data?.data?.coverLevels);
        setCategoryOptions(data?.data?.data?.categoryOptions);
      },
    }
  );

  // add the memberBenefits from the memberBenefitList by getting each id from /clc/api/Product/Benefit/:id
  const getMemberBenefits = useQuery(
    `getMemberBenefits${memberBenefitList}`,
    () => {
      return Promise.all(
        memberBenefitList.map(async (item) => {
          return await axios.get(`${rmaAPI}/clc/api/Product/Benefit/${item}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        })
      );
    },
    {
      enabled:
        !!accessToken &&
        !!getRMA.isSuccess &&
        !!getRMAPolicy.isSuccess &&
        !!memberBenefitList.length > 0,
      onSuccess: async (data) => {
        // console.log("getMemberBenefits", data);

        try {
          const resolvedData = await Promise.all(data);
          // console.log("resolvedData", resolvedData);

          const newMemberBenefits = resolvedData.map((item) => {
            return {
              statedBenefitId: item?.data?.id,
              statedBenefit: item?.data?.name,
              baseRate: item?.data?.benefitRates[0]?.baseRate,
              benefitAmount: item?.data?.benefitRates[0]?.benefitAmount,
            };
          });

          //find the main member and set the benefitAmount for the policy based on statedBenefitId
          const mainMember = RMAMembers.find(
            (member) => member.PolicyMember.memberTypeId === 1
          );

          const getBenefitAmount = newMemberBenefits.find(
            (item) =>
              item.statedBenefitId === mainMember.PolicyMember.statedBenefitId
          ).benefitAmount;

          // console.log("getBenefitAmount", getBenefitAmount);
          // console.log("mainMember", mainMember);
          // console.log("newMemberBenefits", newMemberBenefits);

          // set benefitAmount for RMA policy
          setRMAPolicy((prev) => ({
            ...prev,
            coverAmount: getBenefitAmount,
          }));
        } catch (error) {
          console.error("Error fetching member benefits:", error);
        }
      },
    }
  );

  // get benefits and rates from /rules/benefit/:productOptionId
  const getBenefitsAndRates = useQuery(
    ["getBenefitsAndRates", NodePolicyDetails.productOptionId],
    () =>
      axios.get(
        `${nodeSa}/rules/benefits/${NodePolicyDetails.productOptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled:
        !!accessToken && NodePolicyDetails.productOptionId ? true : false,
      onSuccess: (data) => {
        // console.log("getBenefitsAndRates", data);
        setBeneftis(data?.data?.data);
      },
    }
  );

  // get rma status options
  const policyStatuses = useQuery(
    `PolicyStatuses`,
    () =>
      axios.get(`${rmaAPI}/clc/api/Policy/PolicyStatus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        // console.log("policyStatuses", data);
        setPolicyStatus(data.data);
      },
    }
  );

  const requiredCancellationReason = [
    "Cancellation Request from Member",
    "Cancellation Request from Broker",
    "Cancellation Request from Scheme",
    "Duplicate Policy",
    "Insurer Request on Suspicion of Fraud",
    "Main Member Deceased",
    "Member Cancelling Due to Affordability",
    "Member Cancelling Due to Poor Service",
    "Capture Error",
    "Member Does Not Agree To Policy",
    "Member Over Insured",
    "Other",
    "Main Member Deceased; Cancel Policy",
  ];

  // from rma api get cancellation reason /mdm/api/CancellationReason
  const cancellationReason = useQuery(
    `CancellationReason`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/CancellationReason`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        // console.log("cancellationReason", data);
        // only include data that is required cancellation reasons, compare case insensitive
        const requiredCancellationReasonLower = requiredCancellationReason.map(
          (reason) => reason.toLowerCase()
        );

        const filteredData = data.data.filter((item) => {
          const lowerCaseItemName = item.name.toLowerCase();
          return requiredCancellationReasonLower.includes(lowerCaseItemName);
        });

        setCancellationReasons(filteredData);
      },
    }
  );

  // from rma api get removal reasons /mdm/api/insuredLifeRemovalReason
  const removalReason = useQuery(
    `RemovalReason`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/insuredLifeRemovalReason`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
      onSuccess: (data) => {
        // console.log("removalReason", data);
        // add other to the removal reasons
        data.data.push({
          id: 99,
          name: "Other",
          description: "Other",
        });
        setRemovalReasons(data.data);
      },
    }
  );

  const CleanObj = (arr) => {
    let newArr = arr?.map((item) => {
      return {
        ...item,
        dateOfBirth: new Date(item.dateOfBirth)?.toISOString().slice(0, 10),
      };
    });

    return newArr?.map((obj) => {
      const newObj = { ...obj };
      for (const prop in newObj) {
        if (newObj[prop] === null) {
          newObj[prop] = "";
        }
      }
      return newObj;
    });
  };

  const diffArray = DifferencesInPolicies(
    CleanObj(RMAMembers),
    CleanObj(NodeMembers)
  );

  const clearData = () => {
    // set PolicyDetails Status to Processing

    let clear = NodeMembers.map((obj) => {
      let newObj = { ...obj };
      // If policyId doesn't exist, add a policyId property with the desired value
      if (!newObj.PolicyMember.policyId) {
        newObj = {
          ...newObj,
          PolicyMember: {
            ...newObj.PolicyMember,
            policyId: Number(id),
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
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
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
    let clearPolicyDetails = { ...NodePolicyDetails, status: "Processing" };
    const data = {
      ...clearPolicyDetails,
      members: clear,
    };

    return data;
  };

  const SendPolicy = useMutation((data) =>
    axios.post(`${nodeSa}/edit/policies`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  );

  if (
    getPolicy.isLoading ||
    getRMA.isLoading ||
    getBenefitOptions.isLoading ||
    policyStatuses.isLoading ||
    cancellationReason.isLoading ||
    getMemberBenefits.isLoading ||
    getBenefitsAndRates.isLoading
  ) {
    return <LoadingStack />;
  }
  // console.log("diffArray", diffArray);
  // console.log("NodePolicyDetails", NodePolicyDetails);
  // console.log("RMAPolicy", RMAPolicy);

  return (
    <div>
      <PageHeader
        title="Approve RMA Policy Edit"
        subtitle="Approve RMA Policy Edit"
      />

      <ViewEditPolicyCard
        brokerageName={NodePolicyDetails.brokerageName}
        providerName={NodePolicyDetails.providerName}
        providerInceptionDate={NodePolicyDetails.providerInceptionDate}
        policyNumber={NodePolicyDetails.policyNumber}
        joinDate={NodePolicyDetails.joinDate}
        createdBy={NodePolicyDetails.createdBy}
        approver={NodePolicyDetails.approverId}
      />

      <Stack>
        <AppPolicyStatusChip status={NodePolicyDetails?.status} />
        <Alert severity="info" sx={{ my: 2 }} variant="outlined">
          {NodePolicyDetails?.statusNote}
        </Alert>
      </Stack>

      <EditPolicy
        categoryOptions={categoryOptions}
        coverLevels={coverLevels}
        statusOptions={policyStatus}
        cancellationReasons={cancellationReasons}
        selectCategory={NodePolicyDetails.selectedCategory}
        orgCoverAmount={RMAPolicy.coverAmount}
        policyStatus={NodePolicyDetails.policyStatusId}
        cancellationReasonsId={NodePolicyDetails.policyCancelReasonId}
        policyDetails={NodePolicyDetails}
        setPolicyDetails={setNodePolicyDetails}
        setKey={setKey}
        orgPolicyStatusId={RMAPolicy.policyStatusId}
      />

      {NodeMembers && NodeMembers.length > 0 ? (
        <>
          <EditsTable
            key={key}
            setMembers={setNodeMembers}
            members={CleanObj(NodeMembers)}
            diffArray={diffArray}
            benefits={beneftis}
            coverAmount={NodePolicyDetails.coverAmount}
            removalReasons={removalReasons}
          />

          <PolicyButtonsEdits
            policyDetails={NodePolicyDetails}
            setPolicyDetails={setNodePolicyDetails}
            members={NodeMembers}
            setMembers={setNodeMembers}
            policyInceptionDate={policyInceptionDate}
            waitingPeriod={waitingPeriod}
            benefits={beneftis}
          />

          <PolicyNotes policyId={id} />

          <Stack
            sx={{ mt: 3 }}
            direction="row"
            justifyContent="flex-start"
            spacing={2}>
            {NodePolicyDetails.status === "Draft" && (
              <PolicyButton
                setNodePolicyDetails={setNodePolicyDetails}
                setNodeMembers={setNodeMembers}
                label="Save Changes"
                status="Draft"
                noValidate={true}
                statusNote="Changes Saved"
                data={{ ...NodePolicyDetails, members: [...NodeMembers] }}
                color="primary"
                variant="contained"
              />
            )}

            {NodePolicyDetails.status === "Processing" && (
              <PolicyButton
                setNodePolicyDetails={setNodePolicyDetails}
                setNodeMembers={setNodeMembers}
                label="Return to Draft"
                status="Draft"
                statusNote="Policy Returned to Draft"
                data={{ ...NodePolicyDetails, members: [...NodeMembers] }}
                color="primary"
                variant="contained"
              />
            )}

            {NodePolicyDetails.status === "Error" ||
            NodePolicyDetails.status === "Issue" ||
            NodePolicyDetails.status === "Rejected" ||
            NodePolicyDetails.status === "Draft" ? (
              <PolicyButton
                setNodePolicyDetails={setNodePolicyDetails}
                setNodeMembers={setNodeMembers}
                label="Submit for Processing"
                status="Processing"
                statusNote="Policy Submitted for Processing"
                data={{ ...NodePolicyDetails, members: [...NodeMembers] }}
                color="primary"
                variant="contained"
              />
            ) : NodePolicyDetails.status === "Ready" ? (
              <PolicyButton
                setNodePolicyDetails={setNodePolicyDetails}
                setNodeMembers={setNodeMembers}
                label="Submit for Approval"
                status="Submitted"
                statusNote="Policy Submitted for Approval"
                data={{ ...NodePolicyDetails, members: [...NodeMembers] }}
                color="primary"
                variant="contained"
              />
            ) : NodePolicyDetails.status === "Submitted" &&
              NodePolicyDetails.approverId &&
              NodePolicyDetails.approverId === user.user ? (
              <PolicyButton
                setNodePolicyDetails={setNodePolicyDetails}
                setNodeMembers={setNodeMembers}
                label="Approve Policy"
                status="Approved"
                statusNote="Policy Approved"
                data={{ ...NodePolicyDetails, members: [...NodeMembers] }}
                color="success"
                variant="contained"
              />
            ) : (
              <></>
            )}

            {NodePolicyDetails.status === "Submitted" &&
              NodePolicyDetails.approverId &&
              NodePolicyDetails.approverId === user.user && (
                <RejectPolicy
                  policy={{ ...NodePolicyDetails, members: [...NodeMembers] }}
                  setNodePolicyDetails={setNodePolicyDetails}
                  setNodeMembers={setNodeMembers}
                />
              )}
          </Stack>
        </>
      ) : (
        <Alert>No Policy Data</Alert>
      )}
    </div>
  );
};

export default Edited;

const returnMemberType = (memberTypeId) => {
  switch (memberTypeId) {
    case 10:
      return 1;
    case 11:
      return 2;
    case 32:
      return 3;
    case 38:
      return 4;
    default:
      return 5;
  }
};

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
  const accessToken = useToken();

  const queryClient = useQueryClient();

  let url = `${nodeSa}/edit/policy/${data.id}`;

  // if (noValidate) {
  //   url = `${nodeSa}/onboarding/policies/save`;
  // }

  // console.log("data", data);

  const UpdatePolicy = useMutation(
    (data) => {
      // console.log("dataSubmitted", data);
      return axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    {
      enabled: !!accessToken,
      onSuccess: () => {
        queryClient.invalidateQueries(`getPolicyDetails`);
        // rerender CreatePolicyDetails component
      },
    }
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

    console.log("Data", data);

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
          color={color}>
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
