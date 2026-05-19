import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  iconWrapperClassName?: string;
  iconWrapperStyle?: React.CSSProperties;
  titleClassName?: string;
  titleStyle?: React.CSSProperties;
  descriptionClassName?: string;
  descriptionStyle?: React.CSSProperties;
}

export default function DashboardCard({
  title,
  description,
  icon,
  onClick,
  style,
  iconWrapperStyle,
  titleStyle,
  descriptionStyle,
}: DashboardCardProps) {
  const cardContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        p: "24px",
      }}
    >
      <Box
        sx={{
          mb: "16px",
          color: "#1FC3EB",
          transition: "transform 0.2s ease-in-out",
          ".MuiCardActionArea-root:hover &": {
            transform: "scale(1.1)",
          },
          ...iconWrapperStyle,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h3"
        sx={{
          fontSize: "1.125rem",
          fontWeight: 500,
          lineHeight: 1.5,
          color: "#ffffff",
          mb: "8px",
          ...titleStyle,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.875rem",
          color: "#9ca3af",
          lineHeight: 1.5,
          flex: 1,
          ...descriptionStyle,
        }}
      >
        {description}
      </Typography>
    </Box>
  );

  return (
    <Card
      sx={{
        bgcolor: "#2d2d2d",
        border: "1px solid rgb(58, 58, 58)",
        borderRadius: "8px",
        height: "100%",
        width: "100%",
        boxShadow: "none",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "#1FC3EB",
          bgcolor: "rgba(31, 195, 235, 0.05)",
        },
        ...style,
      }}
    >
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ height: "100%", width: "100%" }}>
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </Card>
  );
}
