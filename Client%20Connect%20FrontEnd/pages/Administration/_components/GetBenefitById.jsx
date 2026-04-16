import { useState, useEffect } from "react";
import axios from "axios";
import useToken from "../../../hooks/useToken";
import { rmaAPI } from "../../../src/AxiosParams";

const useBenefitById = (benefitId) => {
  const [benefitItem, setBenefitItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const accessToken = useToken();

  useEffect(() => {
    if (!benefitId) return; // Prevent unnecessary calls when no benefitId is provided

    const getBenefit = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${rmaAPI}/clc/api/Product/Benefit/${benefitId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setBenefitItem(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getBenefit();
  }, [benefitId, accessToken]);

  return { benefitItem, error, loading };
};

export default useBenefitById;
