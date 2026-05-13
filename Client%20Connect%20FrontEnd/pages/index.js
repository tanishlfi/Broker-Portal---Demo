import React, { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import UserCards from "components/Dashboards/UserCards";
import useToken from "hooks/useToken";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { LinearProgress, Grid, Typography } from "@mui/material";
import { useRouter } from 'next/router';
import FeatureCardGrid from '../components/Containers/FeatureCardGrid'

const Home = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const tokenData = useToken();
  const accessToken = tokenData?.accessToken;
  const decodedToken = tokenData?.decoded;

  // Use roles from either the session user OR the decoded access token
  const roles = user?.rmaAppRoles || decodedToken?.rmaAppRoles || [];

  // Helper to normalize role strings for comparison (case-insensitive, removes spaces and dashes)
  const normalizeRole = (role) => role ? role.toLowerCase().replace(/[\s-]/g, "") : "";

  const BrokerId =
    user?.rmaAppUserMetadata?.BrokerageIds?.length > 0 &&
    user?.rmaAppUserMetadata?.BrokerageIds[0];

  // ClientConnect roles that bypass the portal selection screen
  const clientConnectRoles = [
    "CDA-RMA-Policy Admin",
    "CDA-RMA-User Admin",
    "CDA-BROKERAGE-Broker Manager",
    "CDA-SCHEME-Scheme Representative",
    "new-Broker-onboarding-user"
  ];

  useEffect(() => {
    if (!isLoading && user) {
      const normalizedRoles = roles.map(normalizeRole);
      const isAdm = normalizedRoles.includes("administrator");

      // If user is an Administrator, they should always see the tiles, so we don't redirect them.
      if (isAdm) return;

      // Redirecting to Broker Portal if he has BP_Broker_Rep role
      const isBrokerRep = normalizedRoles.includes(normalizeRole("BP_BROKER_REP")) || 
                          normalizedRoles.includes(normalizeRole("BP_REP"));
      
      if (isBrokerRep) {
        console.log("Redirecting Broker Rep to /brokerPortal/dashboard");
        router.push('/brokerPortal/dashboard');
        return;
      }

      // Redirecting to Client Connect roles if has CC Roles
      const normalizedCCRoles = clientConnectRoles.map(normalizeRole);
      if (normalizedRoles.some(r => normalizedCCRoles.includes(r))) {
        console.log("Redirecting Client Connect user to /Dashboard");
        router.push('/Dashboard');
        return;
      }
    }
  }, [user, isLoading, roles, router, clientConnectRoles]);

  if (isLoading) {
    return <LinearProgress />;
  }

  const normalizedRoles = roles.map(normalizeRole);
  const isAdministrator = normalizedRoles.includes("administrator");
  
  console.log("Diagnostic - Roles in Token:", roles);
  console.log("Diagnostic - Normalized Roles:", normalizedRoles);
  console.log("Diagnostic - isAdministrator:", isAdministrator);

  const normalizedCCRoles = clientConnectRoles.map(normalizeRole);
  const hasCCRole = normalizedRoles.some(r => normalizedCCRoles.includes(r));
  const isBrokerRep = normalizedRoles.includes(normalizeRole("BP_BROKER_REP"));

  //Not Rendering Portal Selection Cards
  // if (isBrokerRep || hasCCRole) {
  //     return <LinearProgress />;
  // }

  /**  Show Portal Selection only for users with Administrator Role Without
  Client Connect or Broker Portal Roles */

  if (isAdministrator) {
    const portalCards = [
      {
        title: "Client Connect",
        link: "/Dashboard",
        Icon: PeopleOutlineIcon,
      },
      {
        title: "Broker Portal",
        // link: process.env.NEXT_PUBLIC_BROKER_PORTAL_URL || "http://localhost:3000",
        link: "/brokerPortal/dashboard",
        Icon: DomainAddIcon,
        external: true,
      },
      {
        title: "Admin Portal",
        link: "www.google.com",
        Icon: ManageAccountsIcon,
      },
    ];

    //Existing Flow
    return (
      <div>
        <Grid sx={{ my: 2 }}>
          <Typography variant="h6" align="left">
            Select Portal
          </Typography>
        </Grid>
        <FeatureCardGrid cards={portalCards} accessToken={accessToken} brokerId={BrokerId} />
      </div>
    );
  }
  return (
    <LinearProgress />
  )
}

export default Home;