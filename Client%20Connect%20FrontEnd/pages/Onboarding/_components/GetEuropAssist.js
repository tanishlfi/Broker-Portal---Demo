import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import axios from "axios";
import { useQuery } from "react-query";

const GetEuropAssist = () => {
  const data = useQuery(
    `GetEuropAssist`,
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Policy/PolicyIntegration/GetEuropAssistFee`,
        {},
      ),
    {},
  );

  // console.log(data);

  return {
    europeAssistFee: data?.data?.data?.europAssist,
  };
};

export default GetEuropAssist;
