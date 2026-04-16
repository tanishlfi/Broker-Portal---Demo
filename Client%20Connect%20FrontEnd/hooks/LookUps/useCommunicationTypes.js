import axios from "axios";
import useToken from "hooks/useToken";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

export default function useCommunicationTypes() {
  const accessToken = useToken();

  const { data, loading, isLoading, error, isError } = useQuery(
    `CommunicationTypes`,
    () =>
      axios.get(`${rmaAPI}/mdm/api/CommunicationType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,

      refetchOnWindowFocus: false,
    },
  );

  return { communicationTypes: data?.data, loading, isLoading, error, isError };
}
