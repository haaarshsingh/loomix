"use client";

import * as React from "react";
import { motion } from "motion/react";
import { EASE } from "./utils";

type VolumePopoverProps = {
  popoverRef: React.RefObject<HTMLDivElement | null>;
  triggerRect: DOMRect;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

/** Portaled vertical volume slider, anchored above its trigger. */
export function VolumePopover({
  popoverRef,
  triggerRect,
  volume,
  isMuted,
  onVolumeChange,
  onPointerEnter,
  onPointerLeave,
}: VolumePopoverProps) {
  const effectiveVolume = isMuted ? 0 : volume;
  return (
    <motion.div
      key="volume-popover"
      ref={popoverRef}
      initial={{ opacity: 0, y: 6, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 6, x: "-50%" }}
      transition={{ duration: 0.16, ease: EASE }}
      role="group"
      aria-label="Volume"
      style={{
        position: "fixed",
        bottom: document.documentElement.clientHeight - triggerRect.top + 8,
        left: triggerRect.left + triggerRect.width / 2,
        zIndex: 60,
      }}
      className="rounded-full border border-white/12 bg-neutral-900/85 px-2 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="relative h-20 w-2.5">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-white/15">
          <div
            className="absolute inset-x-0 bottom-0 bg-white"
            style={{ height: `${effectiveVolume * 100}%` }}
          />
        </div>
        <div
          className="pointer-events-none absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
          style={{ bottom: `calc(${effectiveVolume * 100}% - 5px)` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effectiveVolume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          aria-label="Volume"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ writingMode: "vertical-lr", direction: "rtl" }}
        />
      </div>
    </motion.div>
  );
}
