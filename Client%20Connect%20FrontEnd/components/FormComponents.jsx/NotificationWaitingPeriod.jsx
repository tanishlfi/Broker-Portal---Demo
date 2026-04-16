import React from "react";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

// original code - use this was RMA can implement
// const WaitingPeriodInfo = ({
//   values,
//   maxCover,
//   waitingPeriod,
//   providerInceptionDate,
// }) => {
//   const calculateWaitingPeriod = () => {
//     if (
//       values.PolicyMember.PreviousInsurerJoinDate &&
//       values.PolicyMember.PreviousInsurerCancellationDate &&
//       dayjs(providerInceptionDate).diff(
//         dayjs(values.PolicyMember.PreviousInsurerCancellationDate),
//         "months",
//       ) <= 1
//     ) {
//       const monthsDiff = dayjs(
//         values.PolicyMember.PreviousInsurerCancellationDate,
//       ).diff(dayjs(values.PolicyMember.PreviousInsurerJoinDate), "months");
//       let finalWaitingPeriod =
//         waitingPeriod - monthsDiff <= 0 ? 0 : waitingPeriod - monthsDiff;
//       let message = `A waiting period of ${finalWaitingPeriod} months applies.`;

//       if (values.PolicyMember.PreviousInsurerCoverAmount >= maxCover) {
//         return message;
//       } else {
//         const additionalCover =
//           maxCover - values.PolicyMember.PreviousInsurerCoverAmount;
//         return `${message} A waiting period of ${waitingPeriod} months applies on the additional cover of R${additionalCover}.`;
//       }
//     }
//     return `A waiting period of ${waitingPeriod} months applies.`;
//   };

//   return (
//     <Typography align="left" sx={{ mb: 3 }}>
//       {calculateWaitingPeriod()}
//     </Typography>
//   );
// };

const WaitingPeriodInfo = ({
  PreviousInsurerJoinDate,
  PreviousInsurerCancellationDate,
  waitingPeriod,
  policyInceptionDate,
}) => {
  const calculateWaitingPeriod = () => {
    // console.log("PreviousInsurerJoinDate", PreviousInsurerJoinDate);
    // console.log(
    //   "PreviousInsurerCancellationDate",
    //   PreviousInsurerCancellationDate,
    // );
    // console.log("waitingPeriod", waitingPeriod);
    // console.log("policyInceptionDate", policyInceptionDate);
    // console.log(
    //   "Calc",
    //   PreviousInsurerCancellationDate &&
    //     dayjs(PreviousInsurerCancellationDate).diff(dayjs(policyInceptionDate)),
    // );

    // if PreviousInsurerJoinDate >= PreviousInsurerCancellationDate then retun error
    if (
      PreviousInsurerJoinDate &&
      PreviousInsurerCancellationDate &&
      dayjs(PreviousInsurerJoinDate).diff(
        dayjs(PreviousInsurerCancellationDate),
      ) >= 0
    ) {
      return (
        <Typography align="left" sx={{ mb: 3 }}>
          <span style={{ color: "red" }}>
            Previous insurer join date should be before the previous insurer
            cancellation date.
          </span>
        </Typography>
      );
    }

    // if  PreviousInsurerCancellationDate is on or after the policyInceptionDate then return error
    if (
      PreviousInsurerCancellationDate &&
      dayjs(PreviousInsurerCancellationDate).diff(dayjs(policyInceptionDate)) >=
        0
    ) {
      return (
        <Typography align="left" sx={{ mb: 3 }}>
          <span style={{ color: "red" }}>
            Previous insurer cancellation date should be before the policy
            inception date.
          </span>
        </Typography>
      );
    }

    if (
      PreviousInsurerJoinDate &&
      PreviousInsurerCancellationDate &&
      dayjs(policyInceptionDate).diff(
        dayjs(PreviousInsurerCancellationDate),
        "months",
      ) <= 1
    ) {
      const monthsDiff = dayjs(PreviousInsurerCancellationDate).diff(
        dayjs(PreviousInsurerJoinDate),
        "months",
      );
      let finalWaitingPeriod =
        waitingPeriod - monthsDiff <= 0 ? 0 : waitingPeriod - monthsDiff;
      let message = `A waiting period of ${finalWaitingPeriod} months is imposed for the lowest amount between the previously insured sum and the new cover amount. Any previous cover held may be verified at the time of claim processing, which may affect the waiting period enforced and the determination of the claim.`;
      return message;
    }
    return `A waiting period of ${waitingPeriod} months applies.`;
  };

  return (
    <Typography align="left" sx={{ mb: 3, fontSize: "12px" }}>
      <span style={{ color: "red" }}>PLEASE NOTE: </span>
      {calculateWaitingPeriod()}
    </Typography>
  );
};

export default WaitingPeriodInfo;
