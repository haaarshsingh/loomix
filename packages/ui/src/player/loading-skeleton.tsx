"use client";

import { motion } from "motion/react";
import { cn } from "./utils";

export function LoadingSkeleton({
  ariaLabel,
  className,
}: {
  ariaLabel?: string;
  className?: string;
}) {
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
