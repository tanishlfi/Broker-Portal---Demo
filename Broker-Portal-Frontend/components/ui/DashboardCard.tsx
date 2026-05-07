import React from "react";

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
  className,
  style,
  iconWrapperClassName,
  iconWrapperStyle,
  titleClassName,
  titleStyle,
  descriptionClassName,
  descriptionStyle,
}: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex h-full w-full flex-col rounded-lg p-6 text-left ${className ?? ""}`}
      style={{
        background: "#2d2d2d",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgb(58, 58, 58)",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s, background 0.2s",
        ...style,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#1FC3EB";
        el.style.background = "rgba(31, 195, 235, 0.05)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgb(58, 58, 58)";
        el.style.background = "#2d2d2d";
      }}
    >
      <div
        className={`mb-4 transition-transform group-hover:scale-110 ${iconWrapperClassName ?? ""}`}
        style={{ color: "#1FC3EB", ...iconWrapperStyle }}
      >
        {icon}
      </div>
      <h3
        style={{ fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.5, color: "#ffffff", ...titleStyle }}
        className={`mb-2 ${titleClassName ?? ""}`}
      >
        {title}
      </h3>
      <p
        style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.5, ...descriptionStyle }}
        className={`flex-1 ${descriptionClassName ?? ""}`}
      >
        {description}
      </p>
    </button>
  );
}
