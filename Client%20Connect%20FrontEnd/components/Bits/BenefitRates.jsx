import { Chip, CircularProgress } from "@mui/material";
import axios from "axios";
import React from "react";
import { useQuery } from "react-query";
import { rmaAPI } from "src/AxiosParams";

const BenefitRates = async (id, accessToken) => {
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // const { data } = await axios.get(
  //   `${rmaAPI}/clc/api/Product/Benefit/${id}`,
  //   config
  // );
  // return data;
};

export default BenefitRates;
