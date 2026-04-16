import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import axios from "axios";
import { useQuery } from "react-query";
import useToken from "../../../hooks/useToken";

const InsuredLifeStatusLookup = () => {
  const accessToken = useToken();

  const data = useQuery(
    "InsuredLifeStatus",
    () =>
      axios.get(`${rmaAPI}/mdm/api/lookup/InsuredLifeStatus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  return {
    InsuredLifeStatus: data?.data?.data,
    InsuredLifeStatusComplete: data.isSuccess,
  };
};

export default InsuredLifeStatusLookup;
