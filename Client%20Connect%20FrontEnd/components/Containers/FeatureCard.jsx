import { useTheme } from "@emotion/react";
import { Card, CardActionArea, Typography } from "@mui/material";

import React from "react";

import PropTypes from "prop-types";
import { useRouter } from "next/router";

const FeatureCard = ({ title, link, Icon, disabled, accessToken, brokerId }) => {
  const router = useRouter();
  return (
    <>
      <Card sx={{ borderRadius: 0 }}>
        <CardActionArea
          disabled={disabled}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            py: 6,
            minWidth: 250,
          }}
          onClick={() => {
            if (accessToken !== undefined || brokerId !== undefined) {
              const win = window.open(link, "_blank");
              if (win) {
                // wait for the new window to load then send the token
                const interval = setInterval(() => {
                  try {
                    win.postMessage(
                      { type: "BP_AUTH", token: accessToken, brokerId: String(brokerId || "") },
                      link
                    );
                  } catch (e) {
                    // ignore cross-origin errors during load
                  }
                }, 500);
                // stop after 5 seconds
                setTimeout(() => clearInterval(interval), 5000);
              }
            } else {
              router.push(`${link}`);
            }
          }}>
          <Icon
            sx={{ fontSize: 45, mb: 1, color: disabled && "text.secondary" }}
          />
          <Typography color="textPrimary">{title}</Typography>
        </CardActionArea>
      </Card>
    </>
  );
};

export default FeatureCard;

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
};
