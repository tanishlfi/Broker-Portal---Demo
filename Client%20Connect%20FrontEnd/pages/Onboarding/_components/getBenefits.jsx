import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import { useQuery } from "react-query";
import axios from "axios";

const GetBenefits = (
  productOptionId,
  coverType,
  coverAmount = null,
  dob = null
) => {
  const [benefits, setBenefits] = React.useState([]);

  let age = null;
  if (dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    age = today.getFullYear() - birthDate.getFullYear();
  }
  // console.log("ProductOptionId", productOptionId);
  // console.log("CoverType", coverType);
  // console.log("CoverAmount", coverAmount);
  // console.log("Age", age);

  // {rmaApi}/clc/api/Product/Benefit/GetProductBenefitRates/:ProductOptionId/:covertype
  const benefitsRequest = useQuery(
    [`Benefits`, productOptionId],
    () =>
      axios.get(
        `${rmaAPI}/clc/api/Product/Benefit/GetProductBenefitRates/${productOptionId}/${coverType}`
      ),
    {
      enabled: !!productOptionId && !!coverType,
      onSuccess: (data) => {
        // if coverAmount is not null, then filter the benefits for the coverAmount
        if (coverAmount) {
          const filteredBenefits = data?.data?.benefits.filter(
            (benefit) => benefit.benefitRates[0]?.benefitAmount === coverAmount
          );
          if (age) {
            // check for each benefit in filteredBenefits
            // if benefit has ruleItems, check for ruleId === 11 and ruleId === 12
            // if ruleId === 11, get ruleConfiguration and set maxAge to ruleConfiguration.fieldValue
            // if ruleId === 12, get ruleConfiguration and set minAge to ruleConfiguration.fieldValue
            // filter benefits based on age
            // set benefits to filteredBenefits
            filteredBenefits.forEach((benefit) => {
              const rule11 = benefit.ruleItems.find(
                (rule) => rule.ruleId === 11
              );
              const rule12 = benefit.ruleItems.find(
                (rule) => rule.ruleId === 12
              );
              // parse ruleConfiguration to get fieldValue
              // console.log("Rule11", rule11);
              // console.log("Rule12", rule12);

              const rule11ConfigurationString =
                rule11.ruleConfiguration.replace(/'/g, '"');
              const rule11Configuration =
                JSON.parse(rule11ConfigurationString) || null;
              const maxAge = rule11Configuration[0]?.fieldValue || null;

              const rule12ConfigurationString =
                rule12.ruleConfiguration.replace(/'/g, '"');
              const rule12Configuration =
                JSON.parse(rule12ConfigurationString) || null;
              const minAge = rule12Configuration[0]?.fieldValue || null;

              if ((!minAge || age >= minAge) && (!maxAge || age <= maxAge)) {
                setBenefits((prev) => [...prev, benefit]);
              }
            });
          } else {
            setBenefits(filteredBenefits);
          }

          // console.log("Benefits", filteredBenefits);
        } else {
          setBenefits(data?.data?.benefits);
          // console.log("Benefits", data?.data);
        }
        // console.log("Benefits", data?.data);
      },
    }
  );

  return {
    benefits,
    isLoadingGetBenefits: benefitsRequest.isLoading,
    isErrorGetBenefits: benefitsRequest.isError,
    isSuccessGetBenefits: benefitsRequest.isSuccess,
  };
};

export default GetBenefits;
