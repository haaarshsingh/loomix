"use client";

import * as React from "react";
import { cn, formatTime } from "./utils";

type SeekBarProps = {
  duration: number;
  currentTime: number;
  progressPercent: number;
  bufferedPercent: number;
  hoverPercent: number | null;
  isScrubbing: boolean;
  /** Stretch to fill the row when the bottom bar is a single inline row. */
  inline: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  onPointerRelease: (event: React.PointerEvent<HTMLDivElement>) => void;
};

/** Scrubbable progress bar with buffered range, hover marker and time preview. */
export function SeekBar({
  duration,
  currentTime,
  progressPercent,
  bufferedPercent,
  hoverPercent,
  isScrubbing,
  inline,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  onPointerRelease,
}: SeekBarProps) {
  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration || 0}
      aria-valuenow={currentTime}
      tabIndex={-1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerRelease}
      onPointerCancel={onPointerRelease}
      className={cn(
        "pointer-events-auto relative flex h-5 cursor-crosshair touch-none items-center select-none",
        inline && "min-w-0 flex-1",
      )}
    >
      <div className="relative h-[3px] w-full rounded-full bg-white/20">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/35"
          style={{ width: `${bufferedPercent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          style={{ width: `${progressPercent}%` }}
        >
          <div
            className="pointer-events-none absolute top-1/2 right-0 h-3 w-3 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            style={{
              transform: `translate(50%, -50%) scale(${
                isScrubbing || hoverPercent !== null ? 1 : 0
              })`,
              transition: "transform 150ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
        </div>
      </div>

      {hoverPercent !== null && (
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white"
          style={{ left: `${hoverPercent * 100}%` }}
        />
      )}

      {hoverPercent !== null && duration > 0 && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-[12px] tabular-nums"
          style={{
            left: `${hoverPercent * 100}%`,
            bottom: "calc(100% + 8px)",
          }}
        >
          <span className="font-semibold text-white">
            {formatTime(hoverPercent * duration)}
          </span>
          <span className="text-white/45"> / {formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
