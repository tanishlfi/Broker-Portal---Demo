import React from "react";
import { Chip } from "@mui/material";

const MemberStatusChip = ({ status }) => {
  switch (status) {
    case "Active":
      return <Chip label={status} color="primary" />;
    case "Clear":
      return <Chip label={status} color="primary" />;
    case "Deleted":
      return <Chip label={status} color="error" />;
    case "Error":
      return <Chip label={status} color="error" />;
    default:
      return <Chip label={status} color="warning" />;
  }
};

export default MemberStatusChip;
