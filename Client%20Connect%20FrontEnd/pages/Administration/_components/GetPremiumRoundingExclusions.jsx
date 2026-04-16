import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import axios from "axios";
import { useQuery } from "react-query";

const GetPremiumRoundingExclusions = () => {
  const data = useQuery(
    `PremiumRoundingExclusions`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/PolicyIntegration/GetGroupSchemePremiumRoundingExclusions`,
        {},
      ),
    {},
  );

  // map through data?.data?.data and add policyId to array
  // return array of policyId
  const PremiumRoundingExclusions = data?.data?.data.map((item) => {
    return item.policyId;
  });

  return {
    PremiumRoundingExclusions: PremiumRoundingExclusions,
    isLoadingGetPremiumRoundingExclusions: data.isLoading,
    isSuccessGetPremiumRoundingExclusions: data.isSuccess,
  };
};

export default GetPremiumRoundingExclusions;
