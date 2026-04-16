import * as React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
// import Copyright from "../../src/Copyright";
import Drawers from "./Drawers";
import {
  Button,
  IconButton,
  Link,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Image from "next/image";
// import logo from "../../assets/RMA-Logo_Full.png";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import NotificationsMenuIcon from "./Notifications/NotificationsMenuIcon";

const drawerWidth = "15%";

export default function AppNavBar({ children, setThemeState, themeState }) {
  const router = useRouter();

  const { user, isLoading } = useUser();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleTheme = () => {
    setThemeState(!themeState);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "background.paper",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>

          <Link
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Image
              priority
              src={
                "https://www.randmutual.co.za/Portals/0/RMA-Logo_Full.png?ver=2020-06-30-111022-350"
              }
              alt="Logo"
              width={100}
              height={50}
            />
          </Link>

          <Box sx={{ mx: "auto" }}>
            {["test", "uat", "development"].includes(
              process.env.NEXT_PUBLIC_NODE_ENV,
            ) && (
              <Box sx={{ width: "100%" }}>
                <Alert severity="warning">
                  Please note this is NOT the live environment. For live
                  environment, please visit{" "}
                  <Link
                    href="https://clientconnect.randmutual.co.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "inherit", textDecoration: "underline" }}
                  >
                    ClientConnect
                  </Link>
                </Alert>
              </Box>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {
              // show username if logged in and vertical align of appbar
              user && (
                <Typography
                  noWrap
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: themeState ? "inherit" : "#616161",
                  }}>
                  {`Current User: ${user.name}`}
                </Typography>
              )
            }

            {!isLoading && user && (
              <NotificationsMenuIcon themeState={themeState} />
            )}

            <Tooltip
              title={!themeState ? "Dark Mode" : "Light Mode"}
              aria-label="add">
              <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
                {themeState ? (
                  <Brightness7Icon color="inherit" />
                ) : (
                  <Brightness4Icon sx={{ color: "#616161" }} />
                )}
              </IconButton>
            </Tooltip>
            {user && (
              <>
                <Button onClick={() => router.push("/api/auth/logout")}>
                  logout
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      {user && (
        <Drawers
          drawerWidth={drawerWidth}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
