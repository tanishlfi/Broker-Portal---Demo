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
  Button,
  Card,
  CardHeader,
  CardActionArea,
  CardContent,
  Typography,
  Skeleton,
} from "@mui/material";
import ViewEditPolicyCard from "components/Containers/ViewEditPolicyCard";
import ErrorComponent from "components/FormComponents.jsx/ErrorComponent";
import EditViewMembersTable from "components/Containers/EditViewMembersTable";
import useToken from "hooks/useToken";
import AlertPopup from "components/Bits/AlertPopup";
import AdditionalTabs from "components/FormComponents.jsx/PolicyAddiTabView";
import { useUser } from "@auth0/nextjs-auth0/client";

// function to get beneficiary details
const getBeneficiaryDetails = async (item, accessToken) =>
  await axios.get(`${rmaAPI}/clc/api/RolePlayer/RolePlayer/${item}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

const ViewRMAPolicy = () => {
  const router = useRouter();
  const { user } = useUser();

  const accessToken = useToken();

  const BrokerId =
    user?.rmaAppUserMetadata?.BrokerageIds?.length > 0 &&
    user?.rmaAppUserMetadata?.BrokerageIds[0];

  const { id, schemeId, policyId } = router.query;

  // if BrokerId is set and BrokerId is not equal to id, redirect to BrokerManager page with BrokerId
  // console.log("BrokerId", String(BrokerId) === id);
  if (BrokerId && String(BrokerId) !== id) {
    router.push(`/Brokers/${BrokerId}/Schemes`);
  }

  const [members, setMembers] = useState([]);

  const [insurledLifeIds, setInsurledLifeIds] = useState([]);

  const [beneficiaryList, setBeneficiaryList] = useState([]);

  const [memberBenefitList, setMemberBenefitList] = useState([]);

  const [nodePolicyDetails, setNodePolicyDetails] = useState({});

  const [policyDetails, setPolicyDetails] = useState({});

  const [beneficiaryDetails, setBeneficiaryDetails] = useState([]);
  const [loadingBeneficiaryDetails, setLoadingBeneficiaryDetails] =
    useState(false);

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
    },
  );

  // Lourens 2024-10-05
  // testing for future use
  // const policyStatuses = useRmaQuery("/clc/api/Policy/PolicyStatus");

  const preferredCommunicationMethod = useQuery(
    `PreferredCommunicationSelect`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/CommunicationType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    },
  );

  // get policy
  const policyQuery = useQuery(
    `policyQuery${policyId}`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/Policy/${policyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),

    {
      enabled: !!accessToken && !!policyId,
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
      enabled: !!accessToken && !!policyQuery.isSuccess,
      onSuccess: (data) => {
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
        // console.log("GetInsuredLifeByPolicyId", data.data);
        let selectedCategory = 1;
        const newMembers = data.data.map((item, index) => {
          if (item.statedBenefitId) {
            // push statedBenefitId to  memberBenefitList array only if it does not exist, memberBenefitList is integer array
            if (!memberBenefitList.includes(item.statedBenefitId)) {
              setMemberBenefitList((prev) => [...prev, item.statedBenefitId]);
            }
          }

          // add rolePlayerId to insurledLifeIds array if it does not exist
          if (!insurledLifeIds) {
            setInsurledLifeIds([item.rolePlayerId]);
          } else if (!insurledLifeIds.includes(item.rolePlayerId)) {
            setInsurledLifeIds((prev) => [...prev, item.rolePlayerId]);
          }

          if (item.rolePlayerTypeId === 10) {
            // map over item?.rolePlayer?.toRolePlayers? and append the fromRolePlayerId to the beneficiaryList array where policyId is the same as the policyId
            item?.rolePlayer?.toRolePlayers?.map((beneficiary) => {
              // console.log("beneficiary", beneficiary?.policyId);
              // console.log("policyId", policyId);
              // console.log(
              //   "outside",
              //   beneficiary?.policyId === parseInt(policyId, 10),
              // );
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

          return {
            id: index + 1,
            title: item.rolePlayer.person.title || "",
            firstName: item.rolePlayer.person.firstName || "",
            surname: item.rolePlayer.person.surname || "",
            idNumber: item.rolePlayer.person.idNumber
              ? item.rolePlayer.person.idNumber
              : item.rolePlayer.person.dateOfBirth,
            dateOfBirth: new Date(item.rolePlayer.person.dateOfBirth),
            dateOfDeath: new Date(item.rolePlayer.person.dateOfDeath),
            idTypeId: item.rolePlayer.person.idType || "",
            isVopdVerified: item.rolePlayer.person.isVopdVerified || "",
            dateVopdVerified: item.rolePlayer.person.dateVopdVerified
              ? item.rolePlayer.person.dateVopdVerified
              : "",
            cellNumber: item.rolePlayer.cellNumber || "",
            emailAddress: item.rolePlayer.emailAddress || "",
            preferredCommunicationTypeId:
              item.rolePlayer.preferredCommunicationTypeId || "",
            tellNumber: item.rolePlayer.tellNumber || "",
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
          return await axios.get(`${rmaAPI}/clc/api/Product/Benefit/${item}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }),
      );
    },
    {
      enabled:
        !!accessToken &&
        !!GetInsuredLifeByPolicyId.isSuccess &&
        !!policyQuery.isSuccess &&
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

          // set benefitRate and statedBenefit for each member
          setMembers((prev) => {
            return prev.map((member) => {
              const statedBenefit = newMemberBenefits.find(
                (benefit) =>
                  benefit.statedBenefitId ===
                  member.PolicyMember.statedBenefitId,
              );

              if (member.PolicyMember.memberTypeId === 1) {
                // set coverAmount for policyDetails from main member
                setPolicyDetails((prev) => {
                  return {
                    ...prev,
                    coverAmount: statedBenefit?.benefitAmount,
                  };
                });
              }

              return {
                ...member,
                PolicyMember: {
                  ...member.PolicyMember,
                  statedBenefit: statedBenefit?.statedBenefit,
                  benefitRate:
                    Number(statedBenefit?.baseRate) /
                    Number(1 - policyDetails.commissionPercentage),
                  benefitAmount: statedBenefit?.benefitAmount,
                },
              };
            });
          });
        } catch (error) {
          console.error("Error fetching member benefits:", error);
        }
      },
    },
  );

  const handleSubmit = () => {
    const SubmitData = ({ members }) => {
      // Check if members exist

      const membersArr = members?.map((member) => {
        return {
          ...member,
          dateOfBirth: new Date(member?.dateOfBirth),
          dateVopdVerified: member.dateVopdVerified
            ? new Date(member?.dateVopdVerified)
            : null,
          PolicyMember: {
            ...member.PolicyMember,
          },
        };
      });

      // if the item is empty, this will remove it from the array
      const newArr = membersArr?.map((obj) => {
        const newObj = { ...obj };
        for (const prop in newObj) {
          if (newObj[prop] === "") {
            newObj[prop] = null;
          }
          // check PolicyMember obj
          if (typeof newObj[prop] === "object") {
            for (const prop2 in newObj[prop]) {
              if (newObj[prop][prop2] === "") {
                newObj[prop][prop2] = null;
              }
            }
          }
        }
        return newObj;
      });

      const data = {
        ...policyDetails,
        members: newArr?.sort(
          (a, b) => a.PolicyMember.memberTypeId - b.PolicyMember.memberTypeId,
        ),
      };
      return data;
    };

    let newMemberData = SubmitData({ members });

    const subData = {
      ...newMemberData,
      members: newMemberData?.members.map((member) => {
        delete member.id;
        return {
          ...member,
        };
      }),
    };
  };

  // Effect to fetch beneficiary details when the beneficiaryList changes
  useEffect(() => {
    const fetchBeneficiaryDetails = async () => {
      setLoadingBeneficiaryDetails(true);
      try {
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

  if (
    GetInsuredLifeByPolicyId.isLoading ||
    policyQuery.isLoading ||
    schemeQuery.isLoading ||
    policyStatuses.isLoading ||
    getMemberBenefits.isLoading ||
    preferredCommunicationMethod.isLoading
  ) {
    return <LoadingStack />;
  }

  // console.log("memberBenefitList", memberBenefitList);

  // console.log("memberBenefits", memberBenefits);

  // console.log("policyDetails", policyDetails);

  return (
    <div style={{ width: "95%" }}>
      <PageHeader
        title="Administration"
        subTitle="Manage Policy"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: `Schemes`,
            href: `/Brokers/${id}/Schemes`,
          },
          ,
          {
            title: "Scheme",
            href: `/Brokers/${id}/Schemes/${schemeId}`,
          },
          {
            title: `Policy`,
            href: `/Brokers/${id}/Schemes/${schemeId}/Policy/${policyId}`,
          },
        ]}
      />

      <>
        <ViewEditPolicyCard
          brokerageName={policyDetails.brokerageName}
          providerName={policyDetails.providerName}
          providerInceptionDate={policyDetails.providerInceptionDate}
          policyNumber={policyDetails.policyNumber}
          joinDate={policyDetails.joinDate}
        />

        <Box sx={{ width: "100%", mt: 2 }}>
          <EditViewMembersTable
            members={members}
            preferredCommunicationMethod={
              preferredCommunicationMethod?.data?.data
            }
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

export default ViewRMAPolicy;

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
    case 41:
      return 6;
    default:
      return 5;
  }
};
