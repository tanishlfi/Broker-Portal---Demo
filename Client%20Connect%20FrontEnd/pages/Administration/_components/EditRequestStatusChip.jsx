import React from "react";
import { Chip } from "@mui/material";
const EditRequestStatusChip = ({ requestStatus }) => {
  // Statuses = Edit, Submitted, Rejected, Complete\, Cancelled/Removed

  return (
    <div>
      {requestStatus === "Edit" ? (
        <Chip label="Edit" color="info" />
      ) : requestStatus === "Submitted" ? (
        <Chip label="Submitted" color="warning" />
      ) : requestStatus === "Rejected" ? (
        <Chip label="Rejected" color="error" />
      ) : requestStatus === "Complete" ? (
        <Chip label="Complete" color="success" />
      ) : requestStatus === "Cancelled" ? (
        <Chip label="Cancelled" color="warning" />
      ) : requestStatus === "Expired" ? (
        <Chip label="Expired" color="default" />
      ) : (
        <Chip label="Unknown" color="default" />
      )}
    </div>
  );
};

export default EditRequestStatusChip;
