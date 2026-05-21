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
import {
  IconBookFilled,
  IconBrandGithub,
  IconSphere2,
  IconBrandX,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useSound } from "react-sounds";
import { Drawer } from "vaul";
import { LoomixPlayer } from "@repo/ui";
import { DocsContent } from "../components/docs-content";

type Episode = {
  id: string;
  country: string;
  region: string;
  title: string;
  description: string;
  src: string;
  duration: string;
  date: string;
  youtubeUrl: string;
};

const EPISODES: Episode[] = [
  {
    id: "croatia",
    country: "Croatia",
    region: "Southeast Europe",
    title: "Croatia",
    description:
      "Limestone islands rise from a sea the color of cut glass. A series of conversations along the Dalmatian coast, where stone, salt, and centuries shape the shoreline.",
    src: "https://cdn.harshsingh.me/croatia.webm",
    duration: "4 min",
    date: "Jun 16, 2021",
    youtubeUrl: "https://www.youtube.com/watch?v=dq4n71jWZkk",
  },
  {
    id: "kyrgyzstan",
    country: "Kyrgyzstan",
    region: "Central Asia",
    title: "Kyrgyzstan",
    description:
      "In the high pastures of the Tien Shan, the day still follows the horse. Herders, felt-makers, and the small communities holding the rhythm of the steppe.",
    src: "https://cdn.harshsingh.me/kyrgyzstan.webm",
    duration: "5 min",
    date: "Nov 6, 2022",
    youtubeUrl: "https://www.youtube.com/watch?v=D-l3dSWbEtg",
  },
  {
    id: "laos",
    country: "Laos",
    region: "Southeast Asia",
    title: "Laos",
    description:
      "Morning mist on the Mekong, gilded temples, the slow arithmetic of a river country. A study of patience, devotion, and the craft of unhurried places.",
    src: "https://cdn.harshsingh.me/laos.webm",
    duration: "4 min",
    date: "Feb 22, 2020",
    youtubeUrl: "https://www.youtube.com/watch?v=i92eRarvfu8",
  },
  {
    id: "new-zealand",
    country: "New Zealand",
    region: "South Pacific",
    title: "New Zealand",
    description:
      "Glaciers, fjords, and roads that disappear into green. From the Southern Alps to the coast, a portrait of a country that keeps its scale to itself.",
    src: "https://cdn.harshsingh.me/new-zealand.webm",
    duration: "6 min",
    date: "May 4, 2022",
    youtubeUrl: "https://www.youtube.com/watch?v=0NMIZ-PTt8k",
  },
  {
    id: "peru",
    country: "Peru",
    region: "South America",
    title: "Peru",
    description:
      "Stonework that outlasted empires, and altitudes where the air thins to a whisper. The Sacred Valley as it is lived in now, not only as it is remembered.",
    src: "https://cdn.harshsingh.me/peru.webm",
    duration: "5 min",
    date: "May 13, 2014",
    youtubeUrl: "https://www.youtube.com/watch?v=Zk9J5xnTVMA",
  },
  {
    id: "tanzania",
    country: "Tanzania",
    region: "East Africa",
    title: "Tanzania",
    description:
      "Open plains under a sky too wide to frame. The Serengeti at the edge of the long rains, and the people who read its weather like a language.",
    src: "https://cdn.harshsingh.me/tanzania.webm",
    duration: "6 min",
    date: "Jul 7, 2021",
    youtubeUrl: "https://www.youtube.com/watch?v=3zUuxEiMcVo",
  },
  {
    id: "turks-and-caicos",
    country: "Turks & Caicos",
    region: "Caribbean",
    title: "Turks & Caicos",
    description:
      "Shallow banks of impossible blue, where the water borrows the color of the sky. A closing chapter on islands, light, and the discipline of doing less.",
    src: "https://cdn.harshsingh.me/turks-and-caicos.webm",
    duration: "4 min",
    date: "Jul 6, 2024",
    youtubeUrl: "https://www.youtube.com/watch?v=deZLj0TyUR8",
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
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const active = EPISODES[activeIndex]!;
  const reduceMotion = useReducedMotion();

  const railRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { play: playToggle } = useSound("ui/toggle_on");
  const { play: playPopup } = useSound("notification/popup");
  const { play: playSubmit } = useSound("ui/submit");

  const openPlayer = useCallback(() => {
    void playPopup();
    setIsPlaying(true);
  }, [playPopup]);
  const closePlayer = useCallback(() => setIsPlaying(false), []);

  const jumpToFirst = useCallback(() => {
    setActiveIndex((index) => {
      if (index === 0) return index;
      void playSubmit();
      return 0;
    });
  }, [playSubmit]);

  const jumpToLast = useCallback(() => {
    setActiveIndex((index) => {
      const last = EPISODES.length - 1;
      if (index === last) return index;
      void playSubmit();
      return last;
    });
  }, [playSubmit]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (isDocsOpen) return;
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        setIsPlaying((value) => !value);
        return;
      }
      if (event.key === "Escape") {
        setIsPlaying(false);
        return;
      }
      // While the player modal is open let LoomixPlayer own all the other
      // shortcuts (Space/K, M, F, C, arrow keys, etc.) — don't let the page
      // navigate episodes underneath it.
      if (isPlaying) return;
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => {
          const next = Math.min(EPISODES.length - 1, index + 1);
          if (next !== index) void playToggle();
          return next;
        });
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((index) => {
          const next = Math.max(0, index - 1);
          if (next !== index) void playToggle();
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playToggle, isDocsOpen, isPlaying]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const styles = getComputedStyle(rail);
    const gap =
      parseFloat(styles.columnGap) || parseFloat(styles.gap) || 0;
    // Inactive thumb width is fixed (see ThumbCard); compute the rail's
    // resting scroll position from layout math rather than the DOM, so the
    // computation is stable even while motion is animating the active card's
    // width (which transiently shifts subsequent cards' offsetLeft).
    const inactiveWidth = 148;
    const desiredScrollLeft = activeIndex * (inactiveWidth + gap);
    rail.scrollTo({
      left: desiredScrollLeft,
      behavior:
        reduceMotion || isFirstRender.current ? "auto" : "smooth",
    });
    isFirstRender.current = false;
  }, [activeIndex, reduceMotion]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--color-page)] font-sans text-neutral-100">
      <h1 className="sr-only">
        Loomix Player:  A customizable React video player UI
      </h1>
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
        className="relative z-10 flex h-full flex-col gap-5 px-[clamp(20px,4.5vw,64px)] py-5 sm:gap-6 sm:py-7"
        style={
          {
            "--content-left-offset":
              "max(0px, calc((100vw - 2 * clamp(20px, 4.5vw, 64px) - 600px) / 2))",
            "--rail-pad-start":
              "calc(clamp(20px, 4.5vw, 64px) + var(--content-left-offset))",
            "--rail-pad-end":
              "max(clamp(20px, 4.5vw, 64px), calc(100vw - var(--rail-pad-start) - 192px))",
          } as CSSProperties
        }
      >
        <header className="mx-auto flex w-full max-w-[600px] shrink-0 items-center justify-between">
          <div className="inline-flex items-center gap-1 text-sm font-medium text-white/90 sm:gap-3 sm:text-base">
            <IconSphere2
              aria-hidden
              size={24}
              stroke={2}
              className="h-6 w-6 shrink-0 text-white sm:h-7 sm:w-7"
            />
            <span className="leading-tight font-semibold">Loomix</span>
          </div>

          <nav
            aria-label="Primary"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => {
                void playPopup();
                setIsDocsOpen(true);
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-150 hover:bg-white/[0.12] hover:text-white"
            >
              <IconBookFilled size={15} aria-hidden />
              Docs
            </button>
            <a
              href="https://github.com/haaarshsingh/loomix"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              onClick={() => {
                void playPopup();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-150 hover:bg-white/[0.12] hover:text-white"
            >
              <IconBrandGithub size={18} aria-hidden stroke={1.75} />
            </a>
            <a
              href="https://x.com/haaarshsingh"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X"
              onClick={() => {
                void playPopup();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-150 hover:bg-white/[0.12] hover:text-white"
            >
              <IconBrandX size={15} aria-hidden stroke={1.75} />
            </a>
          </nav>
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
          <section
            className="mx-auto w-full max-w-[600px] pb-4 sm:pb-[clamp(40px,8vh,90px)]"
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
                className="mb-3 text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase sm:mb-3.5 sm:text-[11px] sm:tracking-[0.22em]"
                style={{
                  fontFamily:
                    "var(--font-space-mono), ui-monospace, monospace",
                }}
              >
                {active.region}
              </p>
              <h2
                className="mb-3.5 text-[clamp(34px,9vw,84px)] leading-[1.02] font-semibold tracking-[-0.02em] sm:mb-5 sm:text-[clamp(44px,6.2vw,84px)] sm:leading-none sm:tracking-[-0.025em]"
                style={{ textShadow: "0 1px 30px rgba(0,0,0,0.45)" }}
              >
                {active.title}
              </h2>
              <p
                className="mb-5 text-[13.5px] leading-[1.55] text-balance text-white/[0.88] sm:mb-6 sm:max-w-[460px] sm:text-[14.5px] sm:leading-[1.6]"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
              >
                {active.description}
              </p>

              <motion.button
                type="button"
                onClick={openPlayer}
                whileTap={{ scale: 0.97 }}
                transition={TAP_TRANSITION}
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-3.5 py-1.5 text-[13px] font-medium text-neutral-900 backdrop-blur-[24px] backdrop-saturate-[1.4] hover:bg-white/95 sm:gap-2.5 sm:px-4 sm:py-2 sm:text-sm"
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
                  className="ml-1 hidden h-[22px] min-w-[22px] items-center justify-center rounded-md bg-black/10 px-1.5 text-[11px] font-bold text-neutral-900/75 sm:inline-flex"
                  style={{
                    fontFamily:
                      "var(--font-space-mono), ui-monospace, monospace",
                  }}
                >
                  P
                </kbd>
              </motion.button>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/[0.78] sm:mt-5 sm:gap-2.5 sm:text-xs">
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
              onClick={jumpToFirst}
              disabled={activeIndex === 0}
            />
            <RailArrow
              direction="right"
              onClick={jumpToLast}
              disabled={activeIndex === EPISODES.length - 1}
            />
          </div>

          <div
            ref={railRef}
            className="scrollbar-none flex h-[180px] items-end gap-4 overflow-x-auto overflow-y-hidden pt-6 pb-1.5 sm:gap-6"
            style={{
              scrollBehavior: "smooth",
              marginInline: "calc(-1 * clamp(20px, 4.5vw, 64px))",
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
                onSelect={() => {
                  if (index === activeIndex) return;
                  void playToggle();
                  setActiveIndex(index);
                }}
              />
            ))}
          </div>
        </section>
      </div>

      <Drawer.Root open={isDocsOpen} onOpenChange={setIsDocsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" />
          <Drawer.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[92vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#0a0a0a] text-neutral-100 outline-none focus:outline-none"
          >
            <div
              aria-hidden
              className="mx-auto mt-3 mb-4 h-1.5 w-12 shrink-0 rounded-full bg-white/15"
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-10 sm:px-6">
              <div className="mx-auto w-full max-w-[600px]">
                <Drawer.Title className="sr-only">
                  Loomix Player documentation
                </Drawer.Title>
                <DocsContent />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

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
            <motion.div
              key={active.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              onClick={(event) => event.stopPropagation()}
              className="w-full"
              style={{
                maxWidth: "min(1280px, 92vw)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
              }}
            >
              <LoomixPlayer
                src={active.src}
                title={active.title}
                autoPlay
                autoFocus
                ariaLabel={`${active.title} teaser`}
                youtubeUrl={active.youtubeUrl}
                onClose={closePlayer}
                className="aspect-video max-h-[86vh] w-full rounded-[14px]"
              />
            </motion.div>
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
  return (
    <motion.button
      type="button"
      onClick={(event) => {
        // Drop focus immediately so the browser doesn't try to keep this
        // thumbnail visible via scroll-padding when subsequent arrow-key
        // navigation programmatically scrolls the rail.
        event.currentTarget.blur();
        onSelect();
      }}
      aria-current={isActive ? "true" : undefined}
      whileTap={{ scale: 0.97 }}
      transition={TAP_TRANSITION}
      className="flex flex-none flex-col items-start gap-2.5 text-left snap-start focus:outline-none"
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
          src={episode.src}
          muted
          loop
          playsInline
          preload="metadata"
          className="block h-full w-full object-cover"
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
