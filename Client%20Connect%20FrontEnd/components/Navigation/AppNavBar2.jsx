import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button, Link, Stack, Tooltip, Alert } from "@mui/material";
import NotificationsMenuIcon from "./Notifications/NotificationsMenuIcon";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Image from "next/image";
import Drawers from "./Drawers";
import { useRouter } from "next/router";

const drawerWidth = 280;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        },
      },
    ],
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

export default function AppNavBar2({ children, setThemeState, themeState }) {
  const theme = useTheme();

  const router = useRouter();

  const { user, isLoading } = useUser();

  const toggleTheme = () => {
    setThemeState(!themeState);
  };

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar color="default" position="fixed" open={open}>
        <Toolbar>
          {!isLoading && user && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={[
                {
                  mr: 2,
                },
                open && { display: "none" },
              ]}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Link
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              priority
              src={"https://www.randmutual.co.za/assets/images/logo.png"}
              alt="Logo"
              width={120}
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
                  }}
                >
                  {`Current User: ${user.name}`}
                </Typography>
              )
            }

            {!isLoading && user && (
              <NotificationsMenuIcon themeState={themeState} />
            )}

            <Tooltip
              title={!themeState ? "Dark Mode" : "Light Mode"}
              aria-label="add"
            >
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

      {!isLoading && user && (
        <Drawers open={open} setOpen={setOpen} drawerWidth={drawerWidth} />
      )}

      {/* <Drawer
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
        open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["All mail", "Trash", "Spam"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer> */}
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));
