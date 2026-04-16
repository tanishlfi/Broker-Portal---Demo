import { Skeleton } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";

const LoadingTable = () => {
  return (
    <Stack spacing={0.2}>
      {[...Array(60)].map((item, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          animation="wave"
          width={"auto"}
          height={50}
        />
      ))}
    </Stack>
  );
};

export default LoadingTable;
