import React, { useEffect } from "react";
import * as yup from "yup";
import { nodeSa } from "src/AxiosParams";
import { useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";

const ValidationSchema = () => {
  const accessToken = useToken();
  const router = useRouter();

  const { id, newSchemeId, currentStep } = router.query;

  const { data, isLoading, isError, error, refetch } = useQuery(
    "getAllData",
    () =>
      axios.get(`${nodeSa}/brokerscheme/scheme/${id}/broker`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    {
      enabled: !!accessToken,
    }
  );
};

export default ValidationSchema;
