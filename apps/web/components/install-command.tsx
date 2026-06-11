"use client";

import { useCallback, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

const COMMAND = "npm install loomix";

export function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    void navigator.clipboard.writeText(COMMAND).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }, []);

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy install command"
      className="inline-flex h-10 items-center gap-3 rounded-full border border-[var(--color-hair)] bg-white py-0 pr-1.5 pl-3.5 font-mono text-[13px] text-[var(--color-ink)] transition-transform duration-150 select-none active:scale-[0.98]"
    >
      <span>{COMMAND}</span>
      <span
        className="t-icon-swap inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[var(--color-hair)] bg-[var(--color-page)] text-[var(--color-muted)]"
        data-state={copied ? "b" : "a"}
      >
        <span className="t-icon inline-flex" data-icon="a" aria-hidden>
          <IconCopy size={15} />
        </span>
        <span
          className="t-icon inline-flex text-[var(--color-accent)]"
          data-icon="b"
          aria-hidden
        >
          <IconCheck size={15} />
        </span>
      </span>
    </button>
  );
}
