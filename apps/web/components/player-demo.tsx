"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoomixPlayer } from "loomix";

const TABS = [
  { id: "default", label: "Default" },
  { id: "minimal", label: "Minimal" },
  { id: "loading", label: "Loading" },
  { id: "modal", label: "Modal" },
] as const;

const MODAL_VIDEO_TITLE = "TANZANIA | Travel Video | Stock Footage";

type TabId = (typeof TABS)[number]["id"];

function PlayerStage({ active }: { active: TabId }) {
  switch (active) {
    case "default":
      return (
        <LoomixPlayer
          src="/media/kyrgyzstan.webm"
          title="ROADS OF KYRGYZSTAN | Cinematic Travel Video (4K)"
          ariaLabel="ROADS OF KYRGYZSTAN | Cinematic Travel Video (4K)"
          youtubeUrl="https://www.youtube.com/watch?v=D-l3dSWbEtg"
          captions={[
            { src: "/kyrgyzstan.vtt", srcLang: "en", label: "English" },
          ]}
          className="aspect-video w-full rounded-none!"
        />
      );
    case "minimal":
      return (
        <LoomixPlayer
          src="/media/turks-and-caicos.webm"
          ariaLabel="Turks & Caicos cinematic travel video"
          disableSkip
          disableVolume
          disableSpeed
          disablePictureInPicture
          disableFullscreen
          className="aspect-video w-full rounded-none!"
        />
      );
    case "loading":
      return <LoomixPlayer loading className="aspect-video w-full rounded-none!" />;
    case "modal":
      return <ModalStage />;
    default: {
      const _exhaustive: never = active;
      return _exhaustive;
    }
  }
}

function ModalStage() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative flex aspect-video w-full items-center justify-center bg-neutral-900">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full border border-white/50 bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] shadow-[0_2px_14px_rgba(0,0,0,0.18)] transition-transform duration-150 select-none hover:bg-white/95 active:scale-[0.97]"
      >
        Open modal
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={MODAL_VIDEO_TITLE}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="w-full"
              style={{
                maxWidth: "min(1280px, 92vw)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
              }}
            >
              <LoomixPlayer
                src="/media/tanzania.webm"
                title={MODAL_VIDEO_TITLE}
                ariaLabel={MODAL_VIDEO_TITLE}
                youtubeUrl="https://www.youtube.com/watch?v=3zUuxEiMcVo"
                autoPlay
                autoFocus
                onClose={() => setOpen(false)}
                className="aspect-video max-h-[86vh] w-full rounded-[14px]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlayerDemo() {
  const [active, setActive] = useState<TabId>("default");

  return (
    <section aria-label="Player demo" className="mt-12">
      <div className="mx-2.5 mb-3 px-1.5">
        <div
          role="tablist"
          aria-label="Player examples"
          className="relative inline-flex p-1"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className="relative h-8 cursor-pointer rounded-full px-3 text-sm whitespace-nowrap transition-colors duration-150"
              >
                {isActive && (
                  <motion.span
                    layoutId="player-tab-pill"
                    className="absolute inset-0 rounded-full bg-[var(--color-ink)]"
                    transition={{ type: "spring", stiffness: 480, damping: 40 }}
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
      </div>

      <div className="border-y border-[var(--color-hair)]">
        <PlayerStage active={active} />
      </div>
    </section>
  );
}
