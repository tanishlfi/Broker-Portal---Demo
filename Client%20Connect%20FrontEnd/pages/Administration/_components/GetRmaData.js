import axios from "axios";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "../../../src/AxiosParams";
import useToken from "../../../hooks/useToken";

const GetRmaData = ({ policyId }) => {
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

  let rolePlayerTypes = [
    {
      id: 1,
      name: "Active",
      description: "Active",
    },
    {
      id: 2,
      name: "Cancelled",
      description: "Cancelled",
    },
    {
      id: 14,
      name: "Continued",
      description: "Continued",
    },
    {
      id: 4,
      name: "Expired",
      description: "Expired",
    },
    {
      id: 20,
      name: "Free Cover",
      description: "Free Cover",
    },
    {
      id: 5,
      name: "Lapsed",
      description: "Lapsed",
    },
    {
      id: 6,
      name: "Legal",
      description: "Legal",
    },
    {
      id: 22,
      name: "New",
      description: "New",
    },
    {
      id: 13,
      name: "Not Taken Up",
      description: "Not Taken Up",
    },
    {
      id: 23,
      name: "Paid Up",
      description: "Paid Up",
    },
    {
      id: 7,
      name: "Paused",
      description: "Paused",
    },
    {
      id: 21,
      name: "Pending Cancellation Comms",
      description: "Pending Cancellation Comms",
    },
    {
      id: 10,
      name: "Pending Cancelled",
      description: "Pending Cancelled",
    },
    {
      id: 12,
      name: "Pending Continuation",
      description: "Pending Continuation",
    },
    {
      id: 8,
      name: "Pending First Premium",
      description: "Pending First Premium",
    },
    {
      id: 11,
      name: "Pending Reinstatement",
      description: "Pending Reinstatement",
    },
    {
      id: 17,
      name: "Pending Release",
      description: "Pending Release",
    },
    {
      id: 9,
      name: "Pre Legal",
      description: "Pre Legal",
    },
    {
      id: 16,
      name: "Premium Waivered",
      description: "Premium Waivered",
    },
    {
      id: 15,
      name: "Reinstated",
      description: "Reinstated",
    },
    {
      id: 18,
      name: "Released",
      description: "Released",
    },
    {
      id: 19,
      name: "Request Cancellation",
      description: "Request Cancellation",
    },
    {
      id: 3,
      name: "Transferred",
      description: "Transferred",
    },
  ];

  const [disabledMembers, setDisabledMembers] = useState([]);

  const [policyDetails, setPolicyDetails] = useState({});

  const [RMAMembers, setRMAMembers] = useState([]);
  const [memberBenefitList, setMemberBenefitList] = useState([]);
  const accessToken = useToken();

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

  const getRMA = useQuery(
    ["getRMAData", policyId],
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${policyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    {
      enabled: !!accessToken && !!policyId,
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
                roleplayerType: rolePlayerTypes.find(
                  (role) => role.id === item.rolePlayerTypeId
                )?.name,
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
          setRMAMembers((prev) => {
            return prev.map((member) => {
              const statedBenefit = newMemberBenefits.find(
                (benefit) =>
                  benefit.statedBenefitId ===
                  member.PolicyMember.statedBenefitId
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
    }
  );

  return {
    RMAMembers,
    RMAMembersLoading: getRMA.isLoading,
    RMAMembersError: getRMA.isError,
    memberBenefitList,
  };
};

export default GetRmaData;
