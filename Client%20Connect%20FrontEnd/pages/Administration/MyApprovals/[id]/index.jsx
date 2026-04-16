import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import useToken from "../../../../hooks/useToken";
import { useMutation, useQueries, useQuery } from "react-query";
import { nodeSa, rmaAPI } from "../../../../src/AxiosParams";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import dayjs from "dayjs";
import returnMemberType from "../../_components/returnMemberType";
import GetCancelationReasons from "../../_components/GetCancelationReasons";
import GetBenefitsAndRates from "../../_components/GetBenefitsAndRates";
import CoverMemberTypesLookup from "../../_components/CoverMemberTypesLookup";
import ClaimChecker from "../../_components/ClaimChecker";
import EditFormMain from "../../_components/EditForm/EditFormMain";
import AlertPopup from "../../../../components/Bits/AlertPopup";
import FindDiff from "../../_components/FindDiff";
import InsuredLifeStatusLookup from "../../_components/InsuredLifeStatusLookup";
import EditPolicyData from "../../_components/EditPolicyData";
import AddClientDialog from "../../_components/EditForm/AddClientDialog";
import GetPaymentMethodLookup from "../../_components/GetPaymentMethodLookup";
// import BankingDetailsModal from "../../_components/EditForm/BankingDetailsModal";
import AdditionalTabs from "../../../../components/FormComponents.jsx/PolicyAddiTabView";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import VOODAllMembers from "../../_components/VOODAllMembers";
import AllocateEditBenefits from "../../_components/AllocateEditBenefits";
import EditRequestDialog from "../../_components/EditRequestDialog";
import TotalPremium from "../../_components/TotalPremium";
import PolicyDetailsCard from "../../_components/PolicyDetailsCard";
import RejectEdit from "../../_components/RejectEdit";
import GetEuropAssist from "../../_components/GetEuropAssist";
import InsuredLifeRemovalReason from "../../_components/InsuredLifeRemovalReason";
import { CircularProgress } from "@mui/material";

const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const updatePolicy = async (policyData) => {
  return axios.post(
    `${rmaAPI}/clc/api/Policy/PolicyIntegration/v2/Update`,
    policyData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

const PolicyEditPage = () => {
  const router = useRouter();

  const { id } = router.query;
  const accessToken = useToken();

  const [canEdit, setCanEdit] = React.useState(false);

  const [exceptions, setExceptions] = React.useState([]);
  const [isPremiumFetched, setIsPremiumFetched] = React.useState(false);

  const [refreshTrigger, setRefreshTrigger] = React.useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false);
  const [isOperationError, setIsOperationError] = React.useState(false);

  useEffect(() => {
    if (refreshTrigger) {
      window.location.reload();
    }
  }, [refreshTrigger, router]);

  // State
  const [request, setRequest] = React.useState({
    id: "",
    active: false,
    requestType: "",
    requestedBy: "",
    requestedDate: "",
    requestStatus: "",
    requestStatusNote: "",
    expiryDate: "",
    createdBy: "",
    updatedBy: "",
    approverId: null,
    approvedAt: null,
    createdAt: "",
    updatedAt: "",
    attachments: [],
  });
  const [PolicyData, setPolicyData] = React.useState({
    PolicyId: "",
    PolicyNumber: "",
    brokerage: "",
    scheme: "",
    mainMember: "",
    mainMemberId: "",
    BrokerageId: "",
    ParentPolicyNumber: "",
    policyInceptionDate: "",
    PolicyStatus: "",
    EffectiveFrom: "",
    policyCancelReasonEnum: "",
    ProductOptionId: "",
    ProductOptionCode: "",
    InstallmentPremium: "",
    coverAmount: "",
    AdminPercentage: "",
    CommissionPercentage: "",
    BinderFeePercentage: "",
    waitingPeriod: "",
    updatedAt: "",
    updatedBy: "",
  });
  const [PolicyDetailsOrg, setPolicyDetailsOrg] = React.useState({});

  const [ParentPolicy, setParentPolicy] = React.useState(null);

  const [policyDataDiff, setPolicyDataDiff] = React.useState([]);

  const [PolicyMembers, setPolicyMembers] = React.useState([]);
  const [PolicyMembersOrg, setPolicyMembersOrg] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);

  // const [BankingDetailsOrg, setBankingDetailsOrg] = React.useState(null);

  // const [BankingDetails, setBankingDetails] = React.useState(null);

  const [bankingDetailsDiff, setBankingDetailsDiff] = React.useState([]);

  const [beneficiaries, setBeneficiaries] = React.useState([]);

  const [total, setTotal] = React.useState(0);
  const [premiumTotal, setPremiumTotal] = React.useState(0);

  // State

  // Lookups
  const { cancellationReasons } = GetCancelationReasons();
  const { CoverMemberTypes, MemberTypesComplete } = CoverMemberTypesLookup();

  const { PaymentMethods, isLoadingPaymentMethods } = GetPaymentMethodLookup();

  let { benefits, completedBenefits, error } = GetBenefitsAndRates({
    productOptionId: PolicyData?.ProductOptionId,
  });
  let { insuredLifeRemovalReason, insuredLifeRemovalReasonComplete } =
    InsuredLifeRemovalReason();

  let { InsuredLifeStatus, InsuredLifeStatusComplete } =
    InsuredLifeStatusLookup();

  let { europAssistFee } = GetEuropAssist();
  const [differences, setDifferences] = React.useState([]);

  // Lookups

  function findDifferences(obj1, obj2) {
    const differences = {};

    for (const key in obj1) {
      if (obj1[key] !== obj2[key]) {
        differences[key] = { from: obj1[key], to: obj2[key] };
      }
    }

    return differences;
  }

  useEffect(() => {
    if (
      PolicyData &&
      PolicyDetailsOrg &&
      Object.keys(PolicyDetailsOrg) &&
      Object.keys(PolicyDetailsOrg).length > 0 &&
      Object.keys(PolicyData) &&
      Object.keys(PolicyData).length > 0
    ) {
      let diff =
        PolicyDetailsOrg &&
        PolicyData &&
        findDifferences(PolicyDetailsOrg, PolicyData);

      setPolicyDataDiff(diff);
    }
  }, [PolicyData, PolicyDetailsOrg]);

  const getRequest = useQuery(
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
        let reqData = data.data.data;

        setRequest((prev) => {
          return {
            ...prev,
            id: reqData.id,
            active: reqData.active,
            requestType: reqData.requestType,
            requestedBy: reqData.requestedBy,
            requestedDate: reqData.requestedDate,
            requestStatus: reqData.requestStatus,
            requestStatusNote: reqData.requestStatusNote,
            requestDescription: reqData.requestDescription,
            expiryDate: reqData.expiryDate,
            createdBy: reqData.createdBy,
            updatedBy: reqData.updatedBy,
            approverId: reqData.approverId,
            approvedAt: reqData.approvedAt,
            createdAt: reqData.createdAt,
            updatedAt: reqData.updatedAt,
            attachments: reqData.attachments,
          };
        });
        setPolicyData((prev) => {
          return {
            ...prev,
            PolicyId: reqData.PolicyData.PolicyId,
            PolicyNumber: reqData.PolicyData.PolicyNumber,
            brokerage: reqData.PolicyData.brokerage,
            scheme: reqData.PolicyData.scheme,
            mainMember: reqData.PolicyData.mainMember,
            mainMemberId: reqData.PolicyData.mainMemberId,
            BrokerageId: reqData.PolicyData.BrokerageId,
            ParentPolicyNumber: reqData.PolicyData.ParentPolicyNumber,
            PolicyStatus: reqData.PolicyData.PolicyStatus,
            EffectiveFrom: reqData.PolicyData.EffectiveFrom,
            policyCancelReasonEnum: reqData.PolicyData.policyCancelReasonEnum,
            ProductOptionId: reqData.PolicyData.ProductOptionId,
            ProductOptionCode: reqData.PolicyData.ProductOptionCode,
            InstallmentPremium: reqData.PolicyData.InstallmentPremium,
            coverAmount: reqData.PolicyData.coverAmount,
            AdminPercentage: reqData.PolicyData.AdminPercentage,
            CommissionPercentage: reqData.PolicyData.CommissionPercentage,
            BinderFeePercentage: reqData.PolicyData.BinderFeePercentage,
            updatedAt: reqData.PolicyData.updatedAt,
            updatedBy: reqData.PolicyData.updatedBy,
          };
        });
        setPolicyMembers(
          reqData?.PolicyData?.PolicyMembers
            ? reqData?.PolicyData?.PolicyMembers
            : [],
        );
        // console.log("policyData", PolicyData);
        // setBankingDetails(
        //   reqData?.PolicyData?.BankingDetails
        //     ? reqData?.PolicyData?.BankingDetails
        //     : {}
        // );
      },
    },
  );

  const RMAPolicyDetails = useQuery(
    `policyQuery${PolicyData?.PolicyId}`,
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/${PolicyData?.PolicyId}`,
        {},
      ),

    {
      enabled:
        !getRequest.isLoading && !!accessToken && !!PolicyData?.PolicyId
          ? true
          : false,
      onSuccess: (data) => {
        let RMAPolicyData = data.data;

        // console.log("RMAPolicyData", RMAPolicyData);

        let thisData = {
          ClientReference: RMAPolicyData.clientReference,
          FSPNumber: RMAPolicyData.brokerage?.fspNumber,
          representativeId: RMAPolicyData.representativeId,
          policyInceptionDate: RMAPolicyData.policyInceptionDate,
          annualPremium: RMAPolicyData.annualPremium || 0,
          policyPayeeId: RMAPolicyData.policyPayeeId,
          AdminPercentage: RMAPolicyData.adminPercentage,
          policyMovementId: RMAPolicyData.policyMovementId,
          expiryDate: RMAPolicyData.expiryDate,
          paymentFrequency: RMAPolicyData.paymentFrequency,
          BinderFeePercentage: RMAPolicyData.binderFeePercentage,
          clientName: RMAPolicyData.clientName,
          CommissionPercentage: RMAPolicyData.commissionPercentage,
          decemberInstallmentDayOfMonth:
            RMAPolicyData.decemberInstallmentDayOfMonth,
          InstallmentPremium: dayjs(ParentPolicy?.policyInceptionDate).isAfter(
            dayjs("2023-11-01", "YYYY-MM-DD"),
          )
            ? RMAPolicyData.installmentPremium
            : Math.round(RMAPolicyData.installmentPremium),
          PolicyStatus: RMAPolicyData.policyStatus,
          productOptionName: RMAPolicyData?.productOption.name,
          premiumAdjustmentPercentage:
            RMAPolicyData?.premiumAdjustmentPercentage,
          regularInstallmentDayOfMonth:
            RMAPolicyData.regularInstallmentDayOfMonth,
          paymentFrequency: RMAPolicyData.paymentFrequency,
          paymentFrequencyId: RMAPolicyData.paymentFrequencyId,
          paymentMethod: RMAPolicyData.paymentMethod,
          paymentMethodId: RMAPolicyData.paymentMethodId,
          paymentMethodDetails: PaymentMethods.find(
            (method) => method.id === RMAPolicyData.paymentMethodId,
          ), // Lookup
          ProductOptionId: RMAPolicyData.productOptionId,

          policyInceptionDate: dayjs
            .tz(RMAPolicyData.policyInceptionDate, "Africa/Johannesburg")
            .format(),
          policyCancelReasonEnum:
            RMAPolicyData.policyStatus !== 1 && cancellationReasons
              ? cancellationReasons.find(
                  (reason) => reason.id === RMAPolicyData.policyCancelReasonId,
                )
              : null,
          ProductOptionCode: RMAPolicyData?.productOption?.code,

          waitingPeriod:
            dayjs(RMAPolicyData?.policyInceptionDate).format("YYYY-MM-DD") <
            dayjs("2022-03-01").format("YYYY-MM-DD")
              ? 6
              : 3,
        };

        setPolicyDetailsOrg((prev) => {
          return {
            ...prev,
            ...thisData,
          };
        });
        setPolicyData((prev) => {
          return {
            ...prev,
            ...thisData,
            CommissionPercentage: PolicyData.CommissionPercentage
              ? PolicyData.CommissionPercentage
              : RMAPolicyData.commissionPercentage,
            AdminPercentage: PolicyData.AdminPercentage
              ? PolicyData.AdminPercentage
              : RMAPolicyData.adminPercentage,
            BinderFeePercentage: PolicyData.BinderFeePercentage
              ? PolicyData.BinderFeePercentage
              : RMAPolicyData.binderFeePercentage,
            InstallmentPremium: PolicyData.InstallmentPremium
              ? PolicyData.InstallmentPremium
              : RMAPolicyData.installmentPremium,

            coverAmount: PolicyData.coverAmount
              ? PolicyData.coverAmount
              : RMAPolicyData.coverAmount,
            annualPremium: PolicyData.annualPremium
              ? PolicyData.annualPremium
              : RMAPolicyData.annualPremium,
            AdminPercentage: PolicyData.AdminPercentage
              ? PolicyData.AdminPercentage
              : RMAPolicyData.adminPercentage,
          };
        });
      },
    },
  );

  const getRepresentative = useQuery(
    ["getRepresentative", PolicyData?.representativeId],
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/Broker/Representative/${PolicyData?.representativeId}`,
        {},
      ),
    {
      enabled: !!PolicyData?.representativeId,
      onSuccess: (data) => {
        setPolicyData((prev) => {
          return {
            ...prev,
            // representativeName: data.data.name,
            representativeIdNumber: data.data.idNumber,
          };
        });
      },
    },
  );

  const getParent = useQuery(
    `policyQuery${PolicyData?.ParentPolicyNumber}`,
    async () =>
      await axios.get(
        `${rmaAPI}/clc/api/Policy/Policy/${PolicyData?.ParentPolicyNumber}`,
        {},
      ),

    {
      enabled:
        !getRequest.isLoading &&
        !!accessToken &&
        !!PolicyData?.ParentPolicyNumber
          ? true
          : false,
      onSuccess: (data) => {
        setParentPolicy(data.data);
      },
    },
  );

  const [insurledLifeIds, setInsurledLifeIds] = React.useState([]);
  const [beneficiaryList, setBeneficiaryList] = React.useState([]);

  const PolicyOrgMembersGet = useQuery(
    ["getRMA", id],
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/InsuredLife/GetPolicyInsuredLives/${PolicyData?.PolicyId}`,
        {},
      ),
    {
      enabled:
        !!PolicyData?.PolicyId &&
        !!accessToken &&
        !!completedBenefits &&
        !!MemberTypesComplete,

      onSuccess: (data) => {
        let MemberData = [];

        let toRolePlayers = [];

        let mainMember = {};

        data?.data?.forEach((item, index) => {
          if (returnMemberType(item.rolePlayerTypeId) === 1) {
            mainMember = { ...item };
            toRolePlayers.push(...item.rolePlayer.toRolePlayers);
          }
        });

        data?.data?.forEach((item, index) => {
          if (returnMemberType(item.rolePlayerTypeId) === 1) {
            setPolicyDetailsOrg((prev) => {
              return {
                ...prev,
                coverAmount: item.coverAmount
                  ? item.coverAmount
                  : benefits?.find(
                      (benefit) => benefit.benefitId === item.statedBenefitId,
                    ).coverAmount,
              };
            });
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
              if (beneficiary?.policyId === parseInt(PolicyData.PolicyId, 10)) {
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

          MemberData.push({
            RolePlayerId: item.rolePlayer.rolePlayerId,
            IsBeneficiary: toRolePlayers.some(
              (toRole) =>
                toRole.fromRolePlayerId === item.rolePlayer.rolePlayerId,
            ),
            FirstName: item.rolePlayer.person.firstName,
            Surname: item.rolePlayer.person.surname,

            IdNumber: item.rolePlayer.person.idNumber,
            // Save Date of

            DateOfBirth: dayjs
              .utc(item.rolePlayer.person.dateOfBirth) // Parse as UTC
              .tz("Africa/Johannesburg") // Convert to Africa/Johannesburg timezone
              .format(),

            IdTypeId: item.rolePlayer.person.idType || 0,
            Gender: item.rolePlayer.person.gender || "",
            MemberTypeId: returnMemberType(item.rolePlayerTypeId),
            MemberType: CoverMemberTypes.find(
              (type) => type.id === returnMemberType(item.rolePlayerTypeId),
            ).name,
            benefitId: item.statedBenefitId,

            MaritalStatus: item.rolePlayer.person.maritalStatus || "",
            // IsBeneficiary: item.rolePlayer.person.isBeneficiary,
            // IsBeneficiary: toRolePlayers.includes(item.rolePlayer.rolePlayerId),

            EmailAddress: item.rolePlayer.emailAddress,
            MobileNumber: item.rolePlayer.cellNumber,
            PolicyInceptionDate: dayjs
              .tz(item.startDate, "Africa/Johannesburg")
              .format(),
            insuredLifeStatus: item.insuredLifeStatus,
            insuredLifeStatusName: InsuredLifeStatus?.find(
              (status) => status.id === item.insuredLifeStatus,
            ).name,

            SecondaryNumber: item.rolePlayer.tellNumber,
            preferredCommunicationTypeId: item.rolePlayer
              .preferredCommunicationTypeId
              ? item.rolePlayer.preferredCommunicationTypeId
              : 0,
            endDate: item.endDate,
            DateOfDeath: item.rolePlayer.person.dateOfDeath || "",
            DeathCertificateNumber:
              item.rolePlayer.person.deathCertificateNumber,
            IsVopdVerified: item.rolePlayer.person.isVopdVerified,
            DateVopdVerified: item.rolePlayer.person.dateVopdVerified,
            MemberAction: 0,
            IsAlive: item.rolePlayer.person.isAlive,
          });

          // remove all rolePlayers from filteredToRolePlayers that are beneficiaries

          setPolicyMembersOrg(MemberData);
        });

        const memberIds = new Set(
          MemberData.map((member) => member.RolePlayerId),
        );
        const filterList = toRolePlayers.filter(
          (rolePlayer) => !memberIds.has(rolePlayer.fromRolePlayerId),
        );

        setBeneficiaries(filterList);
      },
    },
  );

  const getBeneficiaryDetails = async (item, accessToken) =>
    await axios.get(`${rmaAPI}/clc/api/RolePlayer/RolePlayer/${item}`, {});

  // Effect to fetch beneficiary details when the beneficiaryList changes
  useEffect(() => {
    const fetchBeneficiaryDetails = async () => {
      try {
        // Filter out the dependents also on the beneficiaryList
        const filteredDependentList = beneficiaryList.filter((item) =>
          insurledLifeIds.includes(item),
        );

        // set dependents isBeneficiary to true
        const dependents = PolicyMembersOrg.map((member) => {
          if (filteredDependentList.includes(member.rolePlayerId)) {
            return {
              ...member,
              isBeneficiary: true,
            };
          }
          return member;
        });

        setPolicyMembersOrg(dependents);

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
            RolePlayerId: beneficiary.rolePlayerId,
            IsBeneficiary: true,
            FirstName: beneficiary?.person?.firstName || "",
            Surname: beneficiary?.person?.surname || "",
            IdTypeId: beneficiary?.person?.idType || "",
            IdNumber: beneficiary?.person?.idNumber || "",
            DateOfBirth: dayjs
              .tz(beneficiary?.person?.dateOfBirth, "Africa/Johannesburg")
              .format(),
            Gender: beneficiary?.person?.gender || "",
            MemberTypeId: 6,
            MemberType: "Beneficiary",
            EmailAddress: beneficiary?.emailAddress,
            MobileNumber: beneficiary?.cellNumber,
            PolicyInceptionDate: dayjs
              .tz(beneficiary.joinDate, "Africa/Johannesburg")
              .format(),
            insuredLifeStatus: 1,
            insuredLifeStatusName: InsuredLifeStatus?.find(
              (status) => status.id === 1,
            )?.name,
            SecondaryNumber: beneficiary.tellNumber,
            PreferredCommunicationTypeId:
              beneficiary.preferredCommunicationTypeId || 0,
            endDate: beneficiary.endDate,
            DateOfDeath: beneficiary?.person?.dateOfDeath || "",
            DeathCertificateNumber:
              beneficiary?.person?.deathCertificateNumber || "",
            IsVopdVerified: beneficiary?.person?.isVopdVerified || "",
            DateVopdVerified: beneficiary?.person?.dateVopdVerified || "",
            MemberAction: 0,
            IsAlive: beneficiary?.person?.isAlive,
          };

          // only set member if it does not exist
          if (
            !PolicyMembersOrg.some(
              (member) => member.rolePlayerId === newMember.RolePlayerId,
            )
          ) {
            setPolicyMembersOrg((prev) => [...prev, newMember]);
          }
        });
      } catch (error) {
        console.error("Error fetching beneficiary details:", error);
      }
    };

    if (beneficiaryList.length > 0) {
      fetchBeneficiaryDetails();
      setBeneficiaryList([]);
    }
  }, [
    beneficiaryList,
    insurledLifeIds,
    accessToken,
    PolicyMembersOrg,
    InsuredLifeStatus,
  ]);

  const GetAddresses = useQueries(
    (PolicyMembersOrg &&
    Array.isArray(PolicyMembersOrg) &&
    PolicyMembersOrg.length > 0
      ? PolicyMembersOrg.filter((member) => member.MemberTypeId === 1)
      : []
    ).map((member) => ({
      queryKey: ["Addresses", member.RolePlayerId],
      queryFn: async () => {
        const response = await axios.get(
          `${rmaAPI}/clc/api/RolePlayer/RolePlayer/${member.RolePlayerId}`,
          {},
        );
        return response.data;
      },
      onSuccess: (data) => {
        setPolicyMembers((prev) =>
          prev.map((item) =>
            item.RolePlayerId === member.RolePlayerId
              ? {
                  ...item,
                  Addresses:
                    item.Addresses && item.Addresses.length > 0
                      ? item.Addresses
                      : data?.rolePlayerAddresses?.map((address) => ({
                          AddressTypeId: address.addressType.toUpperCase(),
                          AddressLine1: address.addressLine1.toUpperCase(),
                          AddressLine2: address.addressLine2.toUpperCase(),
                          City: address.city.toUpperCase(),
                          Province: address.province.toUpperCase(),
                          Country: "SOUTH AFRICA",
                          PostalCode: address.postalCode,
                        })),
                }
              : item,
          ),
        );
        setPolicyMembersOrg((prev) =>
          prev.map((item) =>
            item.RolePlayerId === member.RolePlayerId
              ? {
                  ...item,
                  Addresses: data?.rolePlayerAddresses?.map((address) => ({
                    AddressTypeId: address.addressType,
                    AddressLine1: address.addressLine1,
                    AddressLine2: address.addressLine2,
                    City: address.city,
                    Province: address.province,
                    Country: address.countryId === 1 ? "South Africa" : "Other",
                    PostalCode: address.postalCode,
                  })),
                }
              : item,
          ),
        );
      },
      enabled: !!member.RolePlayerId, // Ensures the query only runs if RolePlayerId exists
    })),
  );

  const getBenefitsDetailsORG = useQueries(
    PolicyMembersOrg.map((member) => ({
      queryKey: ["getBenefitsAndRates", member?.benefitId],
      queryFn: async () => {
        const response = await axios.get(
          `${rmaAPI}/clc/api/Product/Benefit/${member?.benefitId}`,
          {},
        );
        return response.data;
      },
      onSuccess: (data) => {
        setPolicyMembersOrg((prev) =>
          prev.map((item) =>
            item.benefitId === member?.benefitId
              ? {
                  ...item,
                  benefitId: member?.benefitId,
                  BenefitCode: data?.code,
                  Premium: data?.benefitRates[0]?.baseRate,
                  CoverAmount: data?.benefitRates[0]?.benefitAmount,
                  BenefitDetail: data?.name,
                  Benefit: data?.name, // Keep one BenefitDetail key
                  benefitRuleItems: data?.ruleItems,
                }
              : item,
          ),
        );
      },
      enabled: !!member?.benefitId && member?.benefitId !== 0, // Ensures the query only runs if benefitId exists
    })),
  );

  const getBenefitsDetails = useQueries(
    PolicyMembers.map((member) => ({
      queryKey: ["getBenefitsAndRates", member?.benefitId],
      queryFn: async () => {
        const response = await axios.get(
          `${rmaAPI}/clc/api/Product/Benefit/${member?.benefitId}`,
          {},
        );
        return response.data;
      },
      onSuccess: (data) => {
        setPolicyMembers((prev) =>
          prev.map((item) =>
            item.benefitId === member?.benefitId
              ? {
                  ...item,
                  benefitId: member?.benefitId,
                  BenefitCode: data?.code,
                  Premium: data?.benefitRates[0]?.baseRate,
                  CoverAmount: data?.benefitRates[0]?.benefitAmount,
                  BenefitDetail: data?.name,
                  Benefit: data?.name, // Keep one BenefitDetail key
                  benefitRuleItems: data?.ruleItems,
                }
              : item,
          ),
        );
      },
      enabled: !!member?.benefitId && member?.benefitId !== 0, // Ensures the query only runs if benefitId exists
    })),
  );

  // const [BeneficiaryQuery, setBeneficiaryQuery] = React.useState([]);

  // useEffect(() => {
  //   if (beneficiaries && beneficiaries.length > 0) {
  //     const queries = beneficiaries.map((beneficiary) => ({
  //       queryKey: ["getBeneficiaries", beneficiary.fromRolePlayerId],
  //       queryFn: async () => {
  //         const response = await axios.get(
  //           `${rmaAPI}/clc/api/RolePlayer/RolePlayer/${beneficiary.fromRolePlayerId}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${accessToken}`,
  //             },
  //           }
  //         );
  //         return response.data;
  //       },
  //       onSuccess: (data) => {
  //         setPolicyMembersOrg((prev) => [
  //           ...prev,
  //           {
  //             RolePlayerId: data.rolePlayerId,
  //             IsBeneficiary: true,
  //             FirstName: data?.person?.firstName || "",
  //             Surname: data?.person?.surname || "",
  //             IdTypeId: data?.person?.idType || "",
  //             IdNumber: data?.person?.idNumber || "",
  //             DateOfBirth: dayjs
  //               .tz(data?.person?.dateOfBirth, "Africa/Johannesburg")
  //               .format(),
  //             Gender: data?.person?.gender || "",
  //             MemberTypeId: 6,
  //             MemberType: "Beneficiary",
  //             EmailAddress: data?.emailAddress,
  //             MobileNumber: data?.cellNumber,
  //             PolicyInceptionDate: dayjs
  //               .tz(data.joinDate, "Africa/Johannesburg")
  //               .format(),
  //             insuredLifeStatus: 1,
  //             insuredLifeStatusName: InsuredLifeStatus?.find(
  //               (status) => status.id === 1
  //             )?.name,
  //             SecondaryNumber: data.tellNumber,
  //             PreferredCommunicationTypeId:
  //               data.preferredCommunicationTypeId || 0,
  //             endDate: data.endDate,
  //             DateOfDeath: data?.person?.dateOfDeath || "",
  //             DeathCertificateNumber:
  //               data?.person?.deathCertificateNumber || "",
  //             IsVopdVerified: data?.person?.isVopdVerified || "",
  //             DateVopdVerified: data?.person?.dateVopdVerified || "",
  //             MemberAction: 0,
  //             IsAlive: data?.person?.isAlive,
  //           },
  //         ]);
  //       },
  //       enabled: !!beneficiary.fromRolePlayerId && !!beneficiary.toRolePlayerId,
  //     }));

  //     setBeneficiaryQuery(queries);
  //   }
  // }, [beneficiaries, accessToken, InsuredLifeStatus, setBeneficiaryQuery]);

  useEffect(() => {
    // if the PolicyMembersOrg member is not in PolicyMembers, add it to PolicyMembers

    if (PolicyMembersOrg && PolicyMembersOrg.length > 0) {
      PolicyMembersOrg.forEach((member) => {
        if (
          !PolicyMembers.some((mem) => mem.RolePlayerId === member.RolePlayerId)
        ) {
          setPolicyMembers((prev) => [...prev, member]);
        }
      });
    }
  }, [PolicyMembers, PolicyMembersOrg]);

  // Find The Differences between PolicyMembers and PolicyMembersOrg and set the differences to the differences state
  useEffect(() => {
    if (
      PolicyMembersOrg &&
      PolicyMembers &&
      PolicyMembersOrg.length > 0 &&
      PolicyMembers.length > 0
    ) {
      let diff = FindDiff(PolicyMembersOrg, PolicyMembers);
      setDifferences(diff);

      let exceptions = PolicyMembers.map((member) => {
        if (member?.exceptions && member?.exceptions.length > 0) {
          return {
            RolePlayerId: member.RolePlayerId,
            FirstName: member?.FirstName || "",
            Surname: member?.Surname || "",
            exceptions: member.exceptions,
          };
        }
      });

      setExceptions(exceptions);
    }
  }, [PolicyMembersOrg, PolicyMembers]);

  let MainMember = Array.isArray(PolicyMembers)
    ? PolicyMembers.find((member) => member?.MemberTypeId === 1)
    : null;

  // const getBankingDetails = useQuery(
  //   `GetBankingDetailsByRolePlayerId`,
  //   () =>
  //     axios.get(
  //       `${rmaAPI}/clc/api/RolePlayer/RolePlayer/GetBankingDetailsByRolePlayerId/${MainMember?.RolePlayerId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     ),
  //   {
  //     enabled: !!accessToken && !!MainMember?.RolePlayerId,
  //     onSuccess: (data) => {
  //       let details = data?.data[0];

  //       let setDetail = {
  //         rolePlayerId: MainMember?.RolePlayerId,
  //         effectiveDate: dayjs(),
  //         accountNumber: details?.accountNumber || "",
  //         bankName: details?.bankName || "",
  //         accountHolderInitials:
  //           details?.initials ||
  //           (() => {
  //             if (!details?.accountHolderName) return "";
  //             const names = details?.accountHolderName
  //               .split(" ")
  //               .filter((name) => name?.length > 0);
  //             switch (names.length) {
  //               case 0:
  //                 return "";
  //               case 1:
  //                 return names[0].charAt(0).toUpperCase();
  //               default:
  //                 return `${names[0].charAt(0).toUpperCase()}.${names[
  //                   names.length - 1
  //                 ]
  //                   .charAt(0)
  //                   .toUpperCase()}`;
  //             }
  //           })(),

  //         accountHolderLastName: details?.accountHolderName || "",
  //         accountHolderIdNumber: details?.accountHolderIdNumber || "",
  //         bankBranchId: details?.bankBranchId || "",
  //         bankAccountType: details?.bankAccountType || "",
  //         branchCode: details?.branchCode || "",
  //         rolePlayerBankingId: details?.rolePlayerBankingId || "",
  //       };

  //       if (details) {
  //         setBankingDetails(
  //           Object.keys(BankingDetails) &&
  //             Object.keys(BankingDetails).length > 0
  //             ? BankingDetails
  //             : setDetail
  //         );
  //         setBankingDetailsOrg(setDetail);
  //       }
  //     },
  //   }
  // );

  // useEffect(() => {
  //   if (
  //     BankingDetailsOrg &&
  //     BankingDetails &&
  //     Object.keys(BankingDetailsOrg) &&
  //     Object.keys(BankingDetailsOrg).length > 0 &&
  //     Object.keys(BankingDetails) &&
  //     Object.keys(BankingDetails).length > 0
  //   ) {
  //     let diff =
  //       BankingDetailsOrg &&
  //       BankingDetails &&
  //       findDifferences(BankingDetailsOrg, BankingDetails);

  //     setBankingDetailsDiff(diff);
  //   }
  // }, [BankingDetailsOrg, BankingDetails]);

  const UpdateEditRequest = useMutation({
    mutationFn: async (data) => {
      return await axios.put(`${nodeSa}/edit/requests/${id}/policyData`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    onSuccess: (data) => {
      getRequest.refetch();
    },
  });
  const SubmitForApprovalRequest = useMutation({
    mutationFn: async (data) => {
      return await axios.patch(`${nodeSa}/edit/requests/${id}/submit`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    onSuccess: (data) => {
      getRequest.refetch();
    },
  });

  useEffect(() => {
    setPolicyData((prev) => {
      return {
        ...prev,
        InstallmentPremium: premiumTotal,
      };
    });
  }, [premiumTotal]);

  // SUBMIT Functions
  const ApproveEditFunction = async () => {
    try {
      const parseDate = (date) => {
        if (!date || date === "Invalid Date") return null;
        return date;
      };

      const parseIntOrNull = (val) => {
        if (val === null || val === undefined || val === "") return null;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
      };

      let SubData = {
        PolicyData,
        InstallmentPremium: premiumTotal,
        coverAmount: PolicyData.coverAmount,
        ...request,
        requestStatus: "Complete",
        requestStatusNote: "Edit has been completed",
        PolicyMembers,
        PolicyMembersOrg,
      };

      // console.log("SubData1", SubData);

      // update memberTypeId to 5 if the member is a beneficiary and the memberTypeId == 6
      const updatedPolicyMembers = PolicyMembers.map((member) => {
        if (member.IsBeneficiary && member.MemberTypeId === 6) {
          return {
            ...member,
            MemberTypeId: 5,
            MemberType: "Beneficiary",
          };
        }
        return member;
      });

      const memberData = (updatedPolicyMembers || [])
        .filter(
          (member) =>
            member &&
            (member.insuredLifeStatus === 1 || member.MemberAction === 3),
        )
        .map((member) => {
          let memberAddresses = [];
          // if member.Addresses is set
          if (member.Addresses && Array.isArray(member.Addresses)) {
            // loop through each address and trim and uppercase the string values and set Country to SOUTH AFRICA
            memberAddresses = member.Addresses.map((address) => {
              return {
                AddressTypeId: address.AddressTypeId || "",
                AddressLine1: address.AddressLine1
                  ? address.AddressLine1.trim().toUpperCase()
                  : "",
                AddressLine2: address.AddressLine2
                  ? address.AddressLine2.trim().toUpperCase()
                  : "",
                City: address.City ? address.City.trim().toUpperCase() : "",
                Province: address.Province
                  ? address.Province.trim().toUpperCase()
                  : "",
                Country: "SOUTH AFRICA",
                PostalCode: address.PostalCode
                  ? address.PostalCode.trim().toUpperCase()
                  : "",
              };
            });
          }

          return {
            RolePlayerId: parseIntOrNull(member.RolePlayerId) || 0,
            FirstName: (member.FirstName || "").trim().toUpperCase(),
            Surname: (member.Surname || "").trim().toUpperCase(),
            IdTypeId: parseIntOrNull(member.IdTypeId) || 0,
            IdNumber: (member.IdNumber || "").trim(),
            DateOfBirth: parseDate(member.DateOfBirth),
            PassportExpiryDate: parseDate(member.PassportExpiryDate),
            Nationality: parseIntOrNull(member.Nationality),
            Gender: parseIntOrNull(member.Gender),
            MaritalStatus: parseIntOrNull(member.MaritalStatus),
            MemberTypeId: parseIntOrNull(member.MemberTypeId) || 0,
            BenefitId: parseIntOrNull(member.BenefitId || member.benefitId) || 0,
            BenefitCode: member.BenefitCode || "",
            CoverAmount: parseFloat(member.CoverAmount) || 0,
            PolicyInceptionDate:
              parseDate(member.PolicyInceptionDate) || dayjs().format(),
            IsBeneficiary: !!member.IsBeneficiary,
            IsStudying: !!member.isStudent,
            IsDisabled: !!member.isDisabled,
            EmailAddress:
              member.EmailAddress === "" ? null : member.EmailAddress,
            MobileNumber:
              member.MobileNumber === "" ? null : member.MobileNumber,
            PreferredCommunicationType:
              parseIntOrNull(member.preferredCommunicationTypeId) || 0,
            MemberAction: parseIntOrNull(member.MemberAction) || 0,
            IsAlive:
              typeof member.IsAlive !== "undefined" ? !!member.IsAlive : true,
            DateOfDeath: parseDate(member.DateOfDeath),
            DeathCertificateNumber: member.DeathCertificateNumber || "",
            IsVopdVerified: !!member.IsVopdVerified,
            DateVopdVerified: parseDate(member.DateVopdVerified),
            InsuredLifeRemovalReason: parseIntOrNull(
              member.InsuredLifeRemovalReason,
            ),
            Addresses: memberAddresses,
          };
        });

      const submitData = {
        FSPNumber: SubData.PolicyData.FSPNumber || "",
        RepresentativeIdNumber: SubData.PolicyData.representativeIdNumber || "",
        ProductOptionCode: SubData.PolicyData.ProductOptionCode || "",
        PolicyNumber: SubData.PolicyData.PolicyNumber || "",
        PolicyStatus: parseIntOrNull(SubData.PolicyData.PolicyStatus) ?? 0,
        ClientReference: SubData.PolicyData.ClientReference || "",
        PolicyId: parseIntOrNull(SubData.PolicyData.PolicyId) || 0,
        ParentPolicyNumber: ParentPolicy?.policyNumber || "",
        InstallmentPremium: parseFloat(SubData.InstallmentPremium) || 0,
        AssignBenefit: true,
        PolicyMembers: memberData,
      };

      // console.log("submitData", submitData);

      const response = await updatePolicy(submitData);

      // console.log("response", response);

      // const {
      //   PolicyData,
      //   InstallmentPremium,
      //   requestStatus,
      //   requestStatusNote,
      //   requestType,
      //   requestedBy,
      //   coverAmount,
      //   PolicyMembers,
      //   PolicyMembersOrg,
      // } = req.body;

      if (response.data.isOperationSuccessFull) {
        UpdateEditRequest.mutate(SubData);
        setRefreshTrigger((prev) => !prev);
      } else {
        // Explicitly set to false when operation fails
        setIsOperationError(
          response.data.responseMessage || "Could not update policy on eCare",
        );
      }

      handleClose();
    } catch (error) {
      console.error("ApproveEditFunction Error:", error);
      setIsOperationError(
        error?.response?.data?.message || "Could not update policy on eCare",
      );
    }
  };

  const RejectEditFunction = ({ reason }) => {
    let SubData = {
      PolicyData,
      InstallmentPremium: premiumTotal,
      coverAmount: PolicyData.coverAmount,
      ...request,
      requestStatus: "Rejected",
      requestStatusNote: reason,
      PolicyMembers,
      PolicyMembersOrg,
    };

    UpdateEditRequest.mutate(SubData);
  };

  const deleteException = (RolePlayerId) => {
    setExceptions((prev) =>
      prev.filter((exception) => exception?.RolePlayerId !== RolePlayerId),
    );
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmOpen = () => {
    setOpenConfirm(true);
  };

  const handleConfirmClose = () => {
    setOpenConfirm(false);
  };

  const handleConfirm = async () => {
    setIsConfirmLoading(true);
    try {
      await ApproveEditFunction();
    } finally {
      setIsConfirmLoading(false);
      handleConfirmClose();
    }
  };

  return (
    <div>
      {GetAddresses.isError && (
        <Alert severity="error">
          Addresses Error : {GetAddresses?.error?.message}
        </Alert>
      )}
      {/* {getBankingDetails.isError && (
        <Alert severity="error">
          Banking Details Error : {getBankingDetails?.error?.message}
        </Alert>
      )} */}
      {PolicyOrgMembersGet.isError && (
        <Alert severity="error">
          Get Policy Insured Lives Error : {PolicyOrgMembersGet?.error?.message}
        </Alert>
      )}

      {RMAPolicyDetails.isError && (
        <Alert severity="error">
          Get Policy Error : {RMAPolicyDetails?.error?.message}
        </Alert>
      )}

      {getBenefitsDetailsORG.isLoading && getBenefitsDetails.isLoading() && (
        <div>getBenefitsDetailsORG Loading...</div>
      )}
      {/* {getBankingDetails.isLoading && <div>get Banking Details Loading...</div>} */}

      {isLoadingPaymentMethods.isLoading && (
        <div>Payment Methods Loading...</div>
      )}
      {getRequest.isLoading && <div>getRequest Loading...</div>}
      {RMAPolicyDetails.isLoading && <div>RMAPolicyDetails Loading...</div>}

      {PolicyOrgMembersGet.isLoading && (
        <div>PolicyOrgMembersGet Loading...</div>
      )}
      {GetAddresses.isLoading && <div>Addresses Loading...</div>}

      {PolicyData && ParentPolicy && (
        <PolicyDetailsCard
          PolicyData={PolicyData}
          ParentPolicy={ParentPolicy}
        />
      )}

      {getRequest.isSuccess && (
        <EditRequestDialog
          request={request}
          setRequest={setRequest}
          noEdit={true}
        />
      )}

      {getRequest.isLoading ? (
        <div>Loading request...</div>
      ) : (
        <>
          {PolicyData && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <EditPolicyData
                  MainMember={MainMember}
                  PolicyData={PolicyData}
                  setPolicyData={setPolicyData}
                  setPolicyMembers={setPolicyMembers}
                  policyDataDiff={policyDataDiff}
                  policyDetailsOrg={PolicyDetailsOrg}
                  noEdit={true}
                />
              </Grid>
              {/* <Grid item xs={6}>
                {PolicyData?.paymentMethodDetails ? (
                  <Stack>
                    {PolicyData?.paymentMethodDetails?.id === 11 &&
                    BankingDetails &&
                    MainMember ? (
                      <BankingDetailsModal
                        PolicyData={PolicyData}
                        diff={bankingDetailsDiff}
                        bankingDetails={BankingDetails}
                        setBankingDetails={setBankingDetails}
                        bankingDetailsOrg={BankingDetailsOrg}
                      />
                    ) : (
                      <Alert variant="outlined" severity="info">
                        No banking details options for -{" "}
                        {PolicyData?.paymentMethodDetails?.name}
                      </Alert>
                    )}
                  </Stack>
                ) : (
                  <Typography>
                    Payment Method : {PolicyData?.paymentMethodDetails}
                  </Typography>
                )}
              </Grid> */}

              <Grid item xs={6}>
                <Alert variant="outlined" severity="info">
                  No banking details options for -{" "}
                  {PolicyData?.paymentMethodDetails?.name}
                </Alert>
              </Grid>
            </Grid>
          )}
          {RMAPolicyDetails.isSuccess &&
            PolicyOrgMembersGet.isSuccess &&
            PolicyData &&
            PolicyMembers &&
            PolicyMembers.length > 0 && (
              <>
                <EditFormMain
                  noEdit={true}
                  PolicyData={PolicyData}
                  benefits={benefits}
                  differences={differences}
                  PolicyMembers={PolicyMembers}
                  setPolicyMembers={setPolicyMembers}
                  insuredLifeRemovalReason={insuredLifeRemovalReason}
                />

                <TotalPremium
                  ParentPolicy={ParentPolicy}
                  premiumTotal={premiumTotal}
                  setPremiumTotal={setPremiumTotal}
                  setTotal={setTotal}
                  total={total}
                  setPolicyMembers={setPolicyMembers}
                  PolicyMembers={PolicyMembers}
                  setPolicyData={setPolicyData}
                  PolicyData={PolicyData}
                  europAssist={europAssistFee}
                  isPremiumFetched={isPremiumFetched}
                  setIsPremiumFetched={setIsPremiumFetched}
                />
              </>
            )}

          {exceptions && exceptions?.length > 0 && (
            <>
              {exceptions?.map(
                (exception, index) =>
                  exception && (
                    <Card variant="outlined" key={index} sx={{ my: 0, p: 1 }}>
                      <Stack direction="row">
                        {exception?.FirstName} {exception?.Surname} has
                        {exception.exceptions.length} exceptions
                      </Stack>
                      {exception.exceptions?.map(
                        (excep, index) =>
                          excep && (
                            <Alert
                              action={
                                <Button
                                  onClick={() =>
                                    deleteException(exception.RolePlayerId)
                                  }
                                  color="inherit"
                                  size="small"
                                >
                                  Delete
                                </Button>
                              }
                              variant="outlined"
                              sx={{ my: 0, py: 0 }}
                              severity="error"
                              key={index}
                            >
                              <Stack>
                                <Typography>{excep?.field}</Typography>
                                <Typography>{excep?.message}</Typography>
                              </Stack>
                            </Alert>
                          ),
                      )}
                    </Card>
                  ),
              )}
            </>
          )}

          <Card sx={{ mt: 2, p: 0, border: 1 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              justifyContent="space-between"
              sx={{ p: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <SaveIcon color="inherit" />
                <Typography variant="body2" color="GrayText">
                  Save
                </Typography>
                <Typography variant="body2" color="GrayText">
                  Last Save{" "}
                  {dayjs(request?.updatedAt).format("DD-MM-YYYY:HH-mm")} -
                  Request status - {request?.requestStatus} -{" "}
                  {request?.requestStatusNote}
                </Typography>
              </Stack>
              {request.approverId ? (
                <Stack spacing={1} direction="row" alignItems="center">
                  <PersonIcon variant="body2" color="GrayText" />
                  <Typography variant="body2" color="GrayText">
                    Approver
                  </Typography>
                  <Typography variant="body2" color="GrayText">
                    -
                  </Typography>
                  <Typography variant="body2" color="GrayText">
                    {request.approverId}
                  </Typography>
                </Stack>
              ) : (
                ""
              )}
            </Stack>
            <Divider />
            <Stack
              direction="row"
              spacing={2}
              sx={{
                p: 2,
              }}
            >
              {request?.requestStatus === "Edit" && (
                <>
                  <Alert severity="info">
                    This Policy is currently being edited
                  </Alert>
                </>
              )}
              {request?.requestStatus === "Rejected" && (
                <>
                  <Alert severity="error">
                    This Policy has been rejected - {request?.requestStatusNote}
                  </Alert>
                </>
              )}
              {request?.requestStatus === "Approved" && (
                <>
                  <Alert severity="success">
                    This Policy has been approved
                  </Alert>
                  <RejectEdit RejectEditFunction={RejectEditFunction} />
                </>
              )}

              {request?.requestStatus === "Submitted" && (
                <>
                  {UpdateEditRequest.isLoading ? (
                    <LinearProgress />
                  ) : (
                    <>
                      <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        onClick={handleConfirmOpen}
                        color="success"
                      >
                        Accept Edits
                      </Button>
                      <RejectEdit RejectEditFunction={RejectEditFunction}>
                        reject Edits
                      </RejectEdit>
                      <Dialog open={openConfirm} onClose={handleConfirmClose}>
                        <DialogTitle>Confirm Update</DialogTitle>
                        <DialogContent>
                          Are you sure you want to accept this update request?
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleConfirmClose} color="primary">
                            No
                          </Button>
                          <Button
                            onClick={handleConfirm}
                            color="primary"
                            variant="contained"
                            disabled={isConfirmLoading}
                          >
                            {isConfirmLoading ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : (
                              "Yes"
                            )}
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </>
                  )}
                </>
              )}
            </Stack>
          </Card>
          {/* <AdditionalTabs
            policyId={PolicyData.PolicyId}
            policyNumber={PolicyData.PolicyNumber}
          /> */}

          {PolicyOrgMembersGet.isSuccess &&
            PolicyMembersOrg &&
            PolicyMembersOrg.length > 0 && (
              <ClaimChecker
                PolicyMembersOrg={PolicyMembersOrg}
                setCanEdit={setCanEdit}
                rolePlayerList={
                  PolicyMembersOrg &&
                  PolicyMembersOrg.length > 0 &&
                  PolicyMembersOrg.map((member) => {
                    return member.RolePlayerId;
                  })
                }
              />
            )}
        </>
      )}

      <AlertPopup
        open={UpdateEditRequest.isSuccess}
        severity="success"
        message="Policy Updated Successfully"
      />

      <AlertPopup
        open={UpdateEditRequest.isError}
        severity="error"
        message={
          UpdateEditRequest?.error?.response?.data?.message ||
          "Error Updating Policy"
        }
      />

      <AlertPopup
        open={!!isOperationError}
        severity="error"
        message={isOperationError}
        onClose={() => setIsOperationError(null)}
      />
    </div>
  );
};

export default PolicyEditPage;