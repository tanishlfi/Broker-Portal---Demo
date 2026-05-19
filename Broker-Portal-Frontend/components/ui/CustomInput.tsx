"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";
import TextField from "@mui/material/TextField";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ error, className = "", style, containerStyle, onFocus, onBlur, onMouseEnter, onMouseLeave, type, placeholder, value, onChange, disabled, readOnly, required, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    return (
      <TextField
        inputRef={internalRef}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange as any}
        disabled={disabled}
        error={!!error}
        helperText={error}
        variant="outlined"
        fullWidth
        className={className}
        style={{ ...containerStyle }}
        slotProps={{
          htmlInput: {
            readOnly,
            required,
            onFocus,
            onBlur,
            onMouseEnter,
            onMouseLeave,
            style: {
              ...style,
            },
            ...props,
          },
          formHelperText: {
            style: {
              color: "#ef4444",
              marginLeft: 0,
              marginTop: "4px",
              fontSize: "0.75rem",
            }
          }
        }}
      />
    );
  }
);

CustomInput.displayName = "CustomInput";
export default CustomInput;
