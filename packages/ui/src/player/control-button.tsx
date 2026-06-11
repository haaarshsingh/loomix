"use client";

import * as React from "react";
import { Tooltip, type TooltipAlign, type TooltipSide } from "./tooltip";
import { cn } from "./utils";

type ControlButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  tooltipHidden?: boolean;
  tooltipSide?: TooltipSide;
  tooltipAlign?: TooltipAlign;
};

export function ControlButton({
  children,
  onClick,
  label,
  pressed,
  disabled,
  tooltipHidden,
  tooltipSide,
  tooltipAlign,
}: ControlButtonProps) {
  return (
    <Tooltip
      label={label}
      hidden={disabled || tooltipHidden}
      side={tooltipSide}
      align={tooltipAlign}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        className={cn(
          "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-2 text-white/85 transition-colors duration-150 hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:text-white/35 disabled:hover:bg-transparent disabled:hover:text-white/35",
          pressed && "bg-white/12 text-white",
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}
