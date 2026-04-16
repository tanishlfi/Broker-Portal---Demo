import React from "react";
import { rmaAPI } from "../../../src/AxiosParams";
import { useQuery } from "react-query";
import axios from "axios";

const GetCancelationReasons = () => {
  const [cancellationReasons, setCancellationReasons] = React.useState([]);

  const requiredCancellationReason = [
    "Cancellation Request from Member",
    "Cancellation Request from Broker",
    "Cancellation Request from Scheme",
    "Duplicate Policy",
    "Insurer Request on Suspicion of Fraud",
    "Main Member Deceased",
    "Member Cancelling Due to Affordability",
    "Member Cancelling Due to Poor Service",
    "Capture Error",
    "Member Does Not Agree To Policy",
    "Member Over Insured",
    "Other",
    "Main Member Deceased; Cancel Policy",
  ];

  // from rma api get cancellation reason /mdm/api/CancellationReason

  const cancellationReasonRequest = useQuery(
    `CancellationReason`,
    () => axios.get(`${rmaAPI}/mdm/api/CancellationReason`, {}),
    {
      onSuccess: (data) => {
        const requiredCancellationReasonLower = requiredCancellationReason.map(
          (reason) => reason.toLowerCase(),
        );

        const filteredData = data?.data?.filter((item) => {
          const lowerCaseItemName = item.name.toLowerCase();
          return requiredCancellationReasonLower.includes(lowerCaseItemName);
        });

        setCancellationReasons(filteredData);
      },
    },
  );

  return {
    cancellationReasons,
    isLoadingCancellationReasons: cancellationReasonRequest.isLoading,
  };
};

export default GetCancelationReasons;
