import { Chip, CircularProgress } from "@mui/material";
import axios from "axios";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const PolicyStatusChip = ({ status }) => {
  const accessToken = useToken();

  const getPolicyStatuses = useQuery(
    `PolicyStatuses`,
    async () =>
      await axios.get(`${rmaAPI}/clc/api/Policy/PolicyStatus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    },
  );

  if (getPolicyStatuses.isLoading) {
    return <CircularProgress size="small" />;
  }

  return (
    <>
      <Chip
        label={
          getPolicyStatuses?.data?.data?.find((x) => x?.id === status)?.name
        }
      />
    </>
  );
};

export default PolicyStatusChip;
