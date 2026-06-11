"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { highlight } from "sugar-high";

type Tab = {
  id: string;
  label: string;
  code: string;
};

const TABS: Tab[] = [
  {
    id: "usage",
    label: "Usage",
    code: `import { LoomixPlayer } from "@/components/ui/loomix-player";

export default function Demo() {
  return (
    <LoomixPlayer
      src="/video.mp4"
      poster="/poster.jpg"
      className="aspect-video w-full"
    />
  );
}`,
  },
  {
    id: "captions",
    label: "Captions",
    code: `<LoomixPlayer
  src="/video.mp4"
  captions={[
    { src: "/en.vtt", srcLang: "en", label: "English", default: true },
    { src: "/es.vtt", srcLang: "es", label: "Español" },
  ]}
/>`,
  },
  {
    id: "events",
    label: "Events",
    code: `<LoomixPlayer
  src="/video.mp4"
  autoPlay
  muted
  onPlayingChange={(isPlaying) => {
    console.log(isPlaying ? "playing" : "paused");
  }}
/>`,
  },
  {
    id: "youtube",
    label: "YouTube",
    code: `<LoomixPlayer
  src="/video.mp4"
  youtubeUrl="https://youtube.com/watch?v=..."
  disablePictureInPicture
/>`,
  },
];

export function CodeTabs() {
  const [activeId, setActiveId] = useState(TABS[0]!.id);
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setPanelHeight(el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0]!;

  const highlighted = useMemo(() => {
    const map: Record<string, string> = {};
    for (const tab of TABS) map[tab.id] = highlight(tab.code);
    return map;
  }, []);

  const onCopy = useCallback(() => {
    void navigator.clipboard.writeText(active.code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }, [active.code]);

  return (
    <section className="mt-12">
      <div className="mx-2.5 mb-0 flex flex-col items-start justify-between gap-4 px-1.5 sm:flex-row sm:items-center sm:gap-0">
        <div
          role="tablist"
          aria-label="Code examples"
          className="relative inline-flex p-1"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className="relative h-8 cursor-pointer rounded-full px-3 text-sm whitespace-nowrap transition-colors duration-150"
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-[var(--color-ink)]"
                    transition={{
                      type: "spring",
                      stiffness: 480,
                      damping: 40,
                    }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-white" : "text-[var(--color-ink)]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy code"
          className="group relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[var(--color-muted)]"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full transition-[background-color,transform] duration-200 ease-strong-out group-hover:bg-[#e3e3e3] group-active:scale-[0.96]"
          />
          <span
            className="t-icon-swap relative items-center justify-center"
            data-state={copied ? "b" : "a"}
          >
            <span className="t-icon inline-flex" data-icon="a" aria-hidden>
              <IconCopy size={16} />
            </span>
            <span
              className="t-icon inline-flex text-[var(--color-accent)]"
              data-icon="b"
              aria-hidden
            >
              <IconCheck size={16} />
            </span>
          </span>
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: panelHeight ?? "auto" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
        className="mt-3 overflow-hidden border-y border-[var(--color-hair)] bg-white"
      >
        <div ref={panelRef} className="px-6 py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.pre
              key={active.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="scrollbar-none overflow-x-auto"
            >
              <code
                className="block font-mono text-[13px] leading-[1.6] whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlighted[active.id]! }}
              />
            </motion.pre>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
