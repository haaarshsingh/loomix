"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  IconMaximize,
  IconMinimize,
  IconPictureInPicture,
  IconPictureInPictureOff,
  IconVolume,
  IconVolume2,
  IconVolume3,
} from "@tabler/icons-react";
import { CaptionsIcon } from "./player/captions-icon";
import { CenterControls } from "./player/center-controls";
import { ControlButton } from "./player/control-button";
import { useHasHover, useIsMdUp, useTriggerRect } from "./player/hooks";
import { useLiquidGlass } from "./player/liquid-glass";
import { LoadingSkeleton } from "./player/loading-skeleton";
import { PlayPauseIcon } from "./player/play-pause-icon";
import { SeekBar } from "./player/seek-bar";
import { SpeedPopover } from "./player/speed-popover";
import { TopBar } from "./player/top-bar";
import { usePlayerKeyboard } from "./player/use-player-keyboard";
import { cn, EASE, formatTime, SPEEDS, type Speed } from "./player/utils";
import { VolumePopover } from "./player/volume-popover";
import type { LoomixCaption, LoomixPlayerProps } from "./player/types";

export type { LoomixCaption, LoomixPlayerProps };

/**
 * `LoomixPlayer` is a polished React video player with custom controls:
 * play / pause, scrubbable progress, volume, playback speed, captions toggle,
 * picture-in-picture, fullscreen and an optional "Watch on YouTube" link.
 *
 * It is styled with Tailwind and animates with `motion`. The component is
 * self-contained: drop it into any layout and pass a `src`.
 */
export function LoomixPlayer({
  src,
  poster,
  title,
  youtubeUrl,
  onClose,
  captions,
  ariaLabel,
  autoPlay = false,
  autoFocus = false,
  muted = false,
  loop = false,
  disablePictureInPicture = false,
  disableSkip = false,
  disableVolume = false,
  disableSpeed = false,
  disableFullscreen = false,
  loading = false,
  className,
  videoClassName,
  onPlayingChange,
}: LoomixPlayerProps) {
  const hasCaptions = !!captions && captions.length > 0;
  // With every optional control hidden, collapse the bottom bar into a single
  // inline row: play button · seek bar · time.
  const inlineControls =
    !hasCaptions &&
    disableSkip &&
    disableVolume &&
    disableSpeed &&
    disablePictureInPicture &&
    disableFullscreen;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = React.useRef<number | null>(null);
  const speedTriggerRef = React.useRef<HTMLDivElement | null>(null);
  const speedPopoverRef = React.useRef<HTMLDivElement | null>(null);
  const volumeTriggerRef = React.useRef<HTMLDivElement | null>(null);
  const volumePopoverRef = React.useRef<HTMLDivElement | null>(null);
  const volumeCloseTimerRef = React.useRef<number | null>(null);

  const hasHover = useHasHover();
  const isMdUp = useIsMdUp();

  // Sizes must match the buttons' Tailwind classes (h-16/md:h-[88px] and
  // h-12/md:h-[66px]) because a backdrop-filter displacement map doesn't
  // scale with the element.
  const playGlass = useLiquidGlass(isMdUp ? 88 : 64);
  const skipGlass = useLiquidGlass(isMdUp ? 66 : 48);
  const reactId = React.useId();
  const glassFilterId = `loomix-glass-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [portalMounted, setPortalMounted] = React.useState(false);
  React.useEffect(() => setPortalMounted(true), []);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(muted);
  const [speed, setSpeed] = React.useState<Speed>(1);
  const [captionsEnabled, setCaptionsEnabled] = React.useState(
    () => captions?.some((track) => track.default) ?? false,
  );
  const [isPip, setIsPip] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [speedOpen, setSpeedOpen] = React.useState(false);
  const [highlightedSpeedIndex, setHighlightedSpeedIndex] =
    React.useState<number>(-1);
  const [volumeOpen, setVolumeOpen] = React.useState(false);
  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const [hoverPercent, setHoverPercent] = React.useState<number | null>(null);

  const controlsLocked = speedOpen || volumeOpen || isScrubbing || !isPlaying;
  // The center cluster stays mounted and only fades, so its backdrop-filter
  // (SVG displacement maps) stays decoded/compiled and reappears instantly.
  const centerControlsVisible = showControls || controlsLocked;

  const speedRect = useTriggerRect(speedTriggerRef, speedOpen);
  const volumeRect = useTriggerRect(volumeTriggerRef, volumeOpen);

  const cancelVolumeClose = React.useCallback(() => {
    if (volumeCloseTimerRef.current !== null) {
      window.clearTimeout(volumeCloseTimerRef.current);
      volumeCloseTimerRef.current = null;
    }
  }, []);
  const openVolume = React.useCallback(() => {
    cancelVolumeClose();
    setVolumeOpen(true);
  }, [cancelVolumeClose]);
  // Hover-close uses a short grace period so the mouse can move from the
  // button into the (now portaled) slider without crossing into a "leave".
  const deferVolumeClose = React.useCallback(() => {
    cancelVolumeClose();
    volumeCloseTimerRef.current = window.setTimeout(() => {
      setVolumeOpen(false);
      volumeCloseTimerRef.current = null;
    }, 140);
  }, [cancelVolumeClose]);
  React.useEffect(() => () => cancelVolumeClose(), [cancelVolumeClose]);

  React.useEffect(() => {
    if (!speedOpen) return;
    const handler = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (speedTriggerRef.current?.contains(target)) return;
      if (speedPopoverRef.current?.contains(target)) return;
      setSpeedOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [speedOpen]);

  React.useEffect(() => {
    if (!volumeOpen) return;
    const handler = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (volumeTriggerRef.current?.contains(target)) return;
      if (volumePopoverRef.current?.contains(target)) return;
      setVolumeOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [volumeOpen]);

  const scheduleHide = React.useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
    if (controlsLocked) {
      setShowControls(true);
      return;
    }
    hideTimerRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2200);
  }, [controlsLocked]);

  const revealControls = React.useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  React.useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [scheduleHide]);

  React.useEffect(() => {
    if (!autoFocus) return;
    // Focus on the next frame so the element is mounted and the parent
    // (e.g. a modal animating in) isn't fighting for focus.
    const id = window.requestAnimationFrame(() => {
      containerRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [autoFocus]);

  React.useEffect(() => {
    if (!speedOpen) {
      setHighlightedSpeedIndex(-1);
      return;
    }
    const currentIndex = SPEEDS.indexOf(speed);
    setHighlightedSpeedIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [speedOpen, speed]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
  }, [speed]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      const track = tracks[i];
      if (!track) continue;
      track.mode = captionsEnabled && i === 0 ? "showing" : "hidden";
    }
  }, [captionsEnabled, captions]);

  React.useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  React.useEffect(() => {
    const handler = () => {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(fsEl === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // iOS Safari fires webkit-prefixed events on the <video> element when it
    // enters/leaves its native fullscreen player.
    const onBegin = () => setIsFullscreen(true);
    const onEnd = () => setIsFullscreen(false);
    video.addEventListener("webkitbeginfullscreen", onBegin);
    video.addEventListener("webkitendfullscreen", onEnd);
    return () => {
      video.removeEventListener("webkitbeginfullscreen", onBegin);
      video.removeEventListener("webkitendfullscreen", onEnd);
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnter = () => setIsPip(true);
    const onLeave = () => setIsPip(false);
    video.addEventListener("enterpictureinpicture", onEnter);
    video.addEventListener("leavepictureinpicture", onLeave);
    return () => {
      video.removeEventListener("enterpictureinpicture", onEnter);
      video.removeEventListener("leavepictureinpicture", onLeave);
    };
  }, []);

  const togglePlay = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const seekBy = React.useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const max = Number.isFinite(video.duration) ? video.duration : Infinity;
    video.currentTime = Math.min(max, Math.max(0, video.currentTime + delta));
  }, []);

  const toggleMute = React.useCallback(() => {
    setIsMuted((value) => !value);
  }, []);

  const togglePip = React.useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP can fail if the browser blocks it; silently ignore.
    }
  }, []);

  const toggleFullscreen = React.useCallback(async () => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el) return;
    type WebkitVideo = HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    };
    const webkitVideo = video as WebkitVideo | null;
    // Prefer the standard element-level fullscreen API (desktop + iPadOS).
    if (typeof el.requestFullscreen === "function") {
      try {
        if (document.fullscreenElement === el) {
          await document.exitFullscreen();
        } else {
          await el.requestFullscreen();
        }
        return;
      } catch {
        // Fall through to the webkit fallback below.
      }
    }
    // iPhone Safari only exposes fullscreen on the <video> element via the
    // legacy webkit API, so fall back to that.
    if (webkitVideo && typeof webkitVideo.webkitEnterFullscreen === "function") {
      try {
        if (webkitVideo.webkitDisplayingFullscreen) {
          webkitVideo.webkitExitFullscreen?.();
        } else {
          webkitVideo.webkitEnterFullscreen();
        }
      } catch {
        // Silently ignore; the browser may block the request.
      }
    }
  }, []);

  const seekToPercent = React.useCallback((percent: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const clamped = Math.max(0, Math.min(1, percent));
    video.currentTime = clamped * video.duration;
    setCurrentTime(clamped * video.duration);
  }, []);

  const onProgressPointer = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      setIsScrubbing(true);
      const rect = target.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      seekToPercent(percent);
    },
    [seekToPercent],
  );

  const onProgressMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      setHoverPercent(Math.max(0, Math.min(1, percent)));
      if (event.buttons !== 1) return;
      seekToPercent(percent);
    },
    [seekToPercent],
  );

  const onProgressLeave = React.useCallback(() => {
    setHoverPercent(null);
  }, []);

  const onProgressRelease = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // pointer may already be released; ignore.
      }
      setIsScrubbing(false);
    },
    [],
  );

  const onKeyDown = usePlayerKeyboard({
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
  });

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPercent =
    duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0;

  const VolumeIcon =
    isMuted || volume === 0
      ? IconVolume3
      : volume < 0.5
        ? IconVolume2
        : IconVolume;

  if (loading) {
    return <LoadingSkeleton ariaLabel={ariaLabel} className={className} />;
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel ?? "Video player"}
      onKeyDown={onKeyDown}
      onPointerMove={revealControls}
      onPointerLeave={() => {
        if (!controlsLocked) setShowControls(false);
      }}
      className={cn(
        "group/loomix relative isolate overflow-hidden rounded-[14px] bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        autoPlay={autoPlay}
        loop={loop}
        crossOrigin={captions ? "anonymous" : undefined}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          event.currentTarget.playbackRate = speed;
        }}
        onProgress={(event) => {
          const video = event.currentTarget;
          if (video.buffered.length > 0) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
          }
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setIsMuted(event.currentTarget.muted);
        }}
        className={cn(
          "block h-full w-full cursor-pointer object-contain bg-black",
          videoClassName,
        )}
      >
        {captions?.map((track) => (
          <track
            key={`${track.srcLang}-${track.src}`}
            kind="subtitles"
            src={track.src}
            srcLang={track.srcLang}
            label={track.label}
            default={track.default}
          />
        ))}
      </video>

      <CenterControls
        visible={centerControlsVisible}
        isPlaying={isPlaying}
        disableSkip={disableSkip}
        isMdUp={isMdUp}
        glassFilterId={glassFilterId}
        playGlass={playGlass}
        skipGlass={skipGlass}
        onTogglePlay={togglePlay}
        onSeekBy={seekBy}
      />

      <AnimatePresence>
        {(showControls || controlsLocked) &&
          (title || youtubeUrl || onClose) && (
            <TopBar title={title} youtubeUrl={youtubeUrl} onClose={onClose} />
          )}
      </AnimatePresence>

      <AnimatePresence>
        {(showControls || controlsLocked) && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-3",
              inlineControls ? "flex items-center gap-2" : "flex flex-col gap-2",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.78) 100%)",
              }}
            />

            {inlineControls && (
              <div className="pointer-events-auto text-white">
                <ControlButton
                  onClick={togglePlay}
                  label={isPlaying ? "Pause" : "Play"}
                >
                  <PlayPauseIcon isPlaying={isPlaying} className="size-[18px]" />
                </ControlButton>
              </div>
            )}

            <SeekBar
              duration={duration}
              currentTime={currentTime}
              progressPercent={progressPercent}
              bufferedPercent={bufferedPercent}
              hoverPercent={hoverPercent}
              isScrubbing={isScrubbing}
              inline={inlineControls}
              onPointerDown={onProgressPointer}
              onPointerMove={onProgressMove}
              onPointerLeave={onProgressLeave}
              onPointerRelease={onProgressRelease}
            />

            {inlineControls ? (
              <div className="inline-flex shrink-0 items-baseline gap-1 font-mono text-[12px] tabular-nums text-white/85">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/40">/</span>
                <span className="text-white/55">{formatTime(duration)}</span>
              </div>
            ) : (
              <div className="pointer-events-auto flex items-center gap-1 text-white">
                <ControlButton
                  onClick={togglePlay}
                  label={isPlaying ? "Pause" : "Play"}
                >
                  <PlayPauseIcon isPlaying={isPlaying} className="size-[18px]" />
                </ControlButton>

                {!disableVolume && (
                  <div
                    className="relative"
                    ref={volumeTriggerRef}
                    onPointerEnter={hasHover ? openVolume : undefined}
                    onPointerLeave={hasHover ? deferVolumeClose : undefined}
                  >
                    <ControlButton
                      onClick={
                        hasHover
                          ? toggleMute
                          : () => setVolumeOpen((value) => !value)
                      }
                      label={isMuted ? "Unmute" : "Mute"}
                      tooltipHidden={volumeOpen}
                    >
                      <VolumeIcon size={18} aria-hidden />
                    </ControlButton>
                  </div>
                )}

                <div className="ml-1 inline-flex items-baseline gap-1 font-mono text-[12px] tabular-nums text-white/85">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/55">{formatTime(duration)}</span>
                </div>

                <div className="ml-auto flex items-center gap-1">
                  {hasCaptions && (
                    <ControlButton
                      onClick={() => setCaptionsEnabled((v) => !v)}
                      label={
                        captionsEnabled
                          ? "Turn captions off"
                          : "Turn captions on"
                      }
                      pressed={captionsEnabled}
                    >
                      <CaptionsIcon active={captionsEnabled} />
                    </ControlButton>
                  )}

                  {!disableSpeed && (
                    <div className="relative" ref={speedTriggerRef}>
                      <ControlButton
                        onClick={() => setSpeedOpen((value) => !value)}
                        label="Playback speed"
                        pressed={speedOpen}
                        tooltipHidden={speedOpen}
                      >
                        <span className="font-mono text-[12px] tabular-nums">
                          {speed}×
                        </span>
                      </ControlButton>
                    </div>
                  )}

                  {!disablePictureInPicture && (
                    <ControlButton
                      onClick={togglePip}
                      label={
                        isPip ? "Exit picture in picture" : "Picture in picture"
                      }
                      pressed={isPip}
                    >
                      {isPip ? (
                        <IconPictureInPictureOff size={17} aria-hidden />
                      ) : (
                        <IconPictureInPicture size={17} aria-hidden />
                      )}
                    </ControlButton>
                  )}

                  {!disableFullscreen && (
                    <ControlButton
                      onClick={toggleFullscreen}
                      label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                      pressed={isFullscreen}
                    >
                      {isFullscreen ? (
                        <IconMinimize size={17} aria-hidden />
                      ) : (
                        <IconMaximize size={17} aria-hidden />
                      )}
                    </ControlButton>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {portalMounted &&
        createPortal(
          <AnimatePresence>
            {speedOpen && speedRect && (
              <SpeedPopover
                popoverRef={speedPopoverRef}
                triggerRect={speedRect}
                speed={speed}
                highlightedIndex={highlightedSpeedIndex}
                onHighlight={setHighlightedSpeedIndex}
                onSelect={(value) => {
                  setSpeed(value);
                  setSpeedOpen(false);
                }}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}

      {portalMounted &&
        createPortal(
          <AnimatePresence>
            {volumeOpen && volumeRect && (
              <VolumePopover
                popoverRef={volumePopoverRef}
                triggerRect={volumeRect}
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={(next) => {
                  setVolume(next);
                  setIsMuted(next === 0);
                }}
                onPointerEnter={hasHover ? openVolume : undefined}
                onPointerLeave={hasHover ? deferVolumeClose : undefined}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

export default LoomixPlayer;
