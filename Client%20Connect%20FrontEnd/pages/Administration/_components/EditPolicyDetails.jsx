import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  LinearProgress,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import DiffAlert from "components/FormComponents.jsx/DiffAlert";

const EditPolicyDetails = ({
  categoryOptions,
  coverLevels,
  statusOptions,
  cancellationReasons,
  selectCategory,
  orgCoverAmount,
  policyStatus,
  cancellationReasonsId,
  policyDetails,
  setPolicyDetails,
  setKey,
  orgPolicyStatusId,
}) => {
  const [STATEpolicyStatus, setSTATEpolicyStatus] = React.useState(
    statusOptions.find((a) => a.id === Number(policyStatus))
  );

  const orgPolicyStatus = statusOptions.find(
    (a) => a.id === Number(orgPolicyStatusId)
  );

  const [STATEselectedCategory, setSTATEselectedCategory] = React.useState(
    categoryOptions?.find((a) => a?.categoryId === Number(selectCategory)) || ""
  );

  const [STATEcoverAmount, setSTATEcoverAmount] = React.useState(
    coverLevels.includes(policyDetails.coverAmount)
      ? policyDetails.coverAmount
      : ""
  );

  // console.log("STATEpolicyStatus", STATEpolicyStatus);
  // console.log("orgPolicyStatus", orgPolicyStatus);

  const handelSelectRule = (e) => {
    setPolicyDetails({
      ...policyDetails,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "policyStatusId") {
      setSTATEpolicyStatus(
        statusOptions.find((a) => a.id === Number(e.target.value))
      );
    }
    setKey((prev) => prev + 1);
  };

  const handelChange = (e) => {
    setPolicyDetails({
      ...policyDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handelDateChange = (value) => {
    // Initialize 'date' with the current date
    let date = dayjs(value);

    // Check if the date is between 1st and 28th
    if (date.date() >= 1 && date.date() <= 28) {
      // Set the month to the 1st of the next month
      date = date.startOf("month");
    } else {
      // Set the date to 28th (or the last day of the current month)
      date = date.date(28);
      // Set the month to the start of the second month
      date = date.add(2, "month").startOf("month");
    }

    setPolicyDetails({
      ...policyDetails,
      joinDate: date,
    });
  };

  // console.log("STATEpolicyStatus", STATEpolicyStatus);
  // console.log("STATEselectedCategory", STATEselectedCategory);
  // console.log("STATEcoverAmount", STATEcoverAmount);

  if (!STATEpolicyStatus || !STATEselectedCategory || !STATEcoverAmount) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      {
        // check that statusOptions is not null and that policyStatus !== ""
      }

      <FormControl
        sx={{
          width: "350px",
        }}>
        <InputLabel id="select_status">Select Status</InputLabel>
        <Select
          labelId="select_status"
          id="selectStatus"
          name="policyStatusId"
          value={Number(policyStatus)}
          label="Select Status"
          onChange={handelSelectRule}>
          {statusOptions.map((status) => {
            if (
              ["Active", "Request Cancellation"].includes(status.description)
            ) {
              return (
                <MenuItem key={status.id} value={status.id}>
                  {status.description}
                </MenuItem>
              );
            }
          })}
        </Select>
        {
          /* Display the difference between the original status and new status */
          orgPolicyStatus && orgPolicyStatus.id !== STATEpolicyStatus.id && (
            <DiffAlert
              from={`${orgPolicyStatus.name}`}
              to={`${STATEpolicyStatus.name}`}
            />
          )
        }
      </FormControl>

      {
        // if policyStatusId > 1 then display the cancellation reason
        policyStatus > 1 && (
          <FormControl
            sx={{
              width: "350px",
            }}>
            <InputLabel id="select_cancellation_reason">
              Select Cancellation Reason
            </InputLabel>
            <Select
              labelId="select_cancellation_reason"
              id="selectCancellationReason"
              name="policyCancelReasonId"
              value={Number(cancellationReasonsId)}
              label="Select Cancellation Reason"
              onChange={handelChange}>
              {cancellationReasons.map((reason) => {
                // if ([ ].includes(reason.description)) {
                return (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.description}
                  </MenuItem>
                );
                // }
              })}
            </Select>
          </FormControl>
        )
      }

      <FormControl
        sx={{
          width: "400px",
        }}>
        <InputLabel id="select_category">Select Category</InputLabel>
        <Select
          labelId="select_category"
          id="selectCategory"
          name="selectedCategory"
          value={Number(selectCategory) || ""}
          label="Select Category"
          onChange={handelSelectRule}>
          {categoryOptions.map((category) => {
            return (
              <MenuItem key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      <Box sx={{ maxWidth: 300, minWidth: 200 }}>
        <FormControl fullWidth>
          <InputLabel id="select_cover">Cover Amount</InputLabel>
          <Select
            labelId="select_cover"
            id="select_cover_id"
            name="coverAmount"
            value={policyDetails.coverAmount}
            label="Select cover amount"
            onChange={handelSelectRule}>
            {coverLevels.map((amount, index) => {
              return (
                <MenuItem key={index} value={amount}>
                  R {amount}
                </MenuItem>
              );
            })}
          </Select>
          {
            /* Display the difference between the original cover amount and the new cover amount */
            orgCoverAmount !== policyDetails.coverAmount && (
              <DiffAlert
                from={`R ${orgCoverAmount}`}
                to={`R ${policyDetails.coverAmount}`}
              />
            )
          }
        </FormControl>
      </Box>
    </Stack>
  );
};

export default EditPolicyDetails;
