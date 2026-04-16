import React from "react";
import { nodeSa } from "../../../src/AxiosParams";
import { useQuery } from "react-query";
import axios from "axios";
import useToken from "../../../hooks/useToken";

const GetBenefitsAndRates = ({ productOptionId }) => {
  const [benefits, setBenefits] = React.useState([]);
  const accessToken = useToken();

  const getBenefitsAndRates = useQuery(
    ["getBenefitsAndRates", productOptionId],
    () =>
      axios.get(`${nodeSa}/rules/benefits/${productOptionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: productOptionId ? true : false,
      onSuccess: (data) => {
        setBenefits(data?.data?.data);
      },
    },
  );

  return {
    benefits,
    completedBenefits: getBenefitsAndRates.isSuccess,
    error: getBenefitsAndRates.error,
  };
};

export default GetBenefitsAndRates;
