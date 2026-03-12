"use client";

import React from "react";

const presets = ["#E8312A", "#4CAF50", "#5BB8F5", "#FFD700", "#7C4DFF", "#1A1A2E"];

type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((color) => {
        const isActive = value === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-8 w-8 rounded-none border-2 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isActive ? "border-ink shadow-hard-sm scale-110" : "border-border-soft hover:border-ink hover:shadow-hard-sm"
            }`}
            aria-label={`Select ${color}`}
          >
            <span className="block h-6 w-6 rounded-none" style={{ backgroundColor: color }} />
          </button>
        );
      })}
    </div>
  );
};
