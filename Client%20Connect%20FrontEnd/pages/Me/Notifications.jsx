import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Alert,
  AlertTitle,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import PageHeader from "components/Bits/PageHeader";
import useToken from "hooks/useToken";
import { useRouter } from "next/router";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { nodeSa } from "src/AxiosParams";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { DataGridPremium } from "@mui/x-data-grid-premium";

const Notifications = () => {
  const accessToken = useToken();
  const router = useRouter();
  const { user } = useUser();
  const [notificationsData, setNotificationsData] = React.useState([]);
  const notificationsRequest = useQuery(
    `notifications${user?.email}`,
    () =>
      axios.get(`${nodeSa}/notifications/${user?.email}?read=false`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      refetchInterval: 10000,
      enabled: !!accessToken && !!user?.email,
      onSuccess: (data) => {
        setNotificationsData(data.data.data);
      },
    }
  );

  const clearNotifications = useMutation("notifications", (id) => {
    axios.get(`${nodeSa}/notifications/read/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  });

  const clearNotification = async (id) => {
    await clearNotifications.mutateAsync(id, {
      onSuccess: () => {
        notificationsRequest.refetch();
        setNotificationsData(
          notificationsData.filter((note) => note.id !== id)
        );
      },
    });
  };

  return (
    <div>
      <PageHeader title="Notifications" description="View your notifications" />

      {notificationsRequest.isLoading && <LinearProgress />}

      <Grid container justifyContent="center">
        {notificationsData && notificationsData.length > 0 ? (
          notificationsData
            .filter((note) => note.read !== true)
            .map((note, index) => {
              return (
                <Grid item xl={12} md={12} sm={12} xs={12} key={note.id}>
                  <Alert
                    sx={{ width: "100%", m: 0 }}
                    severity={note.type}
                    action={
                      <Button
                        onClick={() => clearNotification(note.id)}
                        color="inherit"
                        variant="outlined"
                        endIcon={<DeleteTwoToneIcon />}
                        size="large">
                        Clear
                      </Button>
                    }>
                    <AlertTitle>{note?.title}</AlertTitle>
                    <Stack spacing={2}>
                      <Typography variant="body2">{note.message}</Typography>
                      <Typography variant="body2">
                        {`${new Date(note?.createdAt).toLocaleDateString(
                          "en-ZA"
                        )} ${new Date(note?.createdAt).toLocaleTimeString(
                          "en-ZA"
                        )}  `}
                      </Typography>
                      {note.link && (
                        <Button
                          onClick={() => {
                            clearNotification(note.id);
                            router.push(`${note.link}`);
                          }}>
                          {note.link}
                        </Button>
                      )}
                    </Stack>
                  </Alert>
                </Grid>
              );
            })
        ) : (
          <div>
            <Alert severity="info">No New Notifications</Alert>
          </div>
        )}

        <Grid sx={{ mt: 2 }} container justifyContent="center">
          {notificationsData.filter((note) => note.read !== false) && (
            <DataGridPremium
              autoHeight
              getRowId={(row) => row.id}
              initialState={{
                ...notificationsData?.filter((note) => note.read !== false),
                sorting: {
                  ...notificationsData?.filter((note) => note.read !== false)
                    .createdAt,
                  sortModel: [
                    {
                      field: "createdAt",
                      sort: "desc",
                    },
                  ],
                },
              }}
              rows={notificationsData?.filter((note) => note.read !== false)}
              columns={[
                {
                  field: "link",
                  headerName: "Link",
                  width: 100,

                  renderCell: (params) => (
                    <Button
                      onClick={() => {
                        router.push(`${params.row.link}`);
                      }}>
                      View
                    </Button>
                  ),
                },
                { field: "title", headerName: "Title", width: 200 },
                { field: "message", headerName: "Message", width: 350 },

                {
                  field: "type",
                  headerName: "Type",
                  width: 130,

                  renderCell: (params) => (
                    <Chip
                      variant="outlined"
                      label={params.row.type}
                      color={params.row.type}
                    />
                  ),
                },
                {
                  field: "createdAt",
                  headerName: "Created At",
                  width: 200,
                  renderCell: (params) => (
                    <Typography variant="body2">
                      {`${new Date(params.row?.createdAt).toLocaleDateString(
                        "en-ZA"
                      )} ${new Date(params.row?.createdAt).toLocaleTimeString(
                        "en-ZA"
                      )}  `}
                    </Typography>
                  ),
                },
                { field: "read", headerName: "Read", width: 130 },
              ]}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Notifications;
