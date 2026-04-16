import { useTheme } from "@emotion/react";
import { Alert, Stack, Typography } from "@mui/material";
import React from "react";

const DiffAlert = ({ from, to }) => {
  const theme = useTheme();

  return (
    <Alert
      sx={
        theme.palette.mode === "light"
          ? {
              color: "black",
              borderStyle: "solid",
              borderColor: theme.palette.warning.light,
              borderWidth: "1px",
            }
          : {}
      }
      severity="warning">
      <Stack direction="row" spacing={4}>
        <Typography variant="body1" color="warning">
          {JSON.stringify(from)}
        </Typography>
        <Typography variant="body1">{"=>"}</Typography>
        <Typography
          variant="body1"
          color={theme.palette.mode === "light" ? "darkgreen" : "secondary"}>
          {JSON.stringify(to)}
        </Typography>
      </Stack>
    </Alert>
  );
};

export default DiffAlert;
