"use client";

import * as React from "react";

/**
 * Play / pause icon whose two paths morph between states via a CSS `d`
 * transition. The play triangle is split vertically into two quads so each
 * half shares the same `M L L L Z` command structure as a pause bar (a
 * requirement for path interpolation); the right half's collapsed edge
 * expands into the right bar.
 */
// Corner rounding comes from the round stroke (radius = STROKE_WIDTH / 2),
// so paths are inset by the half-stroke to keep the rendered footprint.
const STROKE_WIDTH = 2.5;

export const PLAY_PAUSE_PATHS = {
  left: {
    play: "M 7.5,4.5 L 13,8.25 L 13,15.75 L 7.5,19.5 Z",
    pause: "M 6.5,5.5 L 9.5,5.5 L 9.5,18.5 L 6.5,18.5 Z",
  },
  right: {
    play: "M 13,8.25 L 18.5,12 L 18.5,12 L 13,15.75 Z",
    pause: "M 14.5,5.5 L 17.5,5.5 L 17.5,18.5 L 14.5,18.5 Z",
  },
} as const;

export function PlayPauseIcon({
  isPlaying,
  className,
}: {
  isPlaying: boolean;
  className?: string;
}) {
  const state = isPlaying ? "pause" : "play";
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <MorphPath d={PLAY_PAUSE_PATHS.left[state]} />
      <MorphPath d={PLAY_PAUSE_PATHS.right[state]} />
    </svg>
  );
}

function MorphPath({ d }: { d: string }) {
  return (
    <path
      // The attribute is the fallback for browsers without CSS `d` support
      // (they snap between states instead of morphing).
      d={d}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH}
      strokeLinejoin="round"
      className="[transition:d_200ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
      style={{ d: `path("${d}")` } as React.CSSProperties}
    />
  );
}
