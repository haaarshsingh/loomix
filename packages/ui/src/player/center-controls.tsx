"use client";

import * as React from "react";
import { IconRotate, IconRotateClockwise } from "@tabler/icons-react";
import { GlassFilter, type GlassAssets } from "./liquid-glass";
import { PlayPauseIcon } from "./play-pause-icon";
import { cn, SKIP_SECONDS } from "./utils";

const GLASS_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full border border-white/25 bg-black/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[background-color,scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black/25 active:scale-[0.97] motion-reduce:transition-none";

type CenterControlsProps = {
  visible: boolean;
  isPlaying: boolean;
  disableSkip: boolean;
  isMdUp: boolean;
  glassFilterId: string;
  playGlass: GlassAssets | null;
  skipGlass: GlassAssets | null;
  onTogglePlay: () => void;
  onSeekBy: (delta: number) => void;
};

/**
 * The centered liquid-glass play / skip cluster, plus the hidden SVG element
 * hosting the glass displacement filters it references.
 */
export function CenterControls({
  visible,
  isPlaying,
  disableSkip,
  isMdUp,
  glassFilterId,
  playGlass,
  skipGlass,
  onTogglePlay,
  onSeekBy,
}: CenterControlsProps) {
  const skipStyle = skipGlass
    ? { backdropFilter: `url(#${glassFilterId}-skip)` }
    : undefined;

  return (
    <>
      <svg aria-hidden width="0" height="0" className="absolute">
        {playGlass && (
          <GlassFilter
            id={`${glassFilterId}-play`}
            assets={playGlass}
            size={isMdUp ? 88 : 64}
          />
        )}
        {skipGlass && (
          <GlassFilter
            id={`${glassFilterId}-skip`}
            assets={skipGlass}
            size={isMdUp ? 66 : 48}
          />
        )}
      </svg>

      {/* The reveal fades each button's own opacity (plain CSS): animating
          scale would re-rasterize the SVG backdrop filter every frame
          (jitter), and fading an ancestor group would turn it into the
          backdrop root, cutting the video out of the buttons' backdrop and
          killing the glass effect entirely. */}
      <div
        aria-hidden={!visible}
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2"
      >
        {!disableSkip && (
          <SkipButton
            direction="back"
            visible={visible}
            style={skipStyle}
            onClick={() => onSeekBy(-SKIP_SECONDS)}
          />
        )}

        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          tabIndex={visible ? undefined : -1}
          className={cn(
            GLASS_BUTTON_CLASS,
            "h-16 w-16 md:h-[88px] md:w-[88px]",
            visible
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          style={
            playGlass
              ? { backdropFilter: `url(#${glassFilterId}-play)` }
              : undefined
          }
        >
          <PlayPauseIcon isPlaying={isPlaying} className="size-6 md:size-8" />
        </button>

        {!disableSkip && (
          <SkipButton
            direction="forward"
            visible={visible}
            style={skipStyle}
            onClick={() => onSeekBy(SKIP_SECONDS)}
          />
        )}
      </div>
    </>
  );
}

function SkipButton({
  direction,
  visible,
  style,
  onClick,
}: {
  direction: "back" | "forward";
  visible: boolean;
  style?: React.CSSProperties;
  onClick: () => void;
}) {
  const isBack = direction === "back";
  const Icon = isBack ? IconRotate : IconRotateClockwise;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${isBack ? "Back" : "Forward"} ${SKIP_SECONDS} seconds`}
      tabIndex={visible ? undefined : -1}
      className={cn(
        "group/skip shrink-0",
        GLASS_BUTTON_CLASS,
        "h-12 w-12 md:h-[66px] md:w-[66px]",
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
      style={style}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          isBack
            ? "group-active/skip:-rotate-[20deg]"
            : "group-active/skip:rotate-[20deg]",
        )}
      >
        <Icon
          className="size-4 md:size-6"
          style={{ transform: "scaleX(-1) scaleY(-1)" }}
        />
      </span>
    </button>
  );
}
