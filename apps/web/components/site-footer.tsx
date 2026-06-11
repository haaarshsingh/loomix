import { IconBrandX } from "@tabler/icons-react";
import { GithubIcon } from "./github-icon";

export function SiteFooter() {
  return (
    <div className="border-t border-dashed border-[var(--color-hair)]">
      <footer className="mx-auto flex max-w-[820px] items-center justify-between border-x border-[var(--color-hair)] px-6 py-5">
        <p className="text-sm text-[var(--color-muted)]">
          Built by{" "}
          <a
            href="https://harshsingh.me"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[var(--color-accent)]"
          >
            Harsh
          </a>{" "}
          ✌️
        </p>
        <div className="flex items-center gap-3 text-[var(--color-accent)]">
          <a
            href="https://x.com/haaarshsingh"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="X"
          >
            <IconBrandX size={20} aria-hidden />
          </a>
          <a
            href="https://github.com/haaarshsingh"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
          >
            <GithubIcon size={23} />
          </a>
        </div>
      </footer>
    </div>
  );
}
