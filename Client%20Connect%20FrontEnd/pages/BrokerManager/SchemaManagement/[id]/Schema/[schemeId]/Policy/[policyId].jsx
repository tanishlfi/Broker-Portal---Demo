import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import PageHeader from "components/Bits/PageHeader";
import { rmaAPI, nodeSa } from "src/AxiosParams";
import { useState } from "react";
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
} from "@mui/material";
import ViewEditPolicyCard from "components/Containers/ViewEditPolicyCard";
import EditViewMembersTable from "components/Containers/EditViewMembersTable";
import useToken from "hooks/useToken";
import AlertPopup from "components/Bits/AlertPopup";
import EditRequest from "../../../../../../Administration/_components/EditPolicyRequest";

const getEditedPolicyById = (accessToken, policyId) => {
  return axios.get(`${nodeSa}/edit/requestsByPolicy/${policyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const ViewRMAPolicy = () => {
  const router = useRouter();

  const accessToken = useToken();

  const { id, schemeId, policyId } = router.query;

  const [members, setMembers] = useState([]);

  const [memberBenefitList, setMemberBenefitList] = useState([]);

  const [policyDetails, setPolicyDetails] = useState({});

  // check if policy is being edited
  const getPolicyNode = useQuery(
    ["getEditedPolicyById", policyId],
    () => getEditedPolicyById(accessToken, policyId),
    {
      enabled: !!accessToken && !!policyId,
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,
    }
  );

  console.log("getPolicyNode", getPolicyNode);

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
    }
  );

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
    }
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
    }
  );

  const policyIsActive = policyStatuses?.data?.data.find((status) =>
    status?.id === policyQuery?.data?.data.policyStatusId ? status : null
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
        }
      ),
    {
      enabled: !!accessToken,
      // refetchOnWindowFocus: false,
      // refetchOnmount: false,
      // refetchOnReconnect: false,
      // retry: false,
      onSuccess: (data) => {
        let selectedCategory = 1;
        const newMembers = data.data.map((item, index) => {
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
            dateOfDeath: new Date(item.rolePlayer.person.dateOfDeath),
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
                (member) => member.rolePlayerId === newMember.rolePlayerId
              )
            ) {
              // console.log("newMember", newMember);
              updatedMembers.push(newMember);
            }
          });
          return updatedMembers;
        });
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

  const SendPolicy = useMutation((data) =>
    axios.post(`${nodeSa}/edit/policies`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
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
          (a, b) => a.PolicyMember.memberTypeId - b.PolicyMember.memberTypeId
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

    SendPolicy.mutate(subData, {
      onSuccess: (data) => {
        // console.log("data", data.data);
        // wait data.data.data.id to be available
        if (data.data.data.id) {
          setTimeout(() => {
            // router.push(`/BrokerManager/UserPolicies/Edited/${policyId}`);
            router.push(`/Administration/Policies/${data.data.data.id}`);
          }, 1000);
        }
      },
      onError: (error) => {
        setMembers((prev) => {
          return prev.map((member) => {
            return {
              ...member,
              PolicyMember: {
                ...member.PolicyMember,
                status: "isActive",
              },
            };
          });
        });
      },
    });
  };

  if (
    GetInsuredLifeByPolicyId.isLoading ||
    getPolicyNode.isLoading ||
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

  // console.log("Members", members);

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
            title: "Schemes",
            href: `BrokerManager/SchemaManagement/${id}`,
          },
          {
            title: `Schema Management ${id}`,
            href: `/BrokerManager/SchemaManagement/${id}/Schema/${schemeId}`,
          },
          {
            title: `Policy ${policyId}`,
            href: `/BrokerManager/SchemaManagement/${id}/Schema/${schemeId}/Policy/${policyId}`,
          },
        ]}
      />

      <>
        {getPolicyNode?.data?.data?.data && (
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
                  `/BrokerManager/UserPolicies/Edited/${getPolicyNode?.data?.data?.data?.policyId}`
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
        )}
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
        />

        <Box sx={{ width: "100%", mt: 2 }}>
          <EditViewMembersTable
            members={members}
            preferredCommunicationMethod={
              preferredCommunicationMethod?.data?.data
            }
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
    default:
      return 5;
  }
};
