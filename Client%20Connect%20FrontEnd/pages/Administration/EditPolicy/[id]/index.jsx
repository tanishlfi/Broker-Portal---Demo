import React from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import PageHeader from "components/Bits/PageHeader";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import { useState, useEffect } from "react";
import axios from "axios";
import LoadingStack from "components/Containers/LoadingStack";
import { Stack } from "@mui/system";
import {
  Box,
  Typography,
  Alert,
  Button,
  CardHeader,
  Card,
  Chip,
} from "@mui/material";
import ViewEditPolicyCard from "components/Containers/ViewEditPolicyCard";
import EditViewMembersTable from "components/Containers/EditViewMembersTable";
import useToken from "hooks/useToken";
import AlertPopup from "components/Bits/AlertPopup";
import EditRequest from "pages/Administration/_components/EditPolicyRequest";
import AdditionalTabs from "components/FormComponents.jsx/PolicyAddiTabView";
import { useSearchParams } from "next/navigation";
import ClaimChecker from "../../_components/ClaimChecker";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CancelPolicyRequest from "../../_components/CancelPolicyRequest";
import dayjs from "dayjs";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import GetEuropAssist from "../../_components/GetEuropAssist";
import GetPremiumRoundingExclusions from "../../_components/GetPremiumRoundingExclusions";

// calculate premium by using this endpoint
/*
POST /apirma/test/premiumCalculator HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: ••••••
Content-Length: 162

{
  "benefitRate": 71.14,
  "premiumAdjustmentPercentage": 0.0,
  "adminFeePercentage": 0.0,
  "commissionPercentage": 0.225,
  "binderFeePercentage": 0.0
}
*/
// we are probably going to end up showing this as a total for the policy and not individual premiums

const premiumCalculator = async (accessToken, data) => {
  try {
    // console.log("Premium calculation data:", data);
    const response = await axios.post(`${nodeSa}/premiumCalculator`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // console.log("Premium calculation response:", response.data);
    return response?.data; // Return the actual premium value
  } catch (error) {
    console.error("Premium calculation error:", error);
    return null; // Or handle error as needed
  }
};

// function to get beneficiary details
const getBeneficiaryDetails = async (item, accessToken) =>
  await axios.get(`${rmaAPI}/clc/api/RolePlayer/RolePlayer/${item}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

const ViewOnlyPolicy = () => {
  const router = useRouter();

  const accessToken = useToken();

  // /Administration/EditPolicy/View/123231312?id=3123123&schemeId=21323123

  const query = useSearchParams();
  let schemeId = query.get("schemeId");
  let policyId = query.get("policyId");

  const [members, setMembers] = useState([]);
  const [memberBenefitList, setMemberBenefitList] = useState([]);
  const [policyDetails, setPolicyDetails] = useState({});
  const [insurledLifeIds, setInsurledLifeIds] = useState([]);
  const [beneficiaryList, setBeneficiaryList] = useState([]);
  const [beneficiaryDetails, setBeneficiaryDetails] = useState([]);
  const [loadingBeneficiaryDetails, setLoadingBeneficiaryDetails] =
    useState(false);

  const [totalPremium, setTotalPremium] = useState(0);
  const [adminFee, setAdminFee] = useState(0);
  const [memberFee, setMemberFee] = useState(0);
  const [rounded, setRounded] = useState(false);

  const [canEdit, setCanEdit] = useState(true);
  const [cancelInprogress, setCancelInprogress] = useState(false);

  let { id } = router.query;

  // check if policy is being edited
  const getPolicyNode = useQuery(
    ["getEditedPolicyById", policyId],
    () =>
      axios.get(`${nodeSa}/edit/requests?policyId=${policyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken && !!policyId,
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,
      onSuccess: (data) => {
        // if requestType === "Cancel policy" then set canEdit to false
        if (data?.data?.data?.length > 0) {
          if (data?.data?.data[0]?.requestType === "Cancel policy") {
            setCancelInprogress(true);
          }
        }
      },
    },
  );

  const policyStatuses = useQuery(
    `PolicyStatuses`,
    () => axios.get(`${rmaAPI}/clc/api/Policy/PolicyStatus`, {}),
    {},
  );

  let { europAssistFee, isLoadingGetEuropAssist } = GetEuropAssist();
  let {
    PremiumRoundingExclusions,
    isLoadingGetPremiumRoundingExclusions,
    isSuccessGetPremiumRoundingExclusions,
  } = GetPremiumRoundingExclusions();

  // if (!isLoadingGetEuropAssist) {
  //   console.log("europeAssistFee", europeAssistFee);
  // }

  const preferredCommunicationMethod = useQuery(
    `PreferredCommunicationSelect`,
    () => axios.get(`${rmaAPI}/mdm/api/CommunicationType`, {}),
    {},
  );

  // get policy
  const policyQuery = useQuery(
    `policyQuery${policyId}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${policyId}`, {}),

    {
      enabled: !!policyId,
      onSuccess: (data) => {
        // console.log("policyQuery", data.data);
        setPolicyDetails((prev) => {
          return {
            ...prev,
            isEuropAssist: data?.data?.isEuropAssist,
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
            premiumAdjustmentPercentage:
              data?.data?.premiumAdjustmentPercentage,
            regularInstallmentDayOfMonth:
              data?.data?.regularInstallmentDayOfMonth,
            paymentFrequencyId: data?.data?.paymentFrequencyId,
            premium: data?.data?.premium,
            brokerageName: data?.data?.brokerageName,
            RolePlayerId: data?.data?.policyOwner?.rolePlayerId,
            notes: "",
          };
        });
      },
    },
  );

  // get scheme
  const schemeQuery = useQuery(
    `schemeQuery${schemeId}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${schemeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),

    {
      enabled:
        !!accessToken &&
        !!policyQuery.isSuccess &&
        !!isSuccessGetPremiumRoundingExclusions,
      onSuccess: (data) => {
        // if data?.data?.policyInceptionDat < 1 November 2023 then set setRounded to true
        if (
          new Date(data?.data?.policyInceptionDate) < new Date("2023-11-01")
        ) {
          setRounded(true);
        }

        if (PremiumRoundingExclusions.includes(schemeId)) {
          setRounded(false);
        }

        // console.log("schemeQuery", data.data);
        setPolicyDetails((prev) => {
          return {
            ...prev,
            providerName: data?.data?.clientName,
            providerInceptionDate: data?.data?.policyInceptionDate,
          };
        });
      },
    },
  );

  const policyIsActive = policyStatuses?.data?.data.find((status) =>
    status?.id === policyQuery?.data?.data.policyStatusId ? status : null,
  );

  // get memebers
  const GetInsuredLifeByPolicyId = useQuery(
    `GetInsuredLifeByPolicyId${policyId}`,
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${policyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    {
      enabled: !!accessToken && !!policyId,
      // refetchOnWindowFocus: false,
      // refetchOnmount: false,
      // refetchOnReconnect: false,
      // retry: false,
      onSuccess: (data) => {
        let selectedCategory = 1;
        // console.log("GetInsuredLifeByPolicyId", data.data);
        const newMembers = data.data.map((item, index) => {
          // add rolePlayerId to insurledLifeIds array if it does not exist
          if (!insurledLifeIds && item.insuredLifeStatus === 1) {
            setInsurledLifeIds([item.rolePlayerId]);
          } else if (
            !insurledLifeIds.includes(item.rolePlayerId) &&
            item.insuredLifeStatus === 1
          ) {
            setInsurledLifeIds((prev) => [...prev, item.rolePlayerId]);
          }

          if (item.rolePlayerTypeId === 10) {
            // map over item?.rolePlayer?.toRolePlayers? and append the fromRolePlayerId to the beneficiaryList array where policyId is the same as the policyId
            item?.rolePlayer?.toRolePlayers?.map((beneficiary) => {
              if (beneficiary?.policyId === parseInt(policyId, 10)) {
                if (!beneficiaryList && beneficiary.rolePlayerTypeId == 41) {
                  setBeneficiaryList([beneficiary.fromRolePlayerId]);
                } else if (
                  !beneficiaryList.includes(beneficiary.fromRolePlayerId) &&
                  beneficiary.rolePlayerTypeId == 41
                ) {
                  setBeneficiaryList((prev) => [
                    ...prev,
                    beneficiary.fromRolePlayerId,
                  ]);
                }
              }
            });
          }

          if (item.statedBenefitId) {
            // push statedBenefitId to  memberBenefitList array only if it does not exist, memberBenefitList is integer array
            if (!memberBenefitList.includes(item.statedBenefitId)) {
              setMemberBenefitList((prev) => [...prev, item.statedBenefitId]);
            }
          }

          if (
            selectedCategory === 1 &&
            returnMemberType(item.rolePlayerTypeId) === 2
          ) {
            selectedCategory = 2;
          }

          if (
            selectedCategory === 1 &&
            returnMemberType(item.rolePlayerTypeId) === 3
          ) {
            selectedCategory = 2;
          }

          if (
            selectedCategory === 1 &&
            returnMemberType(item.rolePlayerTypeId) === 4
          ) {
            selectedCategory = 3;
          }

          if (
            selectedCategory === 2 &&
            returnMemberType(item.rolePlayerTypeId) === 4
          ) {
            selectedCategory = 3;
          }

          return {
            id: index + 1,
            title: item?.rolePlayer?.person?.title || "",
            firstName: item.rolePlayer.person.firstName,
            surname: item.rolePlayer.person.surname,
            idNumber: item.rolePlayer.person.idNumber
              ? item.rolePlayer.person.idNumber
              : item.rolePlayer.person.dateOfBirth,
            dateOfBirth: new Date(item.rolePlayer.person.dateOfBirth),
            dateOfDeath: item.rolePlayer.person.dateOfDeath
              ? new Date(item.rolePlayer.person.dateOfDeath)
              : null,
            idTypeId: item.rolePlayer.person.idType,
            isVopdVerified: item.rolePlayer.person.isVopdVerified,
            dateVopdVerified: item.rolePlayer.person.dateVopdVerified
              ? item.rolePlayer.person.dateVopdVerified
              : "",
            cellNumber: item.rolePlayer.cellNumber,
            emailAddress: item.rolePlayer.emailAddress,
            preferredCommunicationTypeId:
              item.rolePlayer.preferredCommunicationTypeId,
            tellNumber: item.rolePlayer.tellNumber,
            gender: item.rolePlayer.person.gender
              ? item.rolePlayer.person.gender
              : "",
            rolePlayerId: item.rolePlayerId,
            PolicyMember: {
              memberTypeId: returnMemberType(item.rolePlayerTypeId),
              isBeneficiary: item.rolePlayer.person.isBeneficiary,
              isStudying: item.rolePlayer.person.isStudying,
              isDisabled: item.rolePlayer.person.isDisabled,
              statedBenefitId: item.statedBenefitId,
              PolicyMemberStatusId: item.insuredLifeStatus,
              statedBenefit: "",
              benefitRate: "",
              benefitAmount: "",
              ExistingMember: true,
              rolePlayerId: item.rolePlayer.rolePlayerId,
              startDate: item.startDate
                ? item.startDate.replace("T00:00:00", "")
                : "",
              endDate: item.endDate
                ? item.endDate.replace("T00:00:00", "")
                : "",
              notes: [],
              status: item.endDate ? "Deleted" : "Active",
            },
          };
        });
        // update policyDetails with selectedCategory
        setPolicyDetails((prev) => {
          return {
            ...prev,
            selectedCategory: selectedCategory,
          };
        });

        setMembers((prev) => {
          const updatedMembers = [...prev];
          newMembers.forEach((newMember) => {
            if (
              !updatedMembers.some(
                (member) => member.rolePlayerId === newMember.rolePlayerId,
              )
            ) {
              // console.log("newMember", newMember);
              updatedMembers.push(newMember);
            }
          });
          return updatedMembers;
        });
      },
    },
  );

  // add the memberBenefits from the memberBenefitList by getting each id from /clc/api/Product/Benefit/:id
  const getMemberBenefits = useQuery(
    `getMemberBenefits${memberBenefitList}`,
    () => {
      return Promise.all(
        memberBenefitList.map(async (item) => {
          return await axios.get(
            `${rmaAPI}/clc/api/Product/Benefit/${item}`,
            {},
          );
        }),
      );
    },
    {
      enabled:
        !!GetInsuredLifeByPolicyId.isSuccess &&
        !!policyQuery.isSuccess &&
        !isLoadingGetEuropAssist &&
        !!memberBenefitList.length > 0,
      onSuccess: async (data) => {
        // console.log("getMemberBenefits", data);

        try {
          const resolvedData = await Promise.all(data);
          const newMemberBenefits = resolvedData.map((item) => {
            return {
              statedBenefitId: item?.data?.id,
              statedBenefit: item?.data?.name,
              baseRate: item?.data?.benefitRates[0]?.baseRate,
              benefitAmount: item?.data?.benefitRates[0]?.benefitAmount,
            };
          });
          let totalPremiumCalc = 0;
          let adminFeeCalc = 0;

          // console.log("newMemberBenefits", newMemberBenefits);
          // Calculate premiums for all eligible members
          const membersWithPremiums = await Promise.all(
            members.map(async (member) => {
              const statedBenefit = newMemberBenefits.find(
                (benefit) =>
                  benefit.statedBenefitId ===
                  member.PolicyMember.statedBenefitId,
              );

              if (
                member?.PolicyMember?.PolicyMemberStatusId === 1 &&
                statedBenefit?.baseRate > 0
              ) {
                const baseRate =
                  statedBenefit?.baseRate *
                  (1 + policyDetails.premiumAdjustmentPercentage);
                // console.log(" statedBenefit", statedBenefit);
                // console.log("policyDetails", policyDetails);
                // console.log("baseRate", baseRate);

                const premiumResponse = await premiumCalculator(accessToken, {
                  benefitRate: baseRate,
                  adminFeePercentage: policyDetails.adminPercentage,
                  commissionPercentage: policyDetails.commissionPercentage,
                  binderFeePercentage: policyDetails.binderFeePercentage,
                });

                totalPremiumCalc += premiumResponse.data;
                // console.log("totalPremiumCalc", totalPremiumCalc);
                adminFeeCalc += premiumResponse.data - baseRate;
                // console.log("adminFeeCalc", adminFeeCalc);
                return {
                  ...member,
                  PolicyMember: {
                    ...member.PolicyMember,
                    statedBenefit: statedBenefit?.statedBenefit,
                    benefitRate: baseRate,
                    premium: premiumResponse.data,
                    benefitAmount: statedBenefit?.benefitAmount,
                  },
                };
              }

              return {
                ...member,
                PolicyMember: {
                  ...member.PolicyMember,
                  statedBenefit: statedBenefit?.statedBenefit,
                  benefitRate: 0,
                  premium: 0,
                  benefitAmount: statedBenefit?.benefitAmount,
                },
              };
            }),
          );

          setMembers(membersWithPremiums);
          let memberFee = 0;
          if (policyDetails.isEuropAssist) {
            // console.log("europAssist", europAssistFee);

            memberFee =
              europAssistFee / (1 - policyDetails.commissionPercentage);

            // console.log("memberFee", memberFee);
            totalPremiumCalc += europAssistFee;
          }

          // console.log("totalPremiumCalc", totalPremiumCalc);
          // console.log("adminFeeCalc", adminFeeCalc);

          setTotalPremium(totalPremiumCalc);
          setAdminFee(adminFeeCalc + memberFee);
        } catch (error) {
          console.error("Error fetching member benefits:", error);
        }
      },
    },
  );

  // console.log("members", members);

  // Effect to fetch beneficiary details when the beneficiaryList changes
  useEffect(() => {
    // console.log(beneficiaryList);
    // console.log("insurledLifeIds", insurledLifeIds);
    const fetchBeneficiaryDetails = async () => {
      setLoadingBeneficiaryDetails(true);
      try {
        // Filter out the dependents also on the beneficiaryList
        const filteredDependentList = beneficiaryList.filter((item) =>
          insurledLifeIds.includes(item),
        );

        // set dependents isBeneficiary to true
        const dependents = members.map((member) => {
          if (filteredDependentList.includes(member.rolePlayerId)) {
            return {
              ...member,
              PolicyMember: {
                ...member.PolicyMember,
                isBeneficiary: true,
              },
            };
          }
          return member;
        });

        setMembers(dependents);

        const filteredBeneficiaryList = beneficiaryList.filter(
          (item) => !insurledLifeIds.includes(item),
        );

        const fetchedDetails = await Promise.all(
          filteredBeneficiaryList.map((item) =>
            getBeneficiaryDetails(item, accessToken),
          ),
        );

        // Process the fetched details
        const benefiaries = fetchedDetails.map((res) => res.data); // Assuming response data structure

        // map over benefiaries and append the data to the members array
        benefiaries.forEach((beneficiary) => {
          // console.log("beneficiary", beneficiary);
          const newMember = {
            id: members.length + 1,
            title: beneficiary.person.title || "",
            firstName: beneficiary.person.firstName,
            surname: beneficiary.person.surname,
            idNumber: beneficiary.person.idNumber
              ? beneficiary.person.idNumber
              : beneficiary.person.dateOfBirth,
            dateOfBirth: new Date(beneficiary.person.dateOfBirth),
            dateOfDeath: new Date(beneficiary.person.dateOfDeath),
            idTypeId: beneficiary.person.idType,
            isVopdVerified: beneficiary.person.isVopdVerified,
            dateVopdVerified: beneficiary.person.dateVopdVerified
              ? beneficiary.person.dateVopdVerified
              : "",
            cellNumber: beneficiary.cellNumber || "",
            emailAddress: beneficiary.emailAddress || "",
            preferredCommunicationTypeId:
              beneficiary.preferredCommunicationTypeId,
            tellNumber: beneficiary.tellNumber || "",
            gender: beneficiary.person.gender ? beneficiary.person.gender : "",
            rolePlayerId: beneficiary.rolePlayerId,
            PolicyMember: {
              memberTypeId: 6,
              isBeneficiary: true,
              statedBenefitId: "",
              PolicyMemberStatusId: beneficiary.insuredLifeStatus,
              statedBenefit: "",
              benefitRate: "",
              benefitAmount: "",
              ExistingMember: true,
              rolePlayerId: beneficiary.rolePlayerId,
              startDate: beneficiary.startDate
                ? beneficiary.startDate.replace("T00:00:00", "")
                : "",
              endDate: beneficiary.endDate
                ? beneficiary.endDate.replace("T00:00:00", "")
                : "",
              notes: [],
              status: beneficiary.endDate ? "Deleted" : "Active",
            },
          };

          // only set member if it does not exist
          if (
            !members.some(
              (member) => member.rolePlayerId === newMember.rolePlayerId,
            ) ||
            newMember.PolicyMember.memberTypeId === 6
          ) {
            setMembers((prev) => [...prev, newMember]);
          }
        });
      } catch (error) {
        console.error("Error fetching beneficiary details:", error);
      } finally {
        setLoadingBeneficiaryDetails(false);
      }
    };

    if (beneficiaryList.length > 0) {
      fetchBeneficiaryDetails();
      setBeneficiaryList([]);
    }
  }, [beneficiaryList, insurledLifeIds, accessToken, members]);

  const SendPolicy = useMutation((data) =>
    axios.post(`${nodeSa}/edit/policies`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );

  if (
    GetInsuredLifeByPolicyId.isLoading ||
    getPolicyNode.isLoading ||
    policyQuery.isLoading ||
    schemeQuery.isLoading ||
    policyStatuses.isLoading ||
    getMemberBenefits.isLoading ||
    preferredCommunicationMethod.isLoading ||
    isLoadingGetEuropAssist ||
    isLoadingGetPremiumRoundingExclusions ||
    loadingBeneficiaryDetails
  ) {
    return <LoadingStack />;
  }

  return (
    <div style={{ width: "95%" }}>
      <PageHeader
        title="Administration"
        subTitle="View Only Policy"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Schemes",
            href: `BrokerManager/SchemaManagement/${id}`,
          },
          {
            title: `Schema Management`,
            href: `/BrokerManager/SchemaManagement/${id}/Schema/${schemeId}`,
          },
          {
            title: `Policy ${policyId}`,
            href: `/Administration/EditPolicy/${id}?schemeId=${schemeId}&policyId=${policyId}`,
          },
        ]}
      />

      {getPolicyNode?.data?.data?.data &&
        getPolicyNode?.data?.data?.data.length > 0 && (
          <RequestsTable requests={getPolicyNode?.data?.data?.data} />
        )}

      <>
        {/* {getPolicyNode?.data?.data?.data && (
          <Card
            sx={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: "red",
              mb: 2,
            }}>
            <CardActionArea
              onClick={() => {
                router.push(
                  `/Administration/Policies/${getPolicyNode?.data?.data?.data?.requestId}`
                );
              }}>
              <CardHeader
                title="Policy is being edited"
                subheader="Please wait for approval before making any changes"
              />
              <CardContent>
                <Typography align="center" variant="h6" color="text.secondary">
                  Click here to view the policy
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        )} */}
        <AlertPopup
          message="Policy Updated Successfully"
          severity="success"
          open={SendPolicy?.isSuccess}
        />

        <AlertPopup
          message={SendPolicy?.error?.response?.data?.message}
          severity="error"
          open={SendPolicy?.isError}
        />
        <ViewEditPolicyCard
          brokerageName={policyDetails.brokerageName}
          providerName={policyDetails.providerName}
          providerInceptionDate={policyDetails.providerInceptionDate}
          policyNumber={policyDetails.policyNumber}
          joinDate={policyDetails.joinDate}
          policyStatus={policyIsActive?.name}
          cancellationDate={policyQuery?.data?.data?.cancellationDate}
        />

        <Box sx={{ width: "100%", mt: 2 }}>
          <EditViewMembersTable
            members={members}
            preferredCommunicationMethod={
              preferredCommunicationMethod?.data?.data
            }
          />

          <Card>
            <CardHeader
              align="right"
              title={`Total Premium: R ${
                rounded
                  ? Math.round(totalPremium).toFixed(2)
                  : totalPremium.toFixed(2) || "0.00"
              }`}
              subheader={
                <Stack>
                  <Typography>{`Commission : R ${adminFee
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

          <ClaimChecker
            setCanEdit={setCanEdit}
            rolePlayerList={
              // filter user if the have a dateOfDeath
              members
                .filter((member) => !member.dateOfDeath)
                .map((member) => {
                  return member.rolePlayerId;
                })
            }
            PolicyMembersOrg={members.filter((member) => !member.dateOfDeath)}
          />

          {/* <ErrorComponent error={SendPolicy?.error?.response?.data} /> */}

          {!canEdit ? (
            <Alert severity="warning">
              There seems to be a claim in progress for this policy. Please wait
              for this to be resolved before making any changes.
            </Alert>
          ) : cancelInprogress ? (
            <Alert severity="warning">
              There seems to be a cancellation request in progress for this
              policy. Please wait for this to be resolved before making any
              changes.
            </Alert>
          ) : ![1, 15, 14].includes(policyIsActive?.id) ? (
            <Alert severity="warning">
              The policy is not currently active, and no amendments can be made
              at this time.
            </Alert>
          ) : (
            <Stack sx={{ my: 4 }} direction="row" spacing={2}>
              <EditRequest
                policyData={policyQuery?.data?.data}
                policyDetails={policyDetails}
                MainMembers={members.find(
                  (member) => member.PolicyMember.memberTypeId === 1,
                )}
                members={members}
              />
              <CancelPolicyRequest
                policyData={policyQuery?.data?.data}
                policyDetails={policyDetails}
                MainMembers={members.find(
                  (member) => member.PolicyMember.memberTypeId === 1,
                )}
                members={members}
              />
            </Stack>
          )}

          <AdditionalTabs
            policyId={policyId}
            policyNumber={policyDetails.policyNumber}
          />
        </Box>
      </>
    </div>
  );
};

export default ViewOnlyPolicy;

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

function RequestsTable({ requests }) {
  const statusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "warning";
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Edit":
        return "info";
      case "Expired":
        return "default";
      default:
        return "default";
    }
  };
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "warning.main",
      }}
    >
      <Typography variant="h6" component="div" sx={{ padding: 2 }}>
        Requests
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="requests table">
        <TableHead>
          <TableRow>
            <TableCell>View</TableCell>
            <TableCell>Request Type</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Requested By</TableCell>
            <TableCell>Requested Date</TableCell>
            <TableCell>Request Status</TableCell>
            <TableCell>Expiry Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests &&
            requests.length > 0 &&
            requests
              .sort(
                (a, b) => new Date(b.requestedDate) - new Date(a.requestedDate),
              )
              .map((request) => (
                <TableRow
                  sx={{
                    mb: 2,
                    borderStyle: "solid",
                    borderColor:
                      request?.requestStatus === "Approved"
                        ? "success.main"
                        : request?.requestStatus === "Rejected"
                          ? "error.main"
                          : request?.requestStatus === "Edit"
                            ? "info.main"
                            : request?.requestStatus === "Expired"
                              ? ""
                              : "warning.main",
                    borderWidth: 1,
                  }}
                  key={request.id}
                >
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={
                        request.requestStatus === "Expired" ? true : false
                      }
                      href={
                        request.requestType === "Cancel policy"
                          ? `/Administration/Cancel/${request.id}`
                          : `/Administration/Policies/${request.id}`
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell>{request.requestType || "N/A"}</TableCell>
                  <TableCell>{request.createdBy}</TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    {dayjs(request.requestedDate).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request?.requestStatus}
                      color={statusColor(request?.requestStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    {dayjs(request.expiryDate).format("DD/MM/YYYY")}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
