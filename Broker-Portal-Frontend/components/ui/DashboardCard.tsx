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
  descriptionClassName?: string;
}

export default function DashboardCard({
  title,
  description,
  icon,
  onClick,
  style,
  iconWrapperStyle
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
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
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
          fontSize: "22px",
          fontWeight: 500,
          lineHeight: "24px",
          color: "var(--text-primary)",
          marginBottom: "8px",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          lineHeight: "18px",
        }}
      >
        {description}
      </Typography>
    </Box>
  );

  return (
    <Card
      sx={{
         background: "var(--card-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
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
