import * as React from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";

type Variant = "view" | "continue" | "destructive";
type Size    = "sm" | "md";

export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "view", size = "sm", sx, disabled, children, ...props }, ref) => {
    
    // Shared base styles
    const baseStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "nowrap",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 500,
      gap: "6px",
      transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
      textTransform: "none",
      minWidth: "auto",
      flexShrink: 0,
      "&.Mui-disabled": {
        opacity: 0.5,
        color: variant === "destructive" ? "#FFFFFF" : undefined,
      },
    };

    // Size styles mapping
    const sizeStyle = size === "sm" 
      ? { height: "32px", px: "10px" } 
      : { height: "40px", px: "16px" };

    // Variant style states mapping
    let variantStyle = {};
    if (variant === "view") {
      variantStyle = {
        background: "transparent",
        color: "rgb(156, 163, 175)",
        border: "none",
        padding: "0 10px",
        "&:hover": {
          background: "transparent",
          color: "rgb(31, 195, 235)",
        }
      };
    } else if (variant === "continue") {
      variantStyle = {
        background: "rgba(31, 195, 235, 0.1)",
        border: "1px solid rgb(58, 58, 58)",
        color: "rgb(31, 195, 235)",
        "&:hover": {
          background: "rgba(31, 195, 235, 0.2)",
          borderColor: "rgb(58, 58, 58)",
        }
      };
    } else if (variant === "destructive") {
      variantStyle = {
        background: "rgba(239, 68, 68, 0.6)",
        border: "none",
        color: "rgb(255, 255, 255)",
        "&:hover": {
          background: "rgba(239, 68, 68, 0.8)",
        }
      };
    }

    return (
      <MuiButton
        ref={ref}
        disabled={disabled}
        sx={{
          ...baseStyle,
          ...sizeStyle,
          ...variantStyle,
          ...sx,
        }}
        {...(props as any)}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
