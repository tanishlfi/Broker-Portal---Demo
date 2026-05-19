"use client";

import React from "react";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import FormHelperText from "@mui/material/FormHelperText";

interface OptionItem {
  label: string;
  value: string;
}

interface OptionToggleGroupProps {
  options: (string | OptionItem)[];
  value: string;
  onChange: (val: string) => void;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  error?: string;
  orientation?: "horizontal" | "vertical";
}

export function OptionToggleGroup({
  options,
  value,
  onChange,
  style,
  buttonStyle,
  error,
  orientation = "horizontal",
}: OptionToggleGroupProps) {
  const formattedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleToggle}
        orientation={orientation}
        style={{
          gap: "8px",
          flexWrap: orientation === "vertical" ? "nowrap" : "wrap",
          flexDirection: orientation === "vertical" ? "column" : "row",
          width: "100%",
          ...style
        }}
        sx={{
          "& .MuiToggleButtonGroup-grouped": {
            border: `1px solid ${error ? "#ef4444" : "#333333"} !important`,
            borderRadius: "8px !important",
            margin: "0 !important",
            width: orientation === "vertical" ? "100%" : undefined,
          },
        }}
      >
        {formattedOptions.map((option) => {
          return (
            <ToggleButton
              key={option.value}
              value={option.value}
              style={{
                height: "36px",
                padding: "0 20px",
                width: orientation === "vertical" ? "100%" : undefined,
                justifyContent: orientation === "vertical" ? "flex-start" : "center",
                ...buttonStyle,
              }}
              sx={{
                borderColor: error ? "#ef4444 !important" : undefined,
              }}
            >
              {option.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
      {error && (
        <FormHelperText style={{ color: "#ef4444", marginLeft: 0, marginTop: "4px", fontSize: "0.75rem" }}>
          {error}
        </FormHelperText>
      )}
    </div>
  );
}

export default OptionToggleGroup;
