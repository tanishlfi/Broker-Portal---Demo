"use client";

import TextField from "@mui/material/TextField";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OtpInput({ value, onChange }: OtpInputProps) {
  return (
    <TextField
      id="otp"
      type="text"
      placeholder="Enter 6-digit OTP"
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 6))}
      fullWidth
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "#1a1a2e",
        }
      }}
    />
  );
}
