"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import Image from "next/image";

type Episode = {
  id: string;
  country: string;
  region: string;
  title: string;
  description: string;
  src: string;
  duration: string;
  date: string;
};

const EPISODES: Episode[] = [
  {
    id: "croatia",
    country: "Croatia",
    region: "Southeast Europe",
    title: "Croatia",
    description:
      "Limestone islands rise from a sea the color of cut glass. A series of conversations along the Dalmatian coast, where stone, salt, and centuries shape the shoreline.",
    src: "/croatia.webm",
    duration: "4 min",
    date: "Mar 4, 2026",
  },
  {
    id: "kyrgyzstan",
    country: "Kyrgyzstan",
    region: "Central Asia",
    title: "Kyrgyzstan",
    description:
      "In the high pastures of the Tien Shan, the day still follows the horse. Herders, felt-makers, and the small communities holding the rhythm of the steppe.",
    src: "/kyrgyzstan.webm",
    duration: "5 min",
    date: "Mar 18, 2026",
  },
  {
    id: "laos",
    country: "Laos",
    region: "Southeast Asia",
    title: "Laos",
    description:
      "Morning mist on the Mekong, gilded temples, the slow arithmetic of a river country. A study of patience, devotion, and the craft of unhurried places.",
    src: "/laos.webm",
    duration: "4 min",
    date: "Apr 1, 2026",
  },
  {
    id: "new-zealand",
    country: "New Zealand",
    region: "South Pacific",
    title: "New Zealand",
    description:
      "Glaciers, fjords, and roads that disappear into green. From the Southern Alps to the coast, a portrait of a country that keeps its scale to itself.",
    src: "/new-zealand.webm",
    duration: "6 min",
    date: "Apr 15, 2026",
  },
  {
    id: "peru",
    country: "Peru",
    region: "South America",
    title: "Peru",
    description:
      "Stonework that outlasted empires, and altitudes where the air thins to a whisper. The Sacred Valley as it is lived in now, not only as it is remembered.",
    src: "/peru.mp4",
    duration: "5 min",
    date: "Apr 29, 2026",
  },
  {
    id: "tanzania",
    country: "Tanzania",
    region: "East Africa",
    title: "Tanzania",
    description:
      "Open plains under a sky too wide to frame. The Serengeti at the edge of the long rains, and the people who read its weather like a language.",
    src: "/tanzania.mp4",
    duration: "6 min",
    date: "May 6, 2026",
  },
  {
    id: "turks-and-caicos",
    country: "Turks & Caicos",
    region: "Caribbean",
    title: "Turks & Caicos",
    description:
      "Shallow banks of impossible blue, where the water borrows the color of the sky. A closing chapter on islands, light, and the discipline of doing less.",
    src: "/turks-and-caicos.webm",
    duration: "4 min",
    date: "May 20, 2026",
  },
];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const TAP_TRANSITION: Transition = { duration: 0.12, ease: EASE_OUT };
const THUMB_TRANSITION: Transition = { duration: 0.38, ease: EASE_OUT };
const CONTENT_ENTER: Transition = { duration: 0.5, ease: EASE_OUT };
const CONTENT_EXIT: Transition = { duration: 0.22, ease: EASE_OUT };
const BG_ENTER: Transition = { duration: 0.85, ease: EASE_OUT };
const BG_EXIT: Transition = { duration: 0.5, ease: EASE_OUT };
export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const active = EPISODES[activeIndex]!;
  const reduceMotion = useReducedMotion();

  const railRef = useRef<HTMLDivElement | null>(null);
  const playerVideoRef = useRef<HTMLVideoElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const scrollRail = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = Math.max(rail.clientWidth * 0.7, 320);
    rail.scrollBy({ left: amount * direction, behavior: "smooth" });
  }, []);

  const openPlayer = useCallback(() => setIsPlaying(true), []);
  const closePlayer = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        setIsPlaying((value) => !value);
      } else if (event.key === "Escape") {
        setIsPlaying(false);
      } else if (event.key === "ArrowRight") {
        setActiveIndex((index) => Math.min(EPISODES.length - 1, index + 1));
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((index) => Math.max(0, index - 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.children[activeIndex];
    if (!(card instanceof HTMLElement)) return;
    card.scrollIntoView({
      behavior: reduceMotion || isFirstRender.current ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
    isFirstRender.current = false;
  }, [activeIndex, reduceMotion]);

  useEffect(() => {
    const video = playerVideoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.currentTime = 0;
      video.muted = false;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, activeIndex]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--color-page)] font-sans text-neutral-100">
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: "scale(1.1)",
            filter: "blur(4px)",
          }}
        >
          <AnimatePresence initial={false}>
            <motion.video
              key={active.id}
              src={active.src}
              autoPlay
              muted
              loop
              playsInline
              initial={hasMounted ? { opacity: 0 } : false}
              animate={{ opacity: 1, transition: BG_ENTER }}
              exit={{ opacity: 0, transition: BG_EXIT }}
              className="absolute inset-0 h-full w-full object-cover brightness-[0.6] saturate-[1.05]"
            />
          </AnimatePresence>
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 28%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.95) 100%)",
          }}
        />
      </div>

      <div
        className="relative z-10 flex h-full flex-col gap-6 px-[clamp(28px,4.5vw,64px)] py-7"
        style={
          {
            "--content-left-offset":
              "max(0px, calc((100vw - 2 * clamp(28px, 4.5vw, 64px) - 600px) / 2))",
            "--rail-pad-start":
              "calc(clamp(28px, 4.5vw, 64px) + var(--content-left-offset))",
            "--rail-pad-end":
              "max(clamp(28px, 4.5vw, 64px), calc(100vw - var(--rail-pad-start) - 192px))",
          } as CSSProperties
        }
      >
        <header className="inline-flex shrink-0 items-center gap-3 text-base font-medium text-white/90">
          <Image
            src="/icon.png"
            alt=""
            aria-hidden
            draggable={false}
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="leading-tight font-semibold">Loomix</span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
          <section
            className="mx-auto w-full max-w-[600px] pb-[clamp(40px,8vh,90px)]"
            aria-live="polite"
          >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={
                hasMounted
                  ? { opacity: 0, y: 4, filter: "blur(8px)" }
                  : false
              }
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: CONTENT_ENTER,
              }}
              exit={{
                opacity: 0,
                y: -4,
                filter: "blur(6px)",
                transition: CONTENT_EXIT,
              }}
              style={{ willChange: "filter, transform, opacity" }}
            >
              <p
                className="mb-3.5 text-[11px] font-medium tracking-[0.22em] text-white/70 uppercase"
                style={{
                  fontFamily:
                    "var(--font-space-mono), ui-monospace, monospace",
                }}
              >
                {active.region}
              </p>
              <h1
                className="mb-5 text-[clamp(44px,6.2vw,84px)] leading-none font-semibold tracking-[-0.025em]"
                style={{ textShadow: "0 1px 30px rgba(0,0,0,0.45)" }}
              >
                {active.title}
              </h1>
              <p
                className="mb-6 max-w-[460px] text-[14.5px] leading-[1.6] text-balance text-white/[0.88]"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
              >
                {active.description}
              </p>

              <motion.button
                type="button"
                onClick={openPlayer}
                whileTap={{ scale: 0.97 }}
                transition={TAP_TRANSITION}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/50 px-4 py-2 text-sm font-medium text-neutral-900 backdrop-blur-[24px] backdrop-saturate-[1.4] hover:bg-white/95"
                style={{
                  background: "rgba(240,240,240,0.92)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 14px rgba(0,0,0,0.18)",
                }}
              >
                <IconPlayerPlayFilled
                  size={14}
                  className="mr-0.5 text-neutral-900"
                  aria-hidden
                />
                Play video
                <kbd
                  className="ml-1 inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-md bg-black/10 px-1.5 text-[11px] font-bold text-neutral-900/75"
                  style={{
                    fontFamily:
                      "var(--font-space-mono), ui-monospace, monospace",
                  }}
                >
                  P
                </kbd>
              </motion.button>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-white/[0.78]">
                <span>{active.date}</span>
                <span className="inline-block h-[3px] w-[3px] rounded-full bg-white/45" />
                <span>{active.duration}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
        </div>

        <section aria-label="Episodes" className="shrink-0">
          <div
            className="mb-3.5 flex gap-2"
            style={{ marginInlineStart: "var(--content-left-offset)" }}
          >
            <RailArrow
              direction="left"
              onClick={() => scrollRail(-1)}
              disabled={activeIndex === 0}
            />
            <RailArrow
              direction="right"
              onClick={() => scrollRail(1)}
              disabled={activeIndex === EPISODES.length - 1}
            />
          </div>

          <div
            ref={railRef}
            className="scrollbar-none flex h-[180px] items-end gap-6 overflow-x-auto overflow-y-hidden pt-6 pb-1.5"
            style={{
              scrollBehavior: "smooth",
              marginInline: "calc(-1 * clamp(28px, 4.5vw, 64px))",
              paddingInlineStart: "var(--rail-pad-start)",
              paddingInlineEnd: "var(--rail-pad-end)",
              scrollPaddingInlineStart: "var(--rail-pad-start)",
            }}
          >
            {EPISODES.map((episode, index) => (
              <ThumbCard
                key={episode.id}
                episode={episode}
                isActive={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isPlaying && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} teaser`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closePlayer();
              }
            }}
          >
            <motion.button
              type="button"
              onClick={closePlayer}
              aria-label="Close player"
              whileTap={{ scale: 0.97 }}
              transition={TAP_TRANSITION}
              className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/95 hover:bg-white/15"
            >
              <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden>
                <path
                  d="M3 3 L13 13 M13 3 L3 13"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
              </svg>
            </motion.button>
            <motion.video
              ref={playerVideoRef}
              src={active.src}
              controls
              autoPlay
              playsInline
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="max-h-[86vh] w-full rounded-[14px] bg-black"
              style={{
                maxWidth: "min(1280px, 92vw)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RailArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Scroll episodes ${direction}`}
      className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/90 backdrop-blur-md hover:bg-white/15 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-black/30"
    >
      <svg viewBox="0 0 16 16" width={11} height={11} aria-hidden>
        <path
          d={direction === "left" ? "M10 2 L4 8 L10 14" : "M6 2 L12 8 L6 14"}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ThumbCard({
  episode,
  isActive,
  onSelect,
}: {
  episode: Episode;
  isActive: boolean;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      whileHover={isActive ? undefined : { scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={TAP_TRANSITION}
      className="group flex flex-none flex-col items-start gap-2.5 text-left snap-start focus:outline-none"
    >
      <motion.div
        initial={false}
        animate={{
          width: isActive ? 192 : 148,
          height: isActive ? 108 : 78.5,
          boxShadow: isActive
            ? "0 16px 36px rgba(0,0,0,0.55)"
            : "0 4px 14px rgba(0,0,0,0.28)",
        }}
        transition={THUMB_TRANSITION}
        className="relative overflow-hidden rounded-[10px] bg-neutral-900"
      >
        <video
          ref={videoRef}
          src={episode.src}
          muted
          loop
          playsInline
          preload="metadata"
          className="block h-full w-full object-cover"
          onMouseEnter={(event) => {
            if (isActive) return;
            event.currentTarget.play().catch(() => {});
          }}
          onMouseLeave={(event) => {
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
          }}
        />
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.5) 100%)",
          }}
          aria-hidden
        />
      </motion.div>
      <motion.span
        initial={false}
        animate={{ color: isActive ? "rgb(255 255 255 / 0.98)" : "rgb(255 255 255 / 0.55)" }}
        transition={THUMB_TRANSITION}
        className="text-xs font-normal tracking-[0.18em] whitespace-nowrap uppercase"
        style={{
          fontFamily: "var(--font-space-mono), ui-monospace, monospace",
        }}
      >
        {episode.country}
      </motion.span>
    </motion.button>
  );
}
