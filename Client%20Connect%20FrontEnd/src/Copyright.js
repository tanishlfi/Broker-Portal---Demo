import * as React from "react";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { Box } from "@mui/system";

export default function Copyright({ sx }) {
  return (
    <Box sx={sx}>
      <Typography variant="body2" color="text.secondary">
        {"Copyright © "}
        <MuiLink color="inherit" href="https://mui.com/">
          Your Website
        </MuiLink>{" "}
        {new Date().getFullYear()}.
      </Typography>
    </Box>
  );
}
