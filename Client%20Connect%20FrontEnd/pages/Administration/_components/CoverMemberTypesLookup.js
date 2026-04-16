import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import axios from "axios";
import { useQuery } from "react-query";
import useToken from "../../../hooks/useToken";

const CoverMemberTypesLookup = () => {
  const accessToken = useToken();

  const data = useQuery(
    "CoverMemberType",
    () =>
      axios.get(`${rmaAPI}/mdm/api/CoverMemberType`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );

  return {
    CoverMemberTypes: data?.data?.data,
    MemberTypesComplete: data.isSuccess,
  };
};

export default CoverMemberTypesLookup;
