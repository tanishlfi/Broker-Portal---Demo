import { Link, Stack, Typography } from "@mui/material";
import React from "react";

const Footer = () => {
  return (
    <Stack
      sx={{ mr: 3 }}
      display="flex"
      direction="row"
      justifyContent="flex-end">
      <Stack>
        <Typography
          sx={{ display: "inline" }}
          component="span"
          variant="body2"
          color="warning.main">
          Need Support?*
        </Typography>
        <Typography
          sx={{ display: "inline" }}
          component="span"
          variant="body1"
          color="text.primary">
          <Link
            href="mailto:clientconnect@cdasolutions.co.za"
            underline="hover">
            clientconnect@cdasolutions.co.za
          </Link>
        </Typography>
        <Typography
          sx={{ display: "inline", fontSize: "10px" }}
          component="span"
          variant="body2">
          *Support is provided Monday to Friday, 8am to 5pm (excluding public
          holidays)
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Footer;
