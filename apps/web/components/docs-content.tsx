"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useSound } from "react-sounds";
import { highlight } from "sugar-high";

const DEFAULT_REGISTRY_URL =
  "https://loomix.harshsingh.me/r/loomix-player.json";
const NPM_COMMAND = "npm install loomix";

const USAGE = `import { LoomixPlayer } from "@/components/ui/loomix-player";

export default function Demo() {
  return (
    <LoomixPlayer
      src="/croatia.webm"
      youtubeUrl="https://youtube.com/watch?v=..."
      className="aspect-video w-full max-w-4xl"
    />
  );
}`;

const PROPS: Array<{ name: string; type: string; description: string }> = [
  { name: "src", type: "string", description: "Video source URL. Required." },
  {
    name: "poster",
    type: "string",
    description: "Image shown before playback begins.",
  },
  {
    name: "youtubeUrl",
    type: "string",
    description:
      "When set, a 'Watch on YouTube' button is shown in the control bar.",
  },
  {
    name: "captions",
    type: "LoomixCaption[]",
    description:
      "Caption / subtitle tracks. When provided, the CC toggle appears.",
  },
  {
    name: "autoPlay",
    type: "boolean",
    description: "Auto-play on mount. Defaults to false.",
  },
  {
    name: "muted",
    type: "boolean",
    description: "Start muted. Defaults to false.",
  },
  {
    name: "loop",
    type: "boolean",
    description: "Loop the video. Defaults to false.",
  },
  {
    name: "disablePictureInPicture",
    type: "boolean",
    description: "Hide the picture-in-picture button.",
  },
  {
    name: "ariaLabel",
    type: "string",
    description: "Accessible label applied to the player root.",
  },
  {
    name: "className",
    type: "string",
    description: "Class name applied to the player root.",
  },
  {
    name: "videoClassName",
    type: "string",
    description: "Class name applied to the underlying <video> element.",
  },
  {
    name: "onPlayingChange",
    type: "(isPlaying: boolean) => void",
    description: "Called whenever play / pause state changes.",
  },
];

const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: "Space / K", action: "Play / pause" },
  { keys: "M", action: "Mute / unmute" },
  { keys: "F", action: "Toggle fullscreen" },
  { keys: "C", action: "Toggle captions" },
  { keys: "← / →", action: "Seek -/+ 5s" },
  { keys: "↑ / ↓", action: "Volume -/+ 5%" },
];

export function DocsContent() {
  const [registryUrl, setRegistryUrl] = useState(DEFAULT_REGISTRY_URL);

  useEffect(() => {
    setRegistryUrl(`${window.location.origin}/r/loomix-player.json`);
  }, []);

  const installCommand = `npx shadcn@latest add ${registryUrl}`;

  return (
    <div className="flex flex-col gap-12">
      <Section title="Installation">
        <p className="text-[13.5px] leading-[1.65] text-white/70">
          Install via the{" "}
          <a
            href="https://ui.shadcn.com/docs/cli"
            target="_blank"
            rel="noreferrer noopener"
            className="text-white underline decoration-white/30 underline-offset-[3px] hover:decoration-white/70"
          >
            shadcn CLI
          </a>{" "}
          to copy the component source directly into your project, or use the
          NPM package.
        </p>
        <TabbedCodeBlock
          tabs={[
            { id: "shadcn", label: "shadcn", command: installCommand },
            { id: "npm", label: "NPM", command: NPM_COMMAND },
          ]}
        />
      </Section>

      <Section title="Usage">
        <p className="text-[13.5px] leading-[1.65] text-white/70">
          Pass a video source and Loomix renders a complete player. Apply any
          Tailwind classes to size and position it.
        </p>
        <CodeBlock command={USAGE} language="tsx" />
      </Section>

      <Section title="Props">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-white/[0.04]">
                <th
                  className="px-3.5 py-2.5 text-[10.5px] font-medium tracking-[0.16em] text-white/55 uppercase"
                  style={{
                    fontFamily:
                      "var(--font-space-mono), ui-monospace, monospace",
                  }}
                >
                  Prop
                </th>
                <th
                  className="px-3.5 py-2.5 text-[10.5px] font-medium tracking-[0.16em] text-white/55 uppercase"
                  style={{
                    fontFamily:
                      "var(--font-space-mono), ui-monospace, monospace",
                  }}
                >
                  Type
                </th>
                <th
                  className="px-3.5 py-2.5 text-[10.5px] font-medium tracking-[0.16em] text-white/55 uppercase"
                  style={{
                    fontFamily:
                      "var(--font-space-mono), ui-monospace, monospace",
                  }}
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {PROPS.map((prop) => (
                <tr
                  key={prop.name}
                  className="border-t border-white/[0.06] align-top"
                >
                  <td
                    className="px-3.5 py-2.5 font-medium whitespace-nowrap text-white"
                    style={{
                      fontFamily:
                        "var(--font-space-mono), ui-monospace, monospace",
                    }}
                  >
                    {prop.name}
                  </td>
                  <td
                    className="px-3.5 py-2.5 text-white/65"
                    style={{
                      fontFamily:
                        "var(--font-space-mono), ui-monospace, monospace",
                    }}
                  >
                    {prop.type}
                  </td>
                  <td className="px-3.5 py-2.5 text-white/80">
                    {prop.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Keyboard shortcuts">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.action}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5"
            >
              <span className="text-[13px] text-white/80">
                {shortcut.action}
              </span>
              <kbd
                className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90"
                style={{
                  fontFamily:
                    "var(--font-space-mono), ui-monospace, monospace",
                }}
              >
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <h3 className="text-[19px] leading-[1.2] font-semibold tracking-[-0.01em]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function CodeBlock({
  command,
  language,
}: {
  command: string;
  language: "bash" | "tsx";
}) {
  const [copied, setCopied] = useState(false);
  const { play: playPopup } = useSound("notification/popup");
  const onCopy = useCallback(() => {
    void navigator.clipboard.writeText(command).then(() => {
      void playPopup();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }, [command, playPopup]);

  const highlighted = useMemo(
    () => (language === "tsx" ? highlight(command) : null),
    [command, language],
  );

  return (
    <div className="group/code relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy to clipboard"
        className="absolute top-2.5 right-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-md hover:bg-white/15 hover:text-white"
      >
        <span
          className="t-icon-swap inline-grid place-items-center leading-none"
          data-state={copied ? "b" : "a"}
        >
          <span className="t-icon inline-flex" data-icon="a" aria-hidden>
            <IconCopy size={13} />
          </span>
          <span className="t-icon inline-flex" data-icon="b" aria-hidden>
            <IconCheck size={13} />
          </span>
        </span>
      </button>
      <pre
        className="overflow-x-auto px-4 py-3 pr-12 text-[12.5px] leading-[1.65] text-white/90"
        style={{
          fontFamily: "var(--font-space-mono), ui-monospace, monospace",
        }}
      >
        {highlighted ? (
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        ) : (
          <code>{command}</code>
        )}
      </pre>
    </div>
  );
}

function TabbedCodeBlock({
  tabs,
}: {
  tabs: Array<{ id: string; label: string; command: string }>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const codeRef = useRef<HTMLElement | null>(null);
  const swapTimerRef = useRef<number | null>(null);
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const prevRectRef = useRef<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const container = tabBarRef.current;
    const btn = tabRefs.current[activeIndex];
    const indicator = indicatorRef.current;
    if (!container || !btn || !indicator) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const next = { left: bRect.left - cRect.left, width: bRect.width };

    indicator.style.left = `${next.left}px`;
    indicator.style.width = `${next.width}px`;

    const prev = prevRectRef.current;
    if (prev && (prev.left !== next.left || prev.width !== next.width)) {
      const dx = prev.left - next.left;
      const sx = next.width === 0 ? 1 : prev.width / next.width;
      indicator.style.transition = "none";
      indicator.style.transformOrigin = "0 50%";
      indicator.style.transform = `translateX(${dx}px) scaleX(${sx})`;
      void indicator.offsetWidth;
      indicator.style.transition =
        "transform 350ms cubic-bezier(0.32, 0.72, 0, 1)";
      indicator.style.transform = "translateX(0) scaleX(1)";
    } else {
      indicator.style.transform = "translateX(0) scaleX(1)";
      indicator.style.transformOrigin = "0 50%";
    }

    prevRectRef.current = next;
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === displayedIndex) return;
    const el = codeRef.current;
    if (!el) {
      setDisplayedIndex(activeIndex);
      return;
    }
    const dur =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--text-swap-dur",
        ),
      ) || 150;

    el.classList.add("is-exit");
    if (swapTimerRef.current !== null) {
      window.clearTimeout(swapTimerRef.current);
    }
    swapTimerRef.current = window.setTimeout(() => {
      flushSync(() => setDisplayedIndex(activeIndex));
      const node = codeRef.current;
      if (!node) return;
      node.classList.remove("is-exit");
      node.classList.add("is-enter-start");
      void node.offsetHeight;
      node.classList.remove("is-enter-start");
      swapTimerRef.current = null;
    }, dur);
  }, [activeIndex, displayedIndex]);

  useEffect(
    () => () => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
      }
    },
    [],
  );

  const activeCommand = tabs[activeIndex]!.command;
  const displayedCommand = tabs[displayedIndex]!.command;

  const [copied, setCopied] = useState(false);
  const { play: playPopup } = useSound("notification/popup");
  const { play: playToggle } = useSound("ui/toggle_on");
  const onCopy = useCallback(() => {
    void navigator.clipboard.writeText(activeCommand).then(() => {
      void playPopup();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }, [activeCommand, playPopup]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between px-2 pt-2">
        <div
          ref={tabBarRef}
          role="tablist"
          aria-label="Installation method"
          className="relative inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-0.5 text-[11.5px]"
        >
          <div
            ref={indicatorRef}
            aria-hidden
            className="pointer-events-none absolute top-0.5 bottom-0.5 rounded-full bg-white/12 will-change-transform"
          />
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => {
                  if (isActive) return;
                  void playToggle();
                  setActiveIndex(index);
                }}
                className={cn(
                  "relative rounded-full px-2.5 py-1 font-medium",
                  isActive ? "text-white" : "text-white/55 hover:text-white",
                )}
                style={{
                  fontFamily:
                    "var(--font-space-mono), ui-monospace, monospace",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy to clipboard"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-md hover:bg-white/15 hover:text-white"
        >
          <span
            className="t-icon-swap inline-grid place-items-center leading-none"
            data-state={copied ? "b" : "a"}
          >
            <span className="t-icon inline-flex" data-icon="a" aria-hidden>
              <IconCopy size={13} />
            </span>
            <span className="t-icon inline-flex" data-icon="b" aria-hidden>
              <IconCheck size={13} />
            </span>
          </span>
        </button>
      </div>
      <pre
        className="overflow-x-auto px-4 pt-3 pb-3 text-[12.5px] leading-[1.65] text-white/90"
        style={{
          fontFamily: "var(--font-space-mono), ui-monospace, monospace",
        }}
      >
        <code ref={codeRef} className="t-text-swap block">
          {displayedCommand}
        </code>
      </pre>
    </div>
  );
}

function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
