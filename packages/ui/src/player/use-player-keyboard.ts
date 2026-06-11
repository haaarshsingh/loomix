"use client";

import * as React from "react";
import { SPEEDS, type Speed } from "./utils";

type PlayerKeyboardOptions = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  hasCaptions: boolean;
  speedOpen: boolean;
  highlightedSpeedIndex: number;
  setHighlightedSpeedIndex: React.Dispatch<React.SetStateAction<number>>;
  setSpeed: (speed: Speed) => void;
  setSpeedOpen: (open: boolean) => void;
  setCaptionsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  setIsMuted: (muted: boolean) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => Promise<void>;
};

/**
 * Keyboard shortcuts for the player root: space/K play, M mute, F fullscreen,
 * C captions, arrows seek / volume. While the speed popover is open, the
 * arrow keys (and Enter / Esc) drive the dropdown instead.
 */
export function usePlayerKeyboard({
  videoRef,
  hasCaptions,
  speedOpen,
  highlightedSpeedIndex,
  setHighlightedSpeedIndex,
  setSpeed,
  setSpeedOpen,
  setCaptionsEnabled,
  setVolume,
  setIsMuted,
  togglePlay,
  toggleMute,
  toggleFullscreen,
}: PlayerKeyboardOptions) {
  return React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.target instanceof HTMLInputElement) return;
      const video = videoRef.current;
      if (!video) return;
      if (speedOpen) {
        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            setHighlightedSpeedIndex((i) =>
              Math.min(SPEEDS.length - 1, (i < 0 ? -1 : i) + 1),
            );
            return;
          }
          case "ArrowUp": {
            event.preventDefault();
            setHighlightedSpeedIndex((i) =>
              Math.max(0, (i < 0 ? SPEEDS.length : i) - 1),
            );
            return;
          }
          case "Home": {
            event.preventDefault();
            setHighlightedSpeedIndex(0);
            return;
          }
          case "End": {
            event.preventDefault();
            setHighlightedSpeedIndex(SPEEDS.length - 1);
            return;
          }
          case "Enter":
          case " ": {
            event.preventDefault();
            const next = SPEEDS[highlightedSpeedIndex];
            if (next !== undefined) setSpeed(next);
            setSpeedOpen(false);
            return;
          }
          case "Escape":
          case "Tab": {
            event.preventDefault();
            setSpeedOpen(false);
            return;
          }
          default:
            return;
        }
      }
      switch (event.key) {
        case " ":
        case "k":
        case "K": {
          event.preventDefault();
          togglePlay();
          break;
        }
        case "m":
        case "M": {
          event.preventDefault();
          toggleMute();
          break;
        }
        case "f":
        case "F": {
          event.preventDefault();
          void toggleFullscreen();
          break;
        }
        case "c":
        case "C": {
          if (hasCaptions) {
            event.preventDefault();
            setCaptionsEnabled((value) => !value);
          }
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          video.currentTime = Math.min(
            video.duration || video.currentTime + 5,
            video.currentTime + 5,
          );
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          setVolume((v) => Math.min(1, v + 0.05));
          setIsMuted(false);
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          setVolume((v) => Math.max(0, v - 0.05));
          break;
        }
        default:
          break;
      }
    },
    [
      videoRef,
      hasCaptions,
      speedOpen,
      highlightedSpeedIndex,
      setHighlightedSpeedIndex,
      setSpeed,
      setSpeedOpen,
      setCaptionsEnabled,
      setVolume,
      setIsMuted,
      togglePlay,
      toggleMute,
      toggleFullscreen,
    ],
  );
}
