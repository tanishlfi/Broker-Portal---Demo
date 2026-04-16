"use client";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OtpInput({ value, onChange }: OtpInputProps) {
  return (
    <input
      id="otp"
      type="text"
      placeholder="Enter 6-digit OTP"
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-700 rounded bg-[#1a1a2e] text-white placeholder-gray-500 outline-none focus:border-[#29abe2] transition-colors text-sm"
    />
  );
}
