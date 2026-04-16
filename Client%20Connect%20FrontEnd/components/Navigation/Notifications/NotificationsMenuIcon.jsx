import {
  Alert,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardHeader,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useToken from "hooks/useToken";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { nodeSa } from "src/AxiosParams";
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";

const NotificationsMenuIcon = ({ themeState }) => {
  const accessToken = useToken();

  const router = useRouter();

  const { user } = useUser();

  const [notificationsData, setNotificationsData] = React.useState([]);

  const notifications = useQuery(
    "notifications",
    () =>
      axios.get(`${nodeSa}/notifications/${user.email}?read=true`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      refetchInterval: 50000,
      enabled: !!accessToken && !!user.email,
      onSuccess: (data) => {
        setNotificationsData(data.data.data);
      },
    },
  );

  const clearNotifications = useMutation("notifications", (id) => {
    axios.get(`${nodeSa}/notifications/read/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  });

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const notificationsPlural =
    notifications.data?.data?.data?.length > 1
      ? "notifications"
      : "notification";

  const clearNotification = async (id) => {
    await clearNotifications.mutateAsync(id, {
      onSuccess: () => {
        notifications.refetch();
        setNotificationsData(
          notificationsData.filter((note) => note.id !== id),
        );
      },
    });
  };

  return (
    <div>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge
            // className={
            //   notifications && notifications.length ? "animated bounce" : ""
            // }
            badgeContent={notificationsData?.length}
            color="error"
          >
            {themeState ? (
              <NotificationsIcon color="inherit" />
            ) : (
              <NotificationsIcon sx={{ color: "#616161" }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Card
          sx={{ bgcolor: "background.default", width: "100%", minWidth: 380 }}
        >
          <CardHeader
            sx={{ bgcolor: "background.paper" }}
            titleTypographyProps={{ color: "primary" }}
            title="Notifications"
            subheader={`You have ${
              notificationsData && notificationsData?.length
            } ${notificationsPlural}`}
            action={
              <Button
                onClick={() => {
                  notifications.refetch();
                }}
              >
                refresh
              </Button>
            }
          />

          {notificationsData &&
            notificationsData?.map((note, index) => {
              return (
                <div key={note.id}>
                  <Alert
                    sx={{ width: "100%", m: 0 }}
                    severity={note.type}
                    action={
                      <Button
                        onClick={() => clearNotification(note.id)}
                        color="inherit"
                        variant="outlined"
                        endIcon={<DeleteTwoToneIcon />}
                        size="large"
                      >
                        Clear
                      </Button>
                    }
                  >
                    <AlertTitle>{note?.title}</AlertTitle>
                    <Stack spacing={2}>
                      <Typography variant="body2">{note.message}</Typography>
                      <Typography variant="body2">
                        {`${new Date(note?.createdAt).toLocaleDateString(
                          "en-ZA",
                        )} ${new Date(note?.createdAt).toLocaleTimeString(
                          "en-ZA",
                        )}  `}
                      </Typography>
                      {note.link && (
                        <Button
                          onClick={() => {
                            clearNotification(note.id);
                            router.push(`${note.link}`);
                          }}
                        >
                          {note.link}
                        </Button>
                      )}
                    </Stack>
                  </Alert>
                </div>
              );
            })}

          <div>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Button
                fullWidth
                onClick={() => {
                  router.push(`/Me/Notifications`);
                }}
              >
                View All
              </Button>
            </Box>
          </div>
        </Card>
      </Popover>
    </div>
  );
};

export default NotificationsMenuIcon;
