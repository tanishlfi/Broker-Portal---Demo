import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import { useQuery } from "react-query";
import axios from "axios";

const GetPaymentMethodLookup = () => {
  const [PaymentMethods, setPaymentMethods] = React.useState([]);

  const cancellationReasonRequest = useQuery(
    `GetPaymentMethodLookup`,
    () => axios.get(`${rmaAPI}/mdm/api/PaymentMethod`, {}),
    {
      onSuccess: (data) => {
        setPaymentMethods(data?.data);
      },
    },
  );

  return {
    PaymentMethods,
    isLoadingPaymentMethods: cancellationReasonRequest.isLoading,
  };
};

export default GetPaymentMethodLookup;
