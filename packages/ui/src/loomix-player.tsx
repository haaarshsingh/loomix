"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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
  IconRotate,
  IconRotateClockwise,
  IconVolume,
  IconVolume2,
  IconVolume3,
} from "@tabler/icons-react";

const SKIP_SECONDS = 15;

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
  /** Move keyboard focus to the player on mount so its shortcuts work immediately. Defaults to false. */
  autoFocus?: boolean;
  /** Start muted. Defaults to false. */
  muted?: boolean;
  /** Loop video. Defaults to false. */
  loop?: boolean;
  /** Hide the picture-in-picture button. */
  disablePictureInPicture?: boolean;
  /** Hide the skip backward / forward (±15s) buttons. */
  disableSkip?: boolean;
  /** Hide the volume / mute control. */
  disableVolume?: boolean;
  /** Hide the playback speed control. */
  disableSpeed?: boolean;
  /** Hide the fullscreen button. */
  disableFullscreen?: boolean;
  /** Class name applied to the player root. */
  className?: string;
  /** Class name applied to the underlying <video> element. */
  videoClassName?: string;
  /** Called whenever play / pause state changes. */
  onPlayingChange?: (isPlaying: boolean) => void;
} & (
  | {
      /** Video source URL. */
      src: string;
      /** Render a shimmer loading skeleton instead of the video. */
      loading?: boolean;
    }
  | {
      /** Video source URL. Optional while `loading`. */
      src?: undefined;
      /** Render a shimmer loading skeleton instead of the video. */
      loading: true;
    }
);

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
 * Returns `true` on devices whose primary input supports hover (mouse / trackpad),
 * `false` on touch-only devices. Defaults to `true` during SSR / first paint so the
 * desktop layout doesn't flash on hydration.
 */
function useHasHover(): boolean {
  const [hasHover, setHasHover] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    setHasHover(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setHasHover(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return hasHover;
}

/** `true` once the viewport is at or above Tailwind's `md` breakpoint (768px). */
function useIsMdUp(): boolean {
  const [isMdUp, setIsMdUp] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMdUp(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMdUp(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMdUp;
}

/* ----------------------------------------------------------------------------
 * Liquid glass refraction (after https://kube.io/blog/liquid-glass-css-svg/):
 * simulate light refracting through a circular glass button (Snell's law on a
 * convex-squircle bezel profile), bake the resulting radial displacement field
 * into an SVG displacement map (R = x, G = y, 128 = neutral), and apply it to
 * the backdrop via `backdrop-filter: url(#filter)` (Chromium-only; elsewhere
 * the buttons fall back to their regular backdrop blur).
 * ------------------------------------------------------------------------- */

const GLASS_IOR = 1.5;

/** Apple-style convex squircle bezel profile: y = (1 - (1 - x)^4)^(1/4). */
function convexSquircleHeight(x: number): number {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
}

type GlassAssets = { displacementUrl: string; specularUrl: string; scale: number };

/**
 * Builds the two filter images for a circular glass button of `size` px:
 *
 * 1. A displacement map (R = x, G = y, 128 = neutral) combining a Snell's-law
 *    bezel refraction (ray-traced over the squircle profile, symmetric around
 *    the rim so a single radius is simulated and rotated) with an interior
 *    lens magnification, sampling inward like the article's magnifying glass.
 * 2. A specular rim-light image (white, alpha-encoded) blended over the
 *    refracted backdrop with `feBlend mode="screen"`.
 */
function buildGlassAssets(size: number): GlassAssets {
  const radius = size / 2;
  const bezelWidth = radius * 0.5;
  const glassHeight = radius * 0.75;
  // Interior zoom: sample offset grows linearly from the centre, i.e. the
  // backdrop under the flat part of the glass is uniformly magnified.
  const zoom = 0.2;
  // Artistic boost on top of the physical magnitudes (the article: scale can
  // be tweaked/animated freely without recomputing the map).
  const REFRACTION_BOOST = 2;

  // Pre-calculate bezel displacement magnitudes along one radius
  // (127 samples, matching the 8-bit displacement map resolution).
  const SAMPLES = 127;
  const bezelMagnitudes = new Float64Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    const x = i / (SAMPLES - 1);
    const delta = 0.001;
    const x1 = Math.max(x - delta, 0);
    const x2 = Math.min(x + delta, 1);
    const slope =
      ((convexSquircleHeight(x2) - convexSquircleHeight(x1)) / (x2 - x1)) *
      (glassHeight / bezelWidth);
    const theta1 = Math.atan(Math.abs(slope));
    const theta2 = Math.asin(Math.sin(theta1) / GLASS_IOR);
    const height = convexSquircleHeight(x) * glassHeight;
    bezelMagnitudes[i] = height * Math.tan(theta1 - theta2);
  }

  const magnitudeAt = (dist: number): number => {
    const zoomMagnitude = dist * zoom;
    const fromEdge = radius - dist;
    if (fromEdge >= bezelWidth) return zoomMagnitude;
    const t = Math.max(fromEdge / bezelWidth, 0);
    const index = Math.min(SAMPLES - 1, Math.round(t * (SAMPLES - 1)));
    return Math.max(bezelMagnitudes[index]!, zoomMagnitude);
  };

  let maxMagnitude = 0;
  for (let d = 0; d <= radius; d += 0.25) {
    maxMagnitude = Math.max(maxMagnitude, magnitudeAt(d));
  }

  const displacement = document.createElement("canvas");
  displacement.width = size;
  displacement.height = size;
  const displacementCtx = displacement.getContext("2d")!;
  const displacementImage = displacementCtx.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px + 0.5 - radius;
      const dy = py + 0.5 - radius;
      const dist = Math.hypot(dx, dy);
      let r = 128;
      let g = 128;
      if (dist > 0 && dist <= radius && maxMagnitude > 0) {
        const magnitude = magnitudeAt(dist) / maxMagnitude;
        // Convex glass bends rays toward the centre: sample inward so the
        // backdrop appears magnified through the lens.
        r = Math.round(128 + (-dx / dist) * magnitude * 127);
        g = Math.round(128 + (-dy / dist) * magnitude * 127);
      }
      const offset = (py * size + px) * 4;
      displacementImage.data[offset] = r;
      displacementImage.data[offset + 1] = g;
      displacementImage.data[offset + 2] = 128;
      displacementImage.data[offset + 3] = 255;
    }
  }
  displacementCtx.putImageData(displacementImage, 0, 0);

  // Specular rim light: intensity peaks mid-rim and varies with the angle
  // between the rim normal and a fixed light direction, with a fainter
  // counter-light on the opposite edge.
  const specular = document.createElement("canvas");
  specular.width = size;
  specular.height = size;
  const specularCtx = specular.getContext("2d")!;
  const specularImage = specularCtx.createImageData(size, size);
  const rimWidth = Math.max(2, radius * 0.22);
  const lightAngle = -Math.PI * 0.75; // top-left
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px + 0.5 - radius;
      const dy = py + 0.5 - radius;
      const dist = Math.hypot(dx, dy);
      let alpha = 0;
      const fromEdge = radius - dist;
      if (dist > 0 && fromEdge >= 0 && fromEdge < rimWidth) {
        const band = Math.sin((1 - fromEdge / rimWidth) * Math.PI * 0.5);
        const angle = Math.atan2(dy, dx);
        const main = Math.pow(Math.max(Math.cos(angle - lightAngle), 0), 2);
        const counter = Math.pow(
          Math.max(Math.cos(angle - lightAngle - Math.PI), 0),
          2,
        );
        alpha = Math.round(band * (main + counter * 0.45) * 0.9 * 255);
      }
      const offset = (py * size + px) * 4;
      specularImage.data[offset] = 255;
      specularImage.data[offset + 1] = 255;
      specularImage.data[offset + 2] = 255;
      specularImage.data[offset + 3] = alpha;
    }
  }
  specularCtx.putImageData(specularImage, 0, 0);

  // The map is normalized to the max displacement, so the max (in px) drives
  // the filter's `scale`.
  return {
    displacementUrl: displacement.toDataURL(),
    specularUrl: specular.toDataURL(),
    scale: maxMagnitude * REFRACTION_BOOST,
  };
}

/** Client-side liquid glass filter images for a circular button of `size` px. */
function useLiquidGlass(size: number): GlassAssets | null {
  const [assets, setAssets] = React.useState<GlassAssets | null>(null);
  React.useEffect(() => {
    setAssets(buildGlassAssets(size));
  }, [size]);
  return assets;
}

/**
 * SVG filter combining refraction and the specular highlight: displace the
 * backdrop through the lens map, then screen the rim light over the result.
 */
function GlassFilter({
  id,
  assets,
  size,
}: {
  id: string;
  assets: GlassAssets;
  size: number;
}) {
  return (
    <filter
      id={id}
      x="0"
      y="0"
      width="100%"
      height="100%"
      colorInterpolationFilters="sRGB"
    >
      <feImage
        href={assets.displacementUrl}
        x={0}
        y={0}
        width={size}
        height={size}
        result="displacement_map"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="displacement_map"
        scale={assets.scale}
        xChannelSelector="R"
        yChannelSelector="G"
        result="refracted"
      />
      <feImage
        href={assets.specularUrl}
        x={0}
        y={0}
        width={size}
        height={size}
        result="specular"
      />
      <feBlend in="specular" in2="refracted" mode="screen" />
    </filter>
  );
}

/**
 * Tracks the bounding rect of `ref` while `open` is true, updating on resize and
 * scroll so portaled popovers can follow their trigger.
 */
function useTriggerRect(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
): DOMRect | null {
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  React.useEffect(() => {
    if (!open || !ref.current) {
      setRect(null);
      return;
    }
    const update = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, ref]);
  return rect;
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

  // Sizes must match the buttons' Tailwind classes (h-11/md:h-[88px] and
  // h-[33px]/md:h-[66px]) because a backdrop-filter displacement map doesn't
  // scale with the element.
  const playGlass = useLiquidGlass(isMdUp ? 88 : 44);
  const skipGlass = useLiquidGlass(isMdUp ? 66 : 33);
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

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.target instanceof HTMLInputElement) return;
      const video = videoRef.current;
      if (!video) return;
      // While the speed popover is open, the arrow keys (and Enter/Esc)
      // drive the dropdown instead of seeking/volume.
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
    [
      captions,
      highlightedSpeedIndex,
      speedOpen,
      toggleFullscreen,
      toggleMute,
      togglePlay,
    ],
  );

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
    return (
      <div
        role="status"
        aria-label={ariaLabel ?? "Loading video"}
        className={cn(
          "relative overflow-hidden rounded-[14px] bg-neutral-900",
          className,
        )}
      >
        {/* Band is w-1/2 of the container; x is relative to the band's own
            width, so -120% starts fully off the left edge and 220% exits
            fully past the right edge (with margin for the skew). */}
        <motion.div
          aria-hidden
          className="absolute inset-y-0 w-1/2 will-change-transform"
          style={{
            skewX: -25,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
          }}
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
        />
      </div>
    );
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

      <svg aria-hidden width="0" height="0" className="absolute">
        {playGlass && (
          <GlassFilter
            id={`${glassFilterId}-play`}
            assets={playGlass}
            size={isMdUp ? 88 : 44}
          />
        )}
        {skipGlass && (
          <GlassFilter
            id={`${glassFilterId}-skip`}
            assets={skipGlass}
            size={isMdUp ? 66 : 33}
          />
        )}
      </svg>

      {/* The reveal fades each button's own opacity (plain CSS): animating
          scale would re-rasterize the SVG backdrop filter every frame
          (jitter), and fading an ancestor group would turn it into the
          backdrop root, cutting the video out of the buttons' backdrop and
          killing the glass effect entirely. */}
      <div
            aria-hidden={!centerControlsVisible}
            className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2"
          >
            {!disableSkip && (
              <button
                type="button"
                onClick={() => seekBy(-SKIP_SECONDS)}
                aria-label={`Back ${SKIP_SECONDS} seconds`}
                tabIndex={centerControlsVisible ? undefined : -1}
                className={cn(
                  "group/skip inline-flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[background-color,scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black/25 active:scale-[0.97] motion-reduce:transition-none md:h-[66px] md:w-[66px]",
                  centerControlsVisible
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0",
                )}
                style={
                  skipGlass
                    ? { backdropFilter: `url(#${glassFilterId}-skip)` }
                    : undefined
                }
              >
                <span
                  aria-hidden
                  className="inline-flex transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-active/skip:-rotate-[20deg] motion-reduce:transition-none"
                >
                  <IconRotate
                    className="size-3 md:size-6"
                    style={{ transform: "scaleX(-1) scaleY(-1)" }}
                  />
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              tabIndex={centerControlsVisible ? undefined : -1}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[background-color,scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black/25 active:scale-[0.97] motion-reduce:transition-none md:h-[88px] md:w-[88px]",
                centerControlsVisible
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0",
              )}
              style={
                playGlass
                  ? { backdropFilter: `url(#${glassFilterId}-play)` }
                  : undefined
              }
            >
              {/* Play/pause cross-fade: both icons stacked in one grid cell,
                  swapped with opacity + scale (+ a touch of blur to mask the
                  crossfade). */}
              <span className="relative inline-grid place-items-center">
                <span
                  aria-hidden
                  className={cn(
                    "col-start-1 row-start-1 inline-flex transition-[opacity,scale,filter] duration-200 ease-in-out motion-reduce:transition-none",
                    isPlaying
                      ? "scale-100 opacity-100 blur-none"
                      : "scale-[0.25] opacity-0 blur-[2px]",
                  )}
                >
                  <IconPlayerPauseFilled className="size-4 md:size-8" />
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "col-start-1 row-start-1 inline-flex transition-[opacity,scale,filter] duration-200 ease-in-out motion-reduce:transition-none",
                    isPlaying
                      ? "scale-[0.25] opacity-0 blur-[2px]"
                      : "scale-100 opacity-100 blur-none",
                  )}
                >
                  <IconPlayerPlayFilled className="size-4 md:size-8" />
                </span>
              </span>
            </button>

            {!disableSkip && (
              <button
                type="button"
                onClick={() => seekBy(SKIP_SECONDS)}
                aria-label={`Forward ${SKIP_SECONDS} seconds`}
                tabIndex={centerControlsVisible ? undefined : -1}
                className={cn(
                  "group/skip inline-flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[background-color,scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black/25 active:scale-[0.97] motion-reduce:transition-none md:h-[66px] md:w-[66px]",
                  centerControlsVisible
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0",
                )}
                style={
                  skipGlass
                    ? { backdropFilter: `url(#${glassFilterId}-skip)` }
                    : undefined
                }
              >
                <span
                  aria-hidden
                  className="inline-flex transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-active/skip:rotate-[20deg] motion-reduce:transition-none"
                >
                  <IconRotateClockwise
                    className="size-3 md:size-6"
                    style={{ transform: "scaleX(-1) scaleY(-1)" }}
                  />
                </span>
              </button>
            )}
          </div>

      <AnimatePresence>
        {(showControls || controlsLocked) &&
          (title || youtubeUrl || onClose) && (
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
                  <Tooltip label="Close" side="bottom">
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/90 backdrop-blur-xl transition-colors duration-150 hover:bg-black/60 hover:text-white"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        width={12}
                        height={12}
                        aria-hidden
                      >
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
                  {isPlaying ? (
                    <IconPlayerPauseFilled size={18} aria-hidden />
                  ) : (
                    <IconPlayerPlayFilled size={18} aria-hidden />
                  )}
                </ControlButton>
              </div>
            )}

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
              className={cn(
                "pointer-events-auto relative flex h-5 cursor-crosshair touch-none items-center select-none",
                inlineControls && "min-w-0 flex-1",
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
                      transition:
                        "transform 150ms cubic-bezier(0.23, 1, 0.32, 1)",
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
                  <span className="text-white/45">
                    {" "}
                    / {formatTime(duration)}
                  </span>
                </div>
              )}
            </div>

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
                {isPlaying ? (
                  <IconPlayerPauseFilled size={18} aria-hidden />
                ) : (
                  <IconPlayerPlayFilled size={18} aria-hidden />
                )}
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
                      captionsEnabled ? "Turn captions off" : "Turn captions on"
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
              <motion.div
                key="speed-popover"
                ref={speedPopoverRef}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: EASE }}
                role="menu"
                aria-label="Playback speed"
                style={{
                  position: "fixed",
                  bottom:
                    document.documentElement.clientHeight - speedRect.top + 8,
                  right:
                    document.documentElement.clientWidth - speedRect.right,
                  zIndex: 60,
                }}
                className="flex w-[120px] flex-col rounded-2xl border border-white/12 bg-neutral-900/90 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                {SPEEDS.map((value, idx) => {
                  const isCurrent = value === speed;
                  const isHighlighted = idx === highlightedSpeedIndex;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isCurrent}
                      data-highlighted={isHighlighted ? "true" : undefined}
                      onMouseEnter={() => setHighlightedSpeedIndex(idx)}
                      onClick={() => {
                        setSpeed(value);
                        setSpeedOpen(false);
                      }}
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
                          <span
                            className="inline-block w-[13px]"
                            aria-hidden
                          />
                        )}
                        {value}×
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {portalMounted &&
        createPortal(
          <AnimatePresence>
            {volumeOpen && volumeRect && (
              <motion.div
                key="volume-popover"
                ref={volumePopoverRef}
                initial={{ opacity: 0, y: 6, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 6, x: "-50%" }}
                transition={{ duration: 0.16, ease: EASE }}
                role="group"
                aria-label="Volume"
                style={{
                  position: "fixed",
                  bottom:
                    document.documentElement.clientHeight - volumeRect.top + 8,
                  left: volumeRect.left + volumeRect.width / 2,
                  zIndex: 60,
                }}
                className="rounded-full border border-white/12 bg-neutral-900/85 px-2 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                onPointerEnter={hasHover ? openVolume : undefined}
                onPointerLeave={hasHover ? deferVolumeClose : undefined}
              >
                <div className="relative h-20 w-2.5">
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="absolute inset-x-0 bottom-0 bg-white"
                      style={{
                        height: `${(isMuted ? 0 : volume) * 100}%`,
                      }}
                    />
                  </div>
                  <div
                    className="pointer-events-none absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                    style={{
                      bottom: `calc(${(isMuted ? 0 : volume) * 100}% - 5px)`,
                    }}
                  />
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
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    style={{
                      writingMode: "vertical-lr",
                      direction: "rtl",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

type TooltipSide = "top" | "bottom";
type TooltipAlign = "start" | "center" | "end";

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

function ControlButton({
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

function Tooltip({
  label,
  children,
  hidden,
  side = "top",
  align = "center",
}: {
  label: string;
  children: React.ReactNode;
  hidden?: boolean;
  side?: TooltipSide;
  align?: TooltipAlign;
}) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      if (triggerRef.current) {
        setRect(triggerRef.current.getBoundingClientRect());
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  const show = open && !hidden;
  const positionStyle: React.CSSProperties = rect
    ? computeTooltipPosition(rect, side, align)
    : {};
  const transformOrigin = side === "top" ? "50% 100%" : "50% 0%";
  const hiddenTranslate = side === "top" ? "translateY(2px)" : "translateY(-2px)";

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex"
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
      >
        {children}
      </span>
      {mounted &&
        rect &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[60]"
            style={positionStyle}
          >
            <span
              role="tooltip"
              aria-hidden={!show}
              className={cn(
                "block whitespace-nowrap rounded-md border border-white/10 bg-black/85 px-2 py-1 text-[11px] font-medium text-white shadow-[0_4px_18px_rgba(0,0,0,0.45)] backdrop-blur-xl",
                "transition-[opacity,transform] duration-150 ease-out",
                show ? "opacity-100" : "opacity-0",
              )}
              style={{
                transformOrigin,
                transform: show ? "scale(1)" : `scale(0.96) ${hiddenTranslate}`,
              }}
            >
              {label}
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}

function computeTooltipPosition(
  rect: DOMRect,
  side: TooltipSide,
  align: TooltipAlign,
): React.CSSProperties {
  const GAP = 8;
  const top = side === "top" ? rect.top - GAP : rect.bottom + GAP;
  const yTranslate = side === "top" ? "-100%" : "0%";
  if (align === "start") {
    return { top, left: rect.left, transform: `translate(0, ${yTranslate})` };
  }
  if (align === "end") {
    return {
      top,
      left: rect.right,
      transform: `translate(-100%, ${yTranslate})`,
    };
  }
  return {
    top,
    left: rect.left + rect.width / 2,
    transform: `translate(-50%, ${yTranslate})`,
  };
}

function CaptionsIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      aria-hidden
      fill="currentColor"
    >
      {active ? (
        <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-9 6H8v4h3v2H8c-1.103 0-2-.897-2-2v-4c0-1.103.897-2 2-2h3v2zm7 0h-3v4h3v2h-3c-1.103 0-2-.897-2-2v-4c0-1.103.897-2 2-2h3v2z" />
      ) : (
        <>
          <path d="M6 10v4c0 1.103.897 2 2 2h3v-2H8v-4h3V8H8c-1.103 0-2 .897-2 2zm7 0v4c0 1.103.897 2 2 2h3v-2h-3v-4h3V8h-3c-1.103 0-2 .897-2 2z" />
          <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.002 12H4z" />
        </>
      )}
    </svg>
  );
}

export default LoomixPlayer;
