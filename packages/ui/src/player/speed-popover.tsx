"use client";

import * as React from "react";
import { motion } from "motion/react";
import { IconCheck } from "@tabler/icons-react";
import { cn, EASE, SPEEDS, type Speed } from "./utils";

type SpeedPopoverProps = {
  popoverRef: React.RefObject<HTMLDivElement | null>;
  triggerRect: DOMRect;
  speed: Speed;
  highlightedIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (speed: Speed) => void;
};

/** Portaled playback-speed menu, anchored above its trigger. */
export function SpeedPopover({
  popoverRef,
  triggerRect,
  speed,
  highlightedIndex,
  onHighlight,
  onSelect,
}: SpeedPopoverProps) {
  return (
    <motion.div
      key="speed-popover"
      ref={popoverRef}
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: EASE }}
      role="menu"
      aria-label="Playback speed"
      style={{
        position: "fixed",
        bottom: document.documentElement.clientHeight - triggerRect.top + 8,
        right: document.documentElement.clientWidth - triggerRect.right,
        zIndex: 60,
      }}
      className="flex w-[120px] flex-col rounded-2xl border border-white/12 bg-neutral-900/90 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
    >
      {SPEEDS.map((value, idx) => {
        const isCurrent = value === speed;
        const isHighlighted = idx === highlightedIndex;
        return (
          <button
            key={value}
            type="button"
            role="menuitemradio"
            aria-checked={isCurrent}
            data-highlighted={isHighlighted ? "true" : undefined}
            onMouseEnter={() => onHighlight(idx)}
            onClick={() => onSelect(value)}
            className={cn(
              "relative flex items-center justify-between rounded-xl px-3 py-1.5 text-left text-[13px] transition-colors duration-0",
              isCurrent
                ? "bg-[#2f6bff] text-white"
                : cn(
                    "text-white/85 hover:bg-white/10",
                    isHighlighted && "bg-white/10",
                  ),
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {isCurrent ? (
                <IconCheck size={13} aria-hidden />
              ) : (
                <span className="inline-block w-[13px]" aria-hidden />
              )}
              {value}×
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
