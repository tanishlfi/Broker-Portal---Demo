import React from "react";
import { Alert } from "@mui/material";

const NoMainMember = ({ members }) => {
  // Check if there is a main member

  const hasMainMember = members?.some((member) => {
    return member.memberTypeId === 1;
  });

  return (
    <>
      {!hasMainMember && (
        <Alert severity="error">There is no main member in this policy</Alert>
      )}
    </>
  );
};

export default NoMainMember;
