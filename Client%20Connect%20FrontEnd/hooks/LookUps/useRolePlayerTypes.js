import axios from "axios";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

export default function useRolePlayerTypes() {
  const accessToken = useToken();

  const { data, loading, isLoading, error, isError } = useQuery(
    `RolePlayers`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/RolePlayer/RolePlayer/GetRolePlayerTypesIsRelation`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    { refetchOnWindowFocus: false },
  );

  return {
    RolePlayer: data?.data,
    loading,
    loadingRolePlayers: isLoading,
    RolePlayersError: error,
    RolePlayersIsError: isError,
  };
}
