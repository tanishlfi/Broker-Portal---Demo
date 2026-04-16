import { useOidcAccessToken } from "@axa-fr/react-oidc";
import axios from "axios";
import useToken from "hooks/useToken";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

export default function useIdTypes() {
  const accessToken = useToken();

  const { data, loading, isLoading, error, isError } = useQuery(
    `UserProfileTypeId`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/IdType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    { enabled: !!accessToken, refetchOnWindowFocus: false },
  );

  return {
    idTypes: data?.data,
    loading,
    loadingIdTypes: isLoading,
    idTypesError: error,
    idTypesIsError: isError,
  };
}
