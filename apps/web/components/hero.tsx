import { GithubIcon } from "./github-icon";
import { InstallCommand } from "./install-command";
import { REPO, REPO_URL } from "../lib/site";

export function Hero() {
  return (
    <header className="mx-6 mt-32 mb-24">
      <div className="flex flex-col">
        <p className="text-base font-medium text-[var(--color-accent)]">
          Loomix
        </p>
        <h1 className="text-[32px] font-bold tracking-[-0.025em] sm:text-[40px]">
          React Video Player
        </h1>
        <p className="mt-1 mb-8 text-base text-balance text-[var(--color-muted)]">
          A lightweight, drop-in replacement for the native HTML5 video element.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-10 items-center gap-3 rounded-xl bg-[#18181b] px-3 text-sm text-white transition-[background-color,transform] duration-200 ease-strong-out select-none hover:bg-[#27272a] active:scale-[0.97]"
        >
          <GithubIcon size={20} />
          {REPO}
        </a>
        <InstallCommand />
      </div>
    </header>
  );
}
