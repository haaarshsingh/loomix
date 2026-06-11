"use client";

import { motion } from "motion/react";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import { Tooltip } from "./tooltip";
import { EASE } from "./utils";

type TopBarProps = {
  title?: string;
  youtubeUrl?: string;
  onClose?: () => void;
};

/** Top chrome: title, "Watch on YouTube" link and close button. */
export function TopBar({ title, youtubeUrl, onClose }: TopBarProps) {
  return (
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
  );
}
