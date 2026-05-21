"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconBrandYoutubeFilled,
  IconCheck,
  IconMaximize,
  IconMinimize,
  IconPictureInPicture,
  IconPictureInPictureOff,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconVolume,
  IconVolume2,
  IconVolume3,
} from "@tabler/icons-react";

/**
 * A caption / subtitle track to attach to the player.
 */
export type LoomixCaption = {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
};

export type LoomixPlayerProps = {
  /** Video source URL. */
  src: string;
  /** Optional poster image shown before playback. */
  poster?: string;
  /** Optional title rendered in the top-left of the player chrome. */
  title?: string;
  /** Optional YouTube URL; when set, a "Watch on YouTube" button appears in the top-right. */
  youtubeUrl?: string;
  /** Optional close handler; when set, an X button appears in the top-right. */
  onClose?: () => void;
  /** Optional caption / subtitle tracks. */
  captions?: LoomixCaption[];
  /** Optional accessible label for the player. */
  ariaLabel?: string;
  /** Auto-play on mount. Defaults to false. */
  autoPlay?: boolean;
  /** Start muted. Defaults to false. */
  muted?: boolean;
  /** Loop video. Defaults to false. */
  loop?: boolean;
  /** Disable picture-in-picture button. */
  disablePictureInPicture?: boolean;
  /** Class name applied to the player root. */
  className?: string;
  /** Class name applied to the underlying <video> element. */
  videoClassName?: string;
  /** Called whenever play / pause state changes. */
  onPlayingChange?: (isPlaying: boolean) => void;
};

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
type Speed = (typeof SPEEDS)[number];

const EASE = [0.23, 1, 0.32, 1] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

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
  muted = false,
  loop = false,
  disablePictureInPicture = false,
  className,
  videoClassName,
  onPlayingChange,
}: LoomixPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = React.useRef<number | null>(null);

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
  const [volumeOpen, setVolumeOpen] = React.useState(false);
  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const [hoverPercent, setHoverPercent] = React.useState<number | null>(null);

  const controlsLocked = speedOpen || volumeOpen || isScrubbing || !isPlaying;

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
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Some browsers reject fullscreen requests; silently ignore.
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

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.target instanceof HTMLInputElement) return;
      const video = videoRef.current;
      if (!video) return;
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
          if (captions && captions.length > 0) {
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
    [captions, toggleFullscreen, toggleMute, togglePlay],
  );

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPercent =
    duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0;
  const hoverPx = hoverPercent !== null ? hoverPercent * 100 : null;

  const VolumeIcon = isMuted || volume === 0
    ? IconVolume3
    : volume < 0.5
      ? IconVolume2
      : IconVolume;

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

      <AnimatePresence>
        {!isPlaying && (
          <motion.button
            type="button"
            key="big-play"
            onClick={togglePlay}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18, ease: EASE }}
            aria-label="Play"
            className="absolute inset-0 m-auto inline-flex h-[88px] w-[88px] items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl hover:bg-black/55"
          >
            <IconPlayerPlayFilled size={32} aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showControls || controlsLocked) && (title || youtubeUrl || onClose) && (
          <motion.div
            key="top-bar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 px-3 pt-3"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0) 100%)",
              }}
            />

            {title ? (
              <div
                className="pointer-events-auto min-w-0 max-w-[60%] truncate pt-1 pl-1 text-[15px] font-medium text-white/95"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.55)" }}
              >
                {title}
              </div>
            ) : (
              <div />
            )}

            <div className="pointer-events-auto ml-auto flex items-center gap-1.5">
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[12.5px] font-medium text-white/90 backdrop-blur-xl transition-colors duration-150 hover:bg-black/60 hover:text-white"
                >
                  <IconBrandYoutubeFilled size={15} aria-hidden />
                  Watch on YouTube
                </a>
              )}
              {onClose && (
                <Tooltip label="Close">
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/90 backdrop-blur-xl transition-colors duration-150 hover:bg-black/60 hover:text-white"
                  >
                    <svg viewBox="0 0 16 16" width={12} height={12} aria-hidden>
                      <path
                        d="M3 3 L13 13 M13 3 L3 13"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </Tooltip>
              )}
            </div>
          </motion.div>
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
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 px-3 pb-3"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.78) 100%)",
              }}
            />

            <div
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
              tabIndex={-1}
              onPointerDown={onProgressPointer}
              onPointerMove={onProgressMove}
              onPointerLeave={onProgressLeave}
              onPointerUp={onProgressRelease}
              onPointerCancel={onProgressRelease}
              className="pointer-events-auto relative flex h-5 cursor-pointer touch-none items-center select-none"
            >
              <div className="relative h-[3px] w-full rounded-full bg-white/20">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/35"
                  style={{ width: `${bufferedPercent}%` }}
                />
                {hoverPx !== null && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-white/25"
                    style={{ width: `${hoverPx}%` }}
                  />
                )}
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
            </div>

            <div className="pointer-events-auto flex items-center gap-1 text-white">
              <ControlButton onClick={togglePlay} label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? (
                  <IconPlayerPauseFilled size={18} aria-hidden />
                ) : (
                  <IconPlayerPlayFilled size={18} aria-hidden />
                )}
              </ControlButton>

              <div
                className="relative"
                onPointerEnter={() => setVolumeOpen(true)}
                onPointerLeave={() => setVolumeOpen(false)}
              >
                <ControlButton onClick={toggleMute} label={isMuted ? "Unmute" : "Mute"}>
                  <VolumeIcon size={18} aria-hidden />
                </ControlButton>
                <AnimatePresence>
                  {volumeOpen && (
                    <motion.div
                      key="volume-popover"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16, ease: EASE }}
                      className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full border border-white/12 bg-neutral-900/85 px-2 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                      role="group"
                      aria-label="Volume"
                    >
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          setVolume(next);
                          setIsMuted(next === 0);
                        }}
                        aria-label="Volume"
                        className="loomix-volume-slider h-24 w-1.5 cursor-pointer appearance-none rounded-full bg-white/15"
                        style={{
                          writingMode: "vertical-lr",
                          direction: "rtl",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-1 inline-flex items-baseline gap-1 font-mono text-[12px] tabular-nums text-white/85">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/40">/</span>
                <span className="text-white/55">{formatTime(duration)}</span>
              </div>

              <div className="ml-auto flex items-center gap-1">
                <ControlButton
                  onClick={() => setCaptionsEnabled((v) => !v)}
                  label={captionsEnabled ? "Turn captions off" : "Turn captions on"}
                  pressed={captionsEnabled}
                  disabled={!captions || captions.length === 0}
                >
                  <CaptionsIcon active={captionsEnabled} />
                </ControlButton>

                <div className="relative">
                  <ControlButton
                    onClick={() => setSpeedOpen((value) => !value)}
                    label="Playback speed"
                    pressed={speedOpen}
                  >
                    <span className="font-mono text-[12px] tabular-nums">
                      {speed}×
                    </span>
                  </ControlButton>
                  <AnimatePresence>
                    {speedOpen && (
                      <motion.div
                        key="speed-popover"
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: EASE }}
                        role="menu"
                        aria-label="Playback speed"
                        className="absolute right-0 bottom-full mb-2 flex w-[120px] flex-col rounded-2xl border border-white/12 bg-neutral-900/90 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                      >
                        {SPEEDS.map((value) => {
                          const isCurrent = value === speed;
                          return (
                            <button
                              key={value}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isCurrent}
                              onClick={() => {
                                setSpeed(value);
                                setSpeedOpen(false);
                              }}
                              className={cn(
                                "relative flex items-center justify-between rounded-xl px-3 py-1.5 text-left text-[13px] transition-colors duration-100",
                                isCurrent
                                  ? "bg-[#2f6bff] text-white"
                                  : "text-white/85 hover:bg-white/10",
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
                    )}
                  </AnimatePresence>
                </div>

                {!disablePictureInPicture && (
                  <ControlButton
                    onClick={togglePip}
                    label={isPip ? "Exit picture in picture" : "Enter picture in picture"}
                    pressed={isPip}
                  >
                    {isPip ? (
                      <IconPictureInPictureOff size={17} aria-hidden />
                    ) : (
                      <IconPictureInPicture size={17} aria-hidden />
                    )}
                  </ControlButton>
                )}

                <ControlButton
                  onClick={toggleFullscreen}
                  label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  pressed={isFullscreen}
                >
                  {isFullscreen ? (
                    <IconMinimize size={17} aria-hidden />
                  ) : (
                    <IconMaximize size={17} aria-hidden />
                  )}
                </ControlButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .loomix-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }
        .loomix-volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }
        .loomix-volume-slider::-webkit-slider-runnable-track {
          background: transparent;
        }
        .loomix-volume-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

type ControlButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
};

function ControlButton({
  children,
  onClick,
  label,
  pressed,
  disabled,
}: ControlButtonProps) {
  return (
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
  );
}

function CaptionsIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={17}
      height={17}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x={2.5}
        y={4.5}
        width={15}
        height={11}
        rx={2.2}
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
      />
      <path
        d="M7 9.3a1.6 1.6 0 0 0-3 0v1.4a1.6 1.6 0 0 0 3 0"
        stroke={active ? "#000" : "currentColor"}
      />
      <path
        d="M13.5 9.3a1.6 1.6 0 0 0-3 0v1.4a1.6 1.6 0 0 0 3 0"
        stroke={active ? "#000" : "currentColor"}
      />
    </svg>
  );
}

export default LoomixPlayer;
