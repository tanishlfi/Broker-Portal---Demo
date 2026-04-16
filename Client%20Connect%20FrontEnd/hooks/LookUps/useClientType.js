import { useOidcAccessToken } from "@axa-fr/react-oidc";
import axios from "axios";
import useToken from "hooks/useToken";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

export default function useClientType() {
  const accessToken = useToken();

  const { data, loading, isLoading, error, isError } = useQuery(
    `ClientTypes`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/ClientType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    { enabled: !!accessToken, refetchOnWindowFocus: false },
  );

  return { ClientTypes: data?.data, loading, isLoading, error, isError };
}
