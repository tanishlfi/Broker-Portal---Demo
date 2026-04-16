import { useUser } from "@auth0/nextjs-auth0/client";
import { Card, Grid, LinearProgress, Typography } from "@mui/material";

import FeatureCard from "components/Containers/FeatureCard";

import React from "react";

// Icons imports
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HandshakeTwoToneIcon from "@mui/icons-material/HandshakeTwoTone";
// import PersonPinIcon from "@mui/icons-material/PersonPin";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PeopleIcon from "@mui/icons-material/People";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EditNoteTwoToneIcon from "@mui/icons-material/EditNoteTwoTone";
import DriveFileRenameOutlineTwoToneIcon from "@mui/icons-material/DriveFileRenameOutlineTwoTone";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PageHeader from "components/Bits/PageHeader";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AddTaskIcon from "@mui/icons-material/AddTask";
import GradingTwoToneIcon from "@mui/icons-material/GradingTwoTone";
import RuleTwoToneIcon from "@mui/icons-material/RuleTwoTone";
import SchemaTwoToneIcon from "@mui/icons-material/SchemaTwoTone";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import InventoryIcon from "@mui/icons-material/Inventory";
import ApprovalIcon from "@mui/icons-material/Approval";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import RuleFolderIcon from "@mui/icons-material/RuleFolder";

const UserCards = () => {
  const { user, isLoading } = useUser();

  const role = user?.rmaAppRoles[0];
  const BrokerId =
    user?.rmaAppUserMetadata?.BrokerageIds?.length > 0 &&
    user?.rmaAppUserMetadata?.BrokerageIds[0];

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <div>
      {/* <PageHeader
        title="RML Client Connect"
        subTitle={`Welcome ${user?.nickname}! You are logged in as ${user?.email}`}
        noBack
        breadcrumbs={[
          {
            text: "Home",
            link: "/",
          },
        ]}
      /> */}
      {BrokerId && role && (
        <>
          <BrokerManager BrokerId={BrokerId} role={role} />
          <BrokerNormalUser BrokerId={BrokerId} role={role} />
        </>
      )}
      <RmaPolicyAdministrator BrokerId={BrokerId} role={role} />
      <RMAUserAdministrator BrokerId={BrokerId} role={role} />
    </div>
  );
};

export default UserCards;

const FeatureCardGrid = ({ cards }) => (
  <Grid container>
    {cards.map(({ title, link, Icon }, index) => (
      <Grid item xs={4} md={4} lg={3} xl={2} key={index}>
        <FeatureCard title={title} link={link} Icon={Icon} />
      </Grid>
    ))}
  </Grid>
);

const RmaPolicyAdministrator = ({ BrokerId, role }) => {
  if (role !== "CDA-RMA-Policy Admin") return null;

  const adminCardsLine1 = [
    { title: "Brokers", link: "/Brokers", Icon: HandshakeTwoToneIcon },
    {
      title: "Search For Policy",
      link: "/Administration/SearchPolicy",
      Icon: ManageSearchIcon,
    },
    {
      title: "Edit Existing Policy",
      link: "/Administration/EditPolicy",
      Icon: EditNoteTwoToneIcon,
    },
  ];

  const adminCardsLine2 = [
    {
      title: "My Edits",
      link: "/Administration/MyEdits",
      Icon: DriveFileRenameOutlineTwoToneIcon,
    },
    {
      title: "My Approvals - Edits",
      link: "/Administration/MyApprovals",
      Icon: RuleTwoToneIcon,
    },
    {
      title: "All Edits",
      link: `/Administration/Policies`,
      Icon: GradingTwoToneIcon,
    },
  ];

  const onboardingCards = [
    {
      title: "Create new Policy",
      link: "/Onboarding/CreatePolicy",
      Icon: AddBoxIcon,
    },
    {
      title: "My Policies",
      link: "/Onboarding/MyPolicies",
      Icon: PersonAddAltIcon,
    },
    {
      title: "My Approvals",
      link: "/Onboarding/AllocatedPolicies",
      Icon: AssignmentIndIcon,
    },
    {
      title: "Broker Files",
      link: "/Onboarding/BrokerFiles",
      Icon: RuleFolderIcon,
    },
  ];

  const fileCards = [
    {
      title: "File Upload",
      link: "/Onboarding/FileUpload",
      Icon: ContentPasteSearchIcon,
    },
    { title: "My Files", link: "/Onboarding/MyFiles", Icon: InventoryIcon },
    {
      title: "File Approvals",
      link: "/Onboarding/FileApprovals",
      Icon: ApprovalIcon,
    },
    { title: "All Files", link: "/Onboarding/AllFiles", Icon: FileCopyIcon },
  ];

  const policyCards = [
    {
      title: "All Policies",
      link: "/Onboarding/Policies",
      Icon: PeopleOutlineIcon,
    },
    { title: "Reports", link: "/Onboarding/Reports", Icon: QueryStatsIcon },
  ];

  const toolsCards = [
    { title: "VOPD", link: "/VOPD", Icon: FactCheckIcon },
    { title: "Broker Portal", link: "/brokerPortal", Icon: DomainAddIcon },
  ];

  return (
    <Grid item xs={12}>
      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          Administration
        </Typography>
      </Grid>
      <FeatureCardGrid cards={adminCardsLine1} />
      <FeatureCardGrid cards={adminCardsLine2} />
      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          Onboarding Members
        </Typography>
      </Grid>
      <FeatureCardGrid cards={onboardingCards} />
      <FeatureCardGrid cards={fileCards} />
      <FeatureCardGrid cards={policyCards} />

      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          Tools and Settings
        </Typography>
      </Grid>
      <FeatureCardGrid cards={toolsCards} />
    </Grid>
  );
};

const RMAUserAdministrator = ({ BrokerId, role }) => {
  if (role !== "CDA-RMA-User Admin") return null;

  const adminCardsLine1 = [
    { title: "Brokers", link: "/Brokers", Icon: HandshakeTwoToneIcon },
    {
      title: "Search For Policy",
      link: "/Administration/SearchPolicy",
      Icon: ManageSearchIcon,
    },
    {
      title: "Edit Existing Policy",
      link: "/Administration/EditPolicy",
      Icon: EditNoteTwoToneIcon,
    },
  ];

  const adminCardsLine2 = [
    {
      title: "My Edits",
      link: "/Administration/MyEdits",
      Icon: DriveFileRenameOutlineTwoToneIcon,
    },
    {
      title: "My Approvals - Edits",
      link: "/Administration/MyApprovals",
      Icon: RuleTwoToneIcon,
    },
    {
      title: "All Edits",
      link: `/Administration/Policies`,
      Icon: GradingTwoToneIcon,
    },
  ];

  const onboardingCards = [
    {
      title: "Create new Policy",
      link: "/Onboarding/CreatePolicy",
      Icon: AddBoxIcon,
    },
    {
      title: "My Policies",
      link: "/Onboarding/MyPolicies",
      Icon: PersonAddAltIcon,
    },
    {
      title: "My Approvals",
      link: "/Onboarding/AllocatedPolicies",
      Icon: AssignmentIndIcon,
    },
    {
      title: "Broker Files",
      link: "/Onboarding/BrokerFiles",
      Icon: RuleFolderIcon,
    },
  ];

  const fileCards = [
    {
      title: "File Upload",
      link: "/Onboarding/FileUpload",
      Icon: ContentPasteSearchIcon,
    },
    { title: "My Files", link: "/Onboarding/MyFiles", Icon: InventoryIcon },
    {
      title: "File Approvals",
      link: "/Onboarding/FileApprovals",
      Icon: ApprovalIcon,
    },
    { title: "All Files", link: "/Onboarding/AllFiles", Icon: FileCopyIcon },
  ];

  const policyCards = [
    {
      title: "All Policies",
      link: "/Onboarding/Policies",
      Icon: PeopleOutlineIcon,
    },
    { title: "Reports", link: "/Onboarding/Reports", Icon: QueryStatsIcon },
  ];

  const toolsCards = [
    { title: "Tasks Manager", link: "/TasksManager", Icon: AddTaskIcon },
    { title: "VOPD", link: "/VOPD", Icon: FactCheckIcon },
    { title: "Manage All Users", link: "/Users", Icon: ManageAccountsIcon },
    { title: "Broker Portal", link: "/brokerPortal", Icon: DomainAddIcon },
  ];

  return (
    <Grid item xs={12}>
      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          Administration
        </Typography>
      </Grid>
      <FeatureCardGrid cards={adminCardsLine1} />
      <FeatureCardGrid cards={adminCardsLine2} />
      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          Onboarding Members
        </Typography>
      </Grid>
      <FeatureCardGrid cards={onboardingCards} />
      <FeatureCardGrid cards={fileCards} />
      <FeatureCardGrid cards={policyCards} />
      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          New Business Registration
        </Typography>
      </Grid>
      <FeatureCardGrid cards={toolsCards} />
    </Grid>
  );
};

const BrokerManager = ({ BrokerId, role }) => {
  if (
    role !== "CDA-SCHEME-Scheme Representative" &&
    role !== "new-Broker-onboarding-user" &&
    role !== "CDA-BROKERAGE-Broker Manager"
  )
    return null;

  const schemeCards = [
    {
      title: "Create new Policy",
      link: `/SchemeUser/Onboarding/CreatePolicy`,
      Icon: AddBoxIcon,
    },
    { title: "My Schemes", link: `/SchemeUser/Schemes`, Icon: AccountTreeIcon },
    {
      title: "Created Policies",
      link: `/SchemeUser/CreatedPolicies`,
      Icon: PersonAddAltIcon,
    },
  ];

  const onboardingCards = [
    {
      title: "Create new Policy",
      link: `/Onboarding/CreatePolicy/${BrokerId}`,
      Icon: AddBoxIcon,
    },
    {
      title: "File Upload",
      link: `/Onboarding/FileUpload/${BrokerId}`,
      Icon: ContentPasteSearchIcon,
    },
    {
      title: "My Policies",
      link: `/Onboarding/MyPolicies`,
      Icon: PersonAddAltIcon,
    },
    {
      title: "All Policies",
      link: `/Onboarding/Policies`,
      Icon: PeopleOutlineIcon,
    },
  ];

  const toolsCards = [
    {
      title: "Manage Users",
      link: `/BrokerManager/UserManagement/${BrokerId}`,
      Icon: PeopleIcon,
    },
    { title: "Broker Portal", link: "/brokerPortal", Icon: DomainAddIcon },
  ];

  return (
    <Grid item xs={12}>
      {role === "CDA-SCHEME-Scheme Representative" && (
        <FeatureCardGrid cards={schemeCards} />
      )}
      {role === "CDA-BROKERAGE-Broker Manager" && (
        <>
          <Grid sx={{ my: 2 }}>
            <Typography variant="h6" align="left">
              Onboarding
            </Typography>
          </Grid>
          <FeatureCardGrid cards={onboardingCards} />
          <Grid sx={{ my: 2 }}>
            <Typography variant="h6" align="left">
              Tools and Settings
            </Typography>
          </Grid>
          <FeatureCardGrid cards={toolsCards} />
        </>
      )}
      {role === "new-Broker-onboarding-user" && (
        <FeatureCard
          title="Create New Brokerage"
          disabled
          link={`/NewBrokerOnboarding/${user.sub}`}
          Icon={HandshakeIcon}
        />
      )}
    </Grid>
  );
};

const BrokerNormalUser = ({ BrokerId, role }) => {
  if (role !== "CDA-BROKERAGE-Broker Representative") return null;

  const adminCards = [
    {
      title: "Schemes",
      link: `Brokers/${BrokerId}/Schemes`,
      Icon: AccountTreeIcon,
    },
    {
      title: "Search For Policy",
      link: `/Administration/SearchPolicy`,
      Icon: ManageSearchIcon,
    },
    {
      title: "My Edits",
      link: `/Administration/MyEdits`,
      Icon: DriveFileRenameOutlineTwoToneIcon,
    },
  ];

  const onboardingCards = [
    {
      title: "Create new Policy",
      link: `/Onboarding/CreatePolicy/${BrokerId}`,
      Icon: AddBoxIcon,
    },
    {
      title: "My Policies",
      link: `/Onboarding/MyPolicies`,
      Icon: PersonAddAltIcon,
    },
    {
      title: "File Upload",
      link: `/Onboarding/FileUpload/${BrokerId}`,
      Icon: ContentPasteSearchIcon,
    },
    { title: "My Files", link: `/Onboarding/MyFiles`, Icon: InventoryIcon },
    { title: "All Files", link: `/Onboarding/AllFiles`, Icon: FileCopyIcon },
  ];

  const policyCards = [
    {
      title: "All Policies",
      link: `/Onboarding/Policies`,
      Icon: PeopleOutlineIcon,
    },
  ];

  return (
    <Grid item xs={12}>
      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          Administration
        </Typography>
      </Grid>
      <FeatureCardGrid cards={adminCards} />
      <Grid sx={{ my: 2 }}>
        <Typography variant="h6" align="left">
          Onboarding Members
        </Typography>
      </Grid>
      <FeatureCardGrid cards={onboardingCards} />
      <FeatureCardGrid cards={policyCards} />
    </Grid>
  );
};
