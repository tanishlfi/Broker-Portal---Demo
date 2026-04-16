import React from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import PageHeader from "components/Bits/PageHeader";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import { useState, useEffect } from "react";
import axios from "axios";
import LoadingStack from "components/Containers/LoadingStack";
import { Stack } from "@mui/system";
import { Box, Typography, Card, CardHeader } from "@mui/material";
import ViewEditPolicyCard from "components/Containers/ViewEditPolicyCard";
import EditViewMembersTable from "components/Containers/EditViewMembersTable";
import useToken from "hooks/useToken";
import AlertPopup from "components/Bits/AlertPopup";
import AdditionalTabs from "components/FormComponents.jsx/PolicyAddiTabView";
import { useSearchParams } from "next/navigation";
import ClaimChecker from "../../_components/ClaimChecker";
import CancelRequestDialog from "../../_components/CancelRequestDialog";
import dayjs from "dayjs";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import GetEuropAssist from "../../_components/GetEuropAssist";

const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

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

const CancelViewPolicy = () => {
  const router = useRouter();

  const accessToken = useToken();

  const [policyId, setPolicyId] = useState(null);
  const [schemeId, setSchemeId] = useState(null);
  const [request, setRequest] = useState(null);
  const [policyStatus, setPolicyStatus] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [europAssistFee, setEuropAssistFee] = useState(0);

  useEffect(() => {
    if (refreshTrigger) {
      window.location.reload();
    }
  }, [refreshTrigger, router]);

  // /Administration/EditPolicy/View/123231312?id=3123123&schemeId=21323123

  const query = useSearchParams();
  // let schemeId = query.get("schemeId");
  // let policyId = query.get("policyId");

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
  const [rounded, setRounded] = useState(false);

  const [canEdit, setCanEdit] = useState(true);

  let { id } = router.query;

  // check if policy is being edited
  const getPolicyNode = useQuery(
    ["getEditedPolicyById", id],
    () =>
      axios.get(`${nodeSa}/edit/requests/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken && !!id,
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,
      onSuccess: (data) => {
        setPolicyId(data?.data?.data?.PolicyData?.PolicyId);
        setSchemeId(data?.data?.data?.PolicyData?.ParentPolicyNumber);
        setRequest(data?.data?.data);
      },
    },
  );

  // if (getPolicyNode.isSuccess) {
  //   console.log("getPolicyNode", getPolicyNode.data.data.data);
  //   console.log("policy", policyId);
  //   console.log("req", request);
  // }

  const policyStatuses = useQuery(`PolicyStatuses`, () =>
    axios.get(`${rmaAPI}/clc/api/Policy/PolicyStatus`, {}),
  );

  let { europeAssistFee } = GetEuropAssist();

  const preferredCommunicationMethod = useQuery(
    `PreferredCommunicationSelect`,
    () => axios.get(`${rmaAPI}/mdm/api/CommunicationType`, {}),
  );

  // get policy
  const policyQuery = useQuery(
    `policyQuery${policyId}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${policyId}`, {}),

    {
      enabled: !!getPolicyNode.isSuccess && !!policyId,
      onSuccess: (data) => {
        // set policy status

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
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${schemeId}`, {}),

    {
      enabled: !!policyQuery.isSuccess && !!schemeId,
      onSuccess: (data) => {
        // if data?.data?.policyInceptionDat < 1 November 2023 then set setRounded to true
        if (
          new Date(data?.data?.policyInceptionDate) < new Date("2023-11-01")
        ) {
          setRounded(true);
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

  // console.log("policyIsActive", policyIsActive);

  // get memebers
  const GetInsuredLifeByPolicyId = useQuery(
    `GetInsuredLifeByPolicyId${policyId}`,
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${policyId}`,
        {},
      ),
    {
      enabled: !!policyQuery.isSuccess && !!policyId,
      // refetchOnWindowFocus: false,
      // refetchOnmount: false,
      // refetchOnReconnect: false,
      // retry: false,
      onSuccess: (data) => {
        let selectedCategory = 1;
        const newMembers = data.data.map((item, index) => {
          // add rolePlayerId to insurledLifeIds array if it does not exist
          if (!insurledLifeIds) {
            setInsurledLifeIds([item.rolePlayerId]);
          } else if (!insurledLifeIds.includes(item.rolePlayerId)) {
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
            title: item.rolePlayer.person.title,
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
          let totalPremium = 0;
          let adminFee = 0;
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
                const premiumResponse = await premiumCalculator(accessToken, {
                  benefitRate:
                    statedBenefit?.baseRate *
                    (1 + policyDetails.premiumAdjustmentPercentage),
                  adminFeePercentage: policyDetails.adminPercentage,
                  commissionPercentage: policyDetails.commissionPercentage,
                  binderFeePercentage: policyDetails.binderFeePercentage,
                });

                totalPremium += premiumResponse.data;
                adminFee +=
                  premiumResponse.data -
                  statedBenefit?.baseRate *
                    (1 + policyDetails.premiumAdjustmentPercentage);

                return {
                  ...member,
                  PolicyMember: {
                    ...member.PolicyMember,
                    statedBenefit: statedBenefit?.statedBenefit,
                    benefitRate:
                      statedBenefit?.baseRate *
                      (1 + policyDetails.premiumAdjustmentPercentage),
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

          if (policyDetails.isEuropAssist) {
            // console.log("europAssist", getEuropAssist?.data?.data?.europAssist);

            const memberFee =
              europAssistFee / (1 - policyDetails.commissionPercentage);
            totalPremium += memberFee;
            // adminFee += memberFee;
            setEuropAssistFee(memberFee);
          }

          setTotalPremium(totalPremium);
          setAdminFee(adminFee);
        } catch (error) {
          console.error("Error fetching member benefits:", error);
        }
      },
    },
  );

  // console.log("members", members);

  // Effect to fetch beneficiary details when the beneficiaryList changes
  useEffect(() => {
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
            )
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

  const UpdateEditRequest = useMutation({
    mutationFn: async (data) => {
      return await axios.put(`${nodeSa}/edit/requests/${id}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    onSuccess: (data) => {
      getPolicyNode.refetch();
    },
  });

  if (
    getPolicyNode.isLoading ||
    GetInsuredLifeByPolicyId.isLoading ||
    policyQuery.isLoading ||
    schemeQuery.isLoading ||
    policyStatuses.isLoading ||
    getMemberBenefits.isLoading ||
    preferredCommunicationMethod.isLoading
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
            href: `BrokerManager/SchemaManagement/${request?.PolicyData?.BrokerageId}`,
          },
          {
            title: `Schema Management`,
            href: `/BrokerManager/SchemaManagement/${request?.PolicyData?.BrokerageId}/Schema/${schemeId}`,
          },
          {
            title: `Policy ${policyId}`,
            href: `/Administration/EditPolicy/${request?.PolicyData?.BrokerageId}?schemeId=${schemeId}&policyId=${policyId}`,
          },
          {
            title: `Request`,
            href: `/Administration/Cancel/${id}`,
          },
        ]}
      />

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
          message="Request Updated Successfully"
          severity="success"
          open={UpdateEditRequest?.isSuccess}
        />

        <AlertPopup
          message={UpdateEditRequest?.error?.response?.data?.message}
          severity="error"
          open={UpdateEditRequest?.isError}
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

        {getPolicyNode.isSuccess && request && (
          // <RequestsTable request={request} />
          <CancelRequestDialog
            request={request}
            setRequest={setRequest}
            UpdateEditRequest={UpdateEditRequest}
            accessToken={accessToken}
            setRefreshTrigger={setRefreshTrigger}
          />
        )}

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

          <AdditionalTabs
            policyId={policyId}
            policyNumber={policyDetails.policyNumber}
          />
        </Box>
      </>
    </div>
  );
};

export default CancelViewPolicy;

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
