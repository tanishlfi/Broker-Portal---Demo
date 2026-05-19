"use client";

import React from "react";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  className = "",
  style,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", ...style }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`custom-slider ${className}`}
        style={{
          ["--progress" as any]: `${percentage}%`,
        }}
      />

      <style>{`
        .custom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          background: linear-gradient(
            to right,
            #00C8F8 0%,
            #00C8F8 var(--progress),
            #30363D var(--progress),
            #30363D 100%
          );
          transition: all 0.2s ease;
        }

        /* Chrome / Safari Track */
        .custom-slider::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
          border-radius: 999px;
        }

        /* Chrome / Safari Thumb */
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #00C8F8;
          border: 2px solid #111111;
          margin-top: -5px;
          cursor: pointer;
          box-shadow: 0 0 0 2px rgba(0, 200, 248, 0.15);
          transition: transform 0.15s ease;
        }

        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        /* Firefox Track */
        .custom-slider::-moz-range-track {
          height: 4px;
          background: transparent;
          border-radius: 999px;
        }

        /* Firefox Thumb */
        .custom-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #00C8F8;
          border: 2px solid #111111;
          cursor: pointer;
          box-shadow: 0 0 0 2px rgba(0, 200, 248, 0.15);
        }
      `}</style>
    </div>
  );
}
