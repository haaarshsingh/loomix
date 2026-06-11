import {
  IconArrowRight,
  IconBrandX,
  IconCode,
  IconDownload,
  IconGitPullRequest,
  IconSphere2,
} from "@tabler/icons-react";
import { CodeTabs } from "../components/code-tabs";
import { InstallCommand } from "../components/install-command";
import { PlayerDemo } from "../components/player-demo";

const REPO = "haaarshsingh/loomix";
const REPO_URL = `https://github.com/${REPO}`;

export default function Home() {
  return (
    <>
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

      <div className="relative mx-auto max-w-[820px] border-x border-[var(--color-hair)] pt-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/3 -z-10 border-l border-dashed border-[var(--color-hair)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-2/3 -z-10 border-l border-dashed border-[var(--color-hair)]"
        />

        <main className="relative pb-48">
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

          <PlayerDemo />

          <CodeTabs />

          <section className="grid grid-cols-1 border-b border-dashed border-[var(--color-hair)] sm:grid-cols-3">
            <InfoCard
              icon={<IconCode size={18} aria-hidden />}
              title="Examples"
              body="Explore live demos and recipes for the Loomix player."
              href={`${REPO_URL}/tree/main/apps/web`}
              cta="View examples"
            />
            <InfoCard
              icon={<IconDownload size={18} aria-hidden />}
              title="Install"
              body="Add the player via the shadcn registry or npm package."
              href={`${REPO_URL}#installation`}
              cta="Get started"
            />
            <InfoCard
              icon={<IconGitPullRequest size={18} aria-hidden />}
              title="Contribute"
              body="Report bugs, suggest features, or open pull requests."
              href={REPO_URL}
              cta="View GitHub"
            />
          </section>
        </main>
      </div>

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
    </>
  );
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth={0}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
      />
    </svg>
  );
}

function InfoCard({
  icon,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="border-b border-dashed border-[var(--color-hair)] px-0 py-8 sm:border-b-0 sm:px-6">
      <h3 className="mb-3 flex items-center gap-1.5 text-[15px] font-medium text-[var(--color-ink)]">
        <span className="text-[var(--color-ink)]">{icon}</span>
        {title}
      </h3>
      <p className="mb-6 text-sm text-[var(--color-muted)]">{body}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-sm font-medium text-[var(--color-accent)]"
      >
        {cta}
      </a>
    </div>
  );
}
