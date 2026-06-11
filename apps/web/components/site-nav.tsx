import { IconArrowRight, IconSphere2 } from "@tabler/icons-react";
import { REPO_URL } from "../lib/site";

export function SiteNav() {
  return (
    <div className="border-b border-dashed border-[var(--color-hair)]">
      <nav className="mx-auto flex max-w-[820px] items-center justify-between border-x border-[var(--color-hair)] p-3">
        <IconSphere2
          size={30}
          stroke={1.7}
          aria-label="Loomix"
          className="text-[var(--color-ink)] select-none"
        />
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex items-center gap-1 rounded-xl border border-[var(--color-hair)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-ink)] transition-opacity hover:opacity-90"
        >
          Documentation
          <IconArrowRight
            size={16}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden
          />
        </a>
      </nav>
    </div>
  );
}
