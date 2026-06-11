import {
  IconCode,
  IconDownload,
  IconGitPullRequest,
} from "@tabler/icons-react";
import { REPO_URL } from "../lib/site";

export function InfoCards() {
  return (
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
