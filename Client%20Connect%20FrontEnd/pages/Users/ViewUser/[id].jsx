import {
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";
import useToken from "hooks/useToken";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { nodeSa } from "src/AxiosParams";
import { useParams } from "next/navigation";
import PageHeader from "components/Bits/PageHeader";
import InfoCard from "components/User/InfoCard";
import ManageUserRole from "components/User/ManageUserRole";
import ManageUserConnections from "components/User/ManageUserConnections";
import { Button } from "@mui/material";
import BlockUnblockUser from "../_components/BlockUnblockUser";
import AlertPopup from "../../../components/Bits/AlertPopup";
import ManageUserPermissions from "@/components/User/ManageUserPermissions";
import ManageUserEnvironments from "@/components/User/ManageUserEnvironments";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function ViewUser() {
  const accessToken = useToken();
  const id = useParams()?.id;
  const { user } = useUser();
  const [checkRole, setCheckRole] = React.useState(false);
  const [checkModule, setCheckModule] = React.useState(false);

  // console.log("checkRole", checkRole);
  // console.log("checkModule", checkModule);

  // console.log("User Data:", user);

  React.useEffect(() => {
    const modules = user?.rmaAppUserMetadata?.Modules;

    if (Array.isArray(modules) && modules.length > 0) {
      const policyAdminEnabled = modules[0]?.PolicyAdministrator?.Enabled;
      // Check if the first module has PolicyAdministrator enabled
      setCheckRole(!!policyAdminEnabled);
      setCheckModule(true);
    } else {
      // If modules do not exist or are empty
      setCheckRole(false);
      setCheckModule(false);
    }
  }, [user]);

  const getUserById = useQuery(
    ["getUserById", id],
    async () => {
      let response = await axios.get(`/api/UserManagement/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data;
    },
    {
      enabled: !!accessToken,
      staleTime: 0,
    },
  );

  const disableUser = useMutation({
    mutationKey: ["disableUser"],
    mutationFn: async ({ id, blocked }) => {
      let response = await axios.post(
        `/api/UserManagement/DisableUser`,
        { id, blocked },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return response.data;
    },

    onSuccess: () => {
      getUserById.refetch();
    },
  });

  const handleDisableUser = ({ id, blocked }) => {
    disableUser.mutate({ id, blocked });
  };

  return (
    <Stack sx={{ pb: 20 }}>
      <PageHeader
        title="Manage User"
        subTitle="User"
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "User Management",
            href: `/Users`,
          },
          {
            title: "User",
            href: `/UserManagement/${id}`,
          },
        ]}
      />
      {getUserById?.isLoading ? (
        <>
          <Skeleton height={150} />
        </>
      ) : (
        <Grid container>
          <Grid item xs={12}>
            <Stack
              direction="row"
              justifyContent={"space-between"}
              sx={{ mb: 2 }}
            >
              {getUserById?.data?.data && getUserById?.data?.data?.blocked ? (
                <Chip
                  label="User Blocked from login"
                  color="error"
                  variant="outlined"
                />
              ) : (
                <Chip label="User active" color="info" variant="outlined" />
              )}
              <BlockUnblockUser
                user={getUserById?.data?.data}
                handleDisableUser={handleDisableUser}
              />
            </Stack>

            <InfoCard user={getUserById?.data?.data} />
          </Grid>

          {checkRole && checkModule && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <ManageUserPermissions user={getUserById?.data?.data} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <ManageUserEnvironments user={getUserById?.data?.data} />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />

            <ManageUserRole
              user={getUserById?.data?.data}
              userRole={getUserById?.data?.data?.roles?.[0]?.id}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <ManageUserConnections
              user={getUserById?.data?.data}
              userRole={getUserById?.data?.data?.roles?.[0]?.id}
            />
          </Grid>
        </Grid>
      )}
      <AlertPopup
        open={disableUser.isSuccess}
        severity="success"
        message="User blocked/unblocked successfully"
      />
    </Stack>
  );
}
