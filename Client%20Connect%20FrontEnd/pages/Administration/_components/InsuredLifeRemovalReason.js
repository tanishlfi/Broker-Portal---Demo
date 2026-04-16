import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import axios from "axios";
import { useQuery } from "react-query";
import useToken from "../../../hooks/useToken";

const InsuredLifeRemovalReason = () => {
  const accessToken = useToken();

  const data = useQuery(
    "InsuredLifeRemovalReason",
    () =>
      axios.get(`${rmaAPI}/mdm/api/insuredLifeRemovalReason`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  return {
    insuredLifeRemovalReason: data?.data?.data,
    insuredLifeRemovalReasonComplete: data.isSuccess,
  };
};

export default InsuredLifeRemovalReason;
