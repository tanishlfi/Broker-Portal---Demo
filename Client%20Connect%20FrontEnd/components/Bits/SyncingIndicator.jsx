import { LinearProgress } from "@mui/material";
import React from "react";

const SyncingIndicator = ({ isRefetching }) => {
  return (
    <>
      {isRefetching && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
          color="inherit"
        />
      )}
    </>
  );
};

export default SyncingIndicator;
