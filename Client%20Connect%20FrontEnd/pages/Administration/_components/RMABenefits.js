import React from "react";
import useToken from "../../../hooks/useToken";
import { useQuery } from "react-query";
import { rmaAPI } from "../../../src/AxiosParams";

const RMABenefits = ({ benefitId }) => {
  // const accessToken = useToken();
  const [benefit, setBenefit] = React.useState([]);

  // // get Benefits from RMA

  // console.log(benefit);

  return { benefit };
};

export default RMABenefits;
