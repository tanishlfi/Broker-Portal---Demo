import { Chip, CircularProgress } from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const GetRoleByRoleId = (accessToken, id) => {
  return axios.get(`${rmaAPI}/sec/api/Role/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const UserRoleChip = ({ id }) => {
  const accessToken = useToken();

  const role = useQuery(
    "roleByRoleId",
    () => GetRoleByRoleId(accessToken, id),
    {
      enabled: data !== undefined && !!accessToken,
    },
  );

  if (getPolicyStatuses.isLoading) {
    return <CircularProgress size="small" />;
  }

  return (
    <>
      <Chip label={role?.data?.data?.find((x) => x?.id === id)?.name} />
    </>
  );
};

export default UserRoleChip;
