"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBrandGithub,
  IconBrandX,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";

const DEFAULT_REGISTRY_URL = "https://loomix.dev/r/loomix-player.json";
const NPM_COMMAND = "pnpm add loomix";

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
  {
    name: "src",
    type: "string",
    description: "Video source URL. Required.",
  },
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

export default function DocsPage() {
  const [registryUrl, setRegistryUrl] = useState(DEFAULT_REGISTRY_URL);

  useEffect(() => {
    setRegistryUrl(`${window.location.origin}/r/loomix-player.json`);
  }, []);

  const installCommand = `npx shadcn@latest add ${registryUrl}`;

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[var(--color-page)] text-neutral-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(80,80,140,0.18), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
        }}
      />
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-12 px-6 pt-7 pb-24 sm:px-8 sm:pt-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-sm font-medium text-white/90"
          >
            <Image
              src="/icon.png"
              alt=""
              aria-hidden
              draggable={false}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full"
            />
            <span className="leading-tight font-semibold">Loomix</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-white/85 backdrop-blur-xl transition-colors duration-150 hover:bg-white/[0.12] hover:text-white"
            >
              <IconArrowLeft size={14} aria-hidden />
              Home
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/85 backdrop-blur-xl transition-colors duration-150 hover:bg-white/[0.12] hover:text-white"
            >
              <IconBrandGithub size={18} aria-hidden stroke={1.75} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/85 backdrop-blur-xl transition-colors duration-150 hover:bg-white/[0.12] hover:text-white"
            >
              <IconBrandX size={15} aria-hidden stroke={1.75} />
            </a>
          </nav>
        </header>

        <section className="flex flex-col gap-4">
          <p
            className="text-[11px] font-medium tracking-[0.22em] text-white/55 uppercase"
            style={{
              fontFamily: "var(--font-space-mono), ui-monospace, monospace",
            }}
          >
            Documentation
          </p>
          <h1 className="text-[clamp(36px,6vw,56px)] leading-[1.04] font-semibold tracking-[-0.025em]">
            Loomix Player
          </h1>
          <p className="max-w-[560px] text-[15px] leading-[1.6] text-balance text-white/75">
            A polished, customizable React video player. Drop in a single
            component and get scrubbable progress, volume, playback speed,
            captions, picture-in-picture, fullscreen, and a YouTube affordance —
            all styled with Tailwind and animated with motion.
          </p>
        </section>

        <Section title="Installation" eyebrow="Get started">
          <p className="text-[14px] leading-[1.65] text-white/70">
            The primary way to install Loomix is via the{" "}
            <a
              href="https://ui.shadcn.com/docs/cli"
              target="_blank"
              rel="noreferrer noopener"
              className="text-white underline decoration-white/30 underline-offset-[3px] hover:decoration-white/70"
            >
              shadcn CLI
            </a>
            . It copies the component source directly into your project so you
            can customize it however you like.
          </p>
          <CodeBlock command={installCommand} language="bash" />

          <p className="text-[14px] leading-[1.65] text-white/70">
            An npm package will be available shortly for users who prefer a
            traditional dependency:
          </p>
          <CodeBlock command={NPM_COMMAND} language="bash" />
        </Section>

        <Section title="Usage" eyebrow="Basics">
          <p className="text-[14px] leading-[1.65] text-white/70">
            Pass a video source and Loomix renders a complete player. Apply any
            Tailwind classes to size and position it.
          </p>
          <CodeBlock command={USAGE} language="tsx" />
        </Section>

        <Section title="Props" eyebrow="API">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <table className="w-full border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="bg-white/[0.04]">
                  <th
                    className="px-4 py-2.5 text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase"
                    style={{
                      fontFamily:
                        "var(--font-space-mono), ui-monospace, monospace",
                    }}
                  >
                    Prop
                  </th>
                  <th
                    className="px-4 py-2.5 text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase"
                    style={{
                      fontFamily:
                        "var(--font-space-mono), ui-monospace, monospace",
                    }}
                  >
                    Type
                  </th>
                  <th
                    className="px-4 py-2.5 text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase"
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
                      className="px-4 py-2.5 font-medium whitespace-nowrap text-white"
                      style={{
                        fontFamily:
                          "var(--font-space-mono), ui-monospace, monospace",
                      }}
                    >
                      {prop.name}
                    </td>
                    <td
                      className="px-4 py-2.5 text-white/65"
                      style={{
                        fontFamily:
                          "var(--font-space-mono), ui-monospace, monospace",
                      }}
                    >
                      {prop.type}
                    </td>
                    <td className="px-4 py-2.5 text-white/80">
                      {prop.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Keyboard shortcuts" eyebrow="Accessibility">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.action}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5"
              >
                <span className="text-[13.5px] text-white/80">
                  {shortcut.action}
                </span>
                <kbd
                  className="rounded-md bg-white/10 px-2 py-0.5 text-[11.5px] font-medium text-white/90"
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
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p
          className="text-[10.5px] font-medium tracking-[0.22em] text-white/50 uppercase"
          style={{
            fontFamily: "var(--font-space-mono), ui-monospace, monospace",
          }}
        >
          {eyebrow}
        </p>
        <h2 className="text-[22px] leading-[1.2] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
      </div>
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
  const onCopy = useCallback(() => {
    void navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }, [command]);

  return (
    <div className="group/code relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2">
        <span
          className="text-[10.5px] font-medium tracking-[0.18em] text-white/55 uppercase"
          style={{
            fontFamily: "var(--font-space-mono), ui-monospace, monospace",
          }}
        >
          {language}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy to clipboard"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/65 transition-colors duration-150 hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <IconCheck size={14} aria-hidden />
          ) : (
            <IconCopy size={14} aria-hidden />
          )}
        </button>
      </div>
      <pre
        className="overflow-x-auto px-4 py-3 text-[12.5px] leading-[1.65] text-white/90"
        style={{
          fontFamily: "var(--font-space-mono), ui-monospace, monospace",
        }}
      >
        <code>{command}</code>
      </pre>
    </div>
  );
}
