import {
  Drawer,
  Toolbar,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import HomeSharpIcon from "@mui/icons-material/HomeSharp";
import React from "react";
import { useRouter } from "next/router";
import PeopleSharpIcon from "@mui/icons-material/PeopleSharp";
import { useUser } from "@auth0/nextjs-auth0/client";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PeopleIcon from "@mui/icons-material/People";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import HandshakeTwoToneIcon from "@mui/icons-material/HandshakeTwoTone";
// import PersonPinIcon from "@mui/icons-material/PersonPin";
import DomainAddIcon from "@mui/icons-material/DomainAdd";

import EditNoteTwoToneIcon from "@mui/icons-material/EditNoteTwoTone";
import DriveFileRenameOutlineTwoToneIcon from "@mui/icons-material/DriveFileRenameOutlineTwoTone";

import HandshakeIcon from "@mui/icons-material/Handshake";
import AddTaskIcon from "@mui/icons-material/AddTask";
import GradingTwoToneIcon from "@mui/icons-material/GradingTwoTone";
import RuleTwoToneIcon from "@mui/icons-material/RuleTwoTone";
import SchemaTwoToneIcon from "@mui/icons-material/SchemaTwoTone";

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import InventoryIcon from "@mui/icons-material/Inventory";
import ApprovalIcon from "@mui/icons-material/Approval";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import styled from "@emotion/styled";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "@emotion/react";
import useToken from "../../hooks/useToken";
import RuleFolderIcon from "@mui/icons-material/RuleFolder";

const Drawers = (props) => {
  const { window, mobileOpen, handleDrawerToggle, open, setOpen, drawerWidth } =
    props;

  const router = useRouter();

  const theme = useTheme();

  const accessToken = useToken();

  const { user } = useUser();

  const BrokerId =
    user?.rmaAppUserMetadata?.BrokerageIds?.length > 0 &&
    user?.rmaAppUserMetadata?.BrokerageIds[0];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const UserView = ({ role }) => {
    const CurrentView = {
      "CDA-RMA-Policy Admin": (
        <>
          <DrawerItem Icon={HomeSharpIcon} title="Home" link="/" />
          <DrawerItem
            Icon={HandshakeTwoToneIcon}
            title="Brokers"
            link="/Brokers"
          />
          <DrawerItem
            title="Search For Policy"
            link={`/Administration/SearchPolicy`}
            Icon={ManageSearchIcon}
          />
          <DrawerItem
            title="Edit Existing Policy"
            link={`/Administration/EditPolicy`}
            Icon={EditNoteTwoToneIcon}
          />
          <DrawerItem
            title="My Edits"
            link={`/Administration/MyEdits`}
            Icon={DriveFileRenameOutlineTwoToneIcon}
          />
          <DrawerItem
            title="My Approvals - Edits"
            link={`/Administration/MyApprovals`}
            Icon={RuleTwoToneIcon}
          />

          <DrawerItem
            title="All Edits"
            link={`/Administration/Policies`}
            Icon={GradingTwoToneIcon}
          />
          {/* <DrawerItem
            title="Edit Existing Policy"
            link={`/Administration/EditPolicy`}
            Icon={EditNoteTwoToneIcon}
          />
          <DrawerItem
            title="My Edits"
            link={`/Administration/MyEdits`}
            Icon={DriveFileRenameOutlineTwoToneIcon}
          />

          <DrawerItem
            title="Allocated Edits"
            link={`/Administration/AllocatedPolicies`}
            Icon={RuleTwoToneIcon}
          />

          <DrawerItem
            title="All Edits"
            link={`/Administration/Policies`}
            Icon={GradingTwoToneIcon}
          /> */}

          {/* <DrawerItem
            Icon={HandshakeIcon}
            title="Create New Brokerage"
            link="/NewBrokerOnboarding"
          /> */}
          <Divider />
          <DrawerItem
            title="Create new Policy"
            link={`/Onboarding/CreatePolicy`}
            Icon={AddBoxIcon}
          />
          <DrawerItem
            Icon={PersonAddAltIcon}
            title="My Policies"
            link={`/Onboarding/MyPolicies`}
          />
          <DrawerItem
            title="My Approvals"
            link={`/Onboarding/AllocatedPolicies`}
            Icon={AssignmentIndIcon}
          />
          <DrawerItem
            Icon={ContentPasteSearchIcon}
            title="File Upload"
            link={`/Onboarding/FileUpload`}
          />
          <DrawerItem
            title="My Files"
            link={`/Onboarding/MyFiles`}
            Icon={InventoryIcon}
          />
          <DrawerItem
            Icon={ApprovalIcon}
            title="File Approvals"
            link={`/Onboarding/FileApprovals`}
          />
          <DrawerItem
            title="All Files"
            link={`/Onboarding/AllFiles`}
            Icon={FileCopyIcon}
          />

          <DrawerItem
            title="All Policies"
            link={`/Onboarding/Policies`}
            Icon={PeopleOutlineIcon}
          />
          <DrawerItem
            title="Reports"
            link={`/Onboarding/Reports`}
            Icon={QueryStatsIcon}
          />
          <Divider />

          {/* <DrawerItem Icon={AddTaskIcon} title="Tasks" link="/Tasks" /> */}

          <DrawerItem Icon={FactCheckIcon} title="VOPD" link="/VOPD" />
        </>
      ),
      "CDA-RMA-User Admin": (
        <>
          <DrawerItem Icon={HomeSharpIcon} title="Home" link="/" />
          <DrawerItem
            Icon={HandshakeTwoToneIcon}
            title="Brokers"
            link="/Brokers"
          />
          <DrawerItem
            title="Search For Policy"
            link={`/Administration/SearchPolicy`}
            Icon={ManageSearchIcon}
          />
          <DrawerItem
            title="Edit Existing Policy"
            link={`/Administration/EditPolicy`}
            Icon={EditNoteTwoToneIcon}
          />
          <DrawerItem
            title="My Edits"
            link={`/Administration/MyEdits`}
            Icon={DriveFileRenameOutlineTwoToneIcon}
          />
          <DrawerItem
            title="My Approvals - Edits"
            link={`/Administration/MyApprovals`}
            Icon={RuleTwoToneIcon}
          />

          <DrawerItem
            title="All Edits"
            link={`/Administration/Policies`}
            Icon={GradingTwoToneIcon}
          />
          {/* <DrawerItem
            Icon={HandshakeIcon}
            title="Create New Brokerage"
            link="/NewBrokerOnboarding"
          /> */}
          <Divider />
          <DrawerItem
            title="Create new Policy"
            link={`/Onboarding/CreatePolicy`}
            Icon={AddBoxIcon}
          />
          <DrawerItem
            Icon={PersonAddAltIcon}
            title="My Policies"
            link={`/Onboarding/MyPolicies`}
          />

          <DrawerItem
            title="My Approvals"
            link={`/Onboarding/AllocatedPolicies`}
            Icon={AssignmentIndIcon}
          />
          <DrawerItem
            Icon={ContentPasteSearchIcon}
            title="File Upload"
            link={`/Onboarding/FileUpload`}
          />
          <DrawerItem
            title="My Files"
            link={`/Onboarding/MyFiles`}
            Icon={InventoryIcon}
          />
          <DrawerItem
            title="Broker Files"
            link={`/Onboarding/BrokerFiles`}
            Icon={RuleFolderIcon}
          />
          <DrawerItem
            title="File Approvals"
            link={`/Onboarding/FileApprovals`}
            Icon={ApprovalIcon}
          />
          <DrawerItem
            title="All Files"
            link={`/Onboarding/AllFiles`}
            Icon={FileCopyIcon}
          />

          <DrawerItem
            title="All Policies"
            link={`/Onboarding/Policies`}
            Icon={PeopleOutlineIcon}
          />
          <Divider />
          <DrawerItem
            title="New Schemes"
            link={`/SchemeOnboarding/NewSchemeList`}
            Icon={SchemaTwoToneIcon}
          />
          <DrawerItem
            title="Broker Onboarding"
            link={`/NewBrokerOnboarding`}
            Icon={DomainAddIcon}
          />
          <Divider />
          <DrawerItem
            Icon={AddTaskIcon}
            title="Tasks Manager"
            link="/TasksManager"
          />

          <DrawerItem Icon={FactCheckIcon} title="VOPD" link="/VOPD" />
          <DrawerItem
            Icon={ManageAccountsIcon}
            title="Manage Users"
            link={`/Users`}
          />
        </>
      ),

      "CDA-BROKERAGE-Broker Manager": (
        <>
          <DrawerItem Icon={HomeSharpIcon} title="Home" link="/" />
          <DrawerItem
            title="Create new Policy"
            link={`/Onboarding/CreatePolicy/${BrokerId}`}
            Icon={AddBoxIcon}
          />
          <DrawerItem
            title="File Upload"
            link={`/Onboarding/FileUpload/${BrokerId}`}
            Icon={ContentPasteSearchIcon}
          />

          <DrawerItem
            title="My Policies"
            link={`/Onboarding/MyPolicies`}
            Icon={PersonAddAltIcon}
          />

          <DrawerItem
            title="All Policies"
            link={`/Onboarding/Policies`}
            Icon={PeopleOutlineIcon}
          />

          {/* <DrawerItem
            title="Schemes"
            link={`/BrokerManager/SchemaManagement/${BrokerId}`}
            Icon={AccountTreeIcon}
          /> */}

          {/* <DrawerItem
            disabled
            title="Representative"
            link={`/BrokerManager/Representative/${BrokerId}`}
            Icon={PersonPinIcon}
          />

          <DrawerItem
            title="Edited Policies"
            link={`/BrokerManager/EditedPolicies/${BrokerId}`}
            Icon={ManageAccountsIcon}
          /> */}
          <DrawerItem
            title="Manage Users"
            link={`/BrokerManager/UserManagement/${BrokerId}`}
            Icon={PeopleIcon}
          />
        </>
      ),

      "CDA-BROKERAGE-Broker Representative": (
        <>
          <DrawerItem Icon={HomeSharpIcon} title="Home" link="/" />
          <DrawerItem
            title="Schemes"
            link={`/BrokerManager/SchemaManagement/${BrokerId}`}
            Icon={AccountTreeIcon}
          />
          <DrawerItem
            title="Search For Policy"
            link={`/Administration/SearchPolicy`}
            Icon={ManageSearchIcon}
          />
          <Divider />
          <DrawerItem
            title="Create new Policy"
            link={`/Onboarding/CreatePolicy/${BrokerId}`}
            Icon={AddBoxIcon}
          />
          <DrawerItem
            title="My Policies"
            link={`/Onboarding/MyPolicies`}
            Icon={PersonAddAltIcon}
          />
          <DrawerItem
            title="File Upload"
            link={`/Onboarding/FileUpload/${BrokerId}`}
            Icon={ContentPasteSearchIcon}
          />
          <DrawerItem
            title="My Files"
            link={`/Onboarding/MyFiles`}
            Icon={InventoryIcon}
          />
          <DrawerItem
            title="All Files"
            link={`/Onboarding/AllFiles`}
            Icon={FileCopyIcon}
          />
          <DrawerItem
            title="All Policies"
            link={`/Onboarding/Policies`}
            Icon={PeopleOutlineIcon}
          />

          {/* <DrawerItem
            title="Schemes"
            link={`/BrokerManager/SchemaManagement/${BrokerId}`}
            Icon={AccountTreeIcon}
          /> */}

          {/* <DrawerItem
            disabled
            title="Representative"
            link={`/BrokerManager/Representative/${BrokerId}`}
            Icon={PersonPinIcon}
          />

          <DrawerItem
            title="Edited Policies"
            link={`/BrokerManager/EditedPolicies/${BrokerId}`}
            Icon={ManageAccountsIcon}
          /> */}
        </>
      ),

      "CDA-SCHEME-Scheme Representative": (
        <>
          <DrawerItem Icon={HomeSharpIcon} title="Home" link="/" />
          <DrawerItem
            title="Create new Policy"
            link={`/SchemeUser/CreatePolicy`}
            Icon={AddBoxIcon}
          />

          <DrawerItem
            title="My Schemes"
            link={`/SchemeUser/Schemes`}
            Icon={AccountTreeIcon}
          />

          <DrawerItem
            title="Created Policies"
            link={`/SchemeUser/CreatedPolicies`}
            Icon={PersonAddAltIcon}
          />
        </>
      ),
    }[role];
    return <>{CurrentView}</>;
  };

  const drawer = (
    <div>
      <Divider />
      <Stack>{UserView({ role: user?.rmaAppRoles[0] })}</Stack>
    </div>
  );
  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader
        sx={{
          border: "1px solid green",
        }}
      >
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>

      <List
        sx={{
          my: 0,
          py: 0,
        }}
      >
        {drawer}
      </List>
    </Drawer>

    // <Box
    //   component="nav"
    //   sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    //   aria-label="mailbox folders"
    // >
    //   {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
    //   <Drawer
    //     container={container}
    //     variant="temporary"
    //     open={mobileOpen}
    //     onClose={handleDrawerToggle}
    //     ModalProps={{
    //       keepMounted: true, // Better open performance on mobile.
    //     }}
    //     sx={{
    //       display: { xs: "block", sm: "none" },
    //       "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
    //     }}
    //   >
    //     {drawer}
    //   </Drawer>
    //   <Drawer
    //     variant="permanent"
    //     sx={{
    //       display: { xs: "none", sm: "block" },
    //       "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
    //     }}
    //     open
    //   >
    //     {drawer}
    //   </Drawer>
    // </Box>
  );
};

export default Drawers;

const DrawerItem = ({ Icon, title, link, disabled }) => {
  const router = useRouter();

  return (
    <ListItem disablePadding>
      <ListItemButton
        sx={{
          borderRadius: 0,

          color: router.pathname === link ? "primary.main" : "inherit",

          bgcolor:
            router.pathname === link
              ? "background.default"
              : "background.paper",
        }}
        onClick={() => router.push(link)}
      >
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText secondary={title} />
      </ListItemButton>
    </ListItem>

    // <Tooltip title={title} arrow placement="right">
    //   <span>
    //     <IconButton
    //       disabled={disabled}
    //       sx={{
    //         borderRadius: 0,

    //         color: router.pathname === link ? "primary.main" : "inherit",

    //         bgcolor:
    //           router.pathname === link
    //             ? "background.default"
    //             : "background.paper",
    //       }}
    //       onClick={() => router.push(link)}>
    //       <Icon /> {title}
    //     </IconButton>
    //   </span>
    // </Tooltip>
  );
};

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));
