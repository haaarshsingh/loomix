"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

export type TooltipSide = "top" | "bottom";
export type TooltipAlign = "start" | "center" | "end";

export function Tooltip({
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
  const hiddenTranslate =
    side === "top" ? "translateY(2px)" : "translateY(-2px)";

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
