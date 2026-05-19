"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ error, className = "", style, containerStyle, onFocus, onBlur, onMouseEnter, onMouseLeave, children, value, onChange, disabled, ...props }, ref) => {
    const internalRef = useRef<HTMLSelectElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    return (
      <FormControl fullWidth style={containerStyle} error={!!error}>
        <Select
          native
          inputRef={internalRef}
          value={value}
          onChange={onChange as any}
          disabled={disabled}
          className={className}
          onFocus={onFocus as any}
          onBlur={onBlur as any}
          onMouseEnter={onMouseEnter as any}
          onMouseLeave={onMouseLeave as any}
          style={{
            ...style,
          }}
          {...(props as any)}
        >
          {children}
        </Select>
        {error && (
          <FormHelperText style={{ color: "#ef4444", marginLeft: 0, marginTop: "4px", fontSize: "0.75rem" }}>
            {error}
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
export default CustomSelect;
