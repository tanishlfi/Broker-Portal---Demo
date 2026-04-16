import { Chip } from "@mui/material";
import React from "react";

const AppPolicyStatusChip = ({ status }) => {
  if (!status) {
    return <Chip label="Unknown" variant="outlined" />;
  }

  return (
    <Chip
      label={status}
      sx={{
        color:
          status === "Processing"
            ? "warning.main"
            : status === "Draft"
            ? "info.secondary"
            : status === "Approved"
            ? "success.main"
            : status === "Submitted"
            ? "success.main"
            : status === "Ready"
            ? "primary.main"
            : status === "Complete"
            ? "success.main"
            : "error.main",
        borderColor:
          status === "Processing"
            ? "inherit"
            : status === "Draft"
            ? "info.secondary"
            : status === "Approved"
            ? "success.main"
            : status === "Submitted"
            ? "success.main"
            : status === "Ready"
            ? "primary.main"
            : status === "Complete"
            ? "success.main"
            : "error.main",
      }}
      variant={
        status === "Processing"
          ? "outlined"
          : status === "Approved"
          ? "filled"
          : status === "Draft"
          ? "outlined"
          : status === "Submitted"
          ? "filled"
          : status === "Ready"
          ? "outlined"
          : status === "Complete"
          ? "contained"
          : "outlined"
      }
    />
  );
};

export default AppPolicyStatusChip;
