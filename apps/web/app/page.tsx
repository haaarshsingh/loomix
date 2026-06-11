import { CodeTabs } from "../components/code-tabs";
import { Hero } from "../components/hero";
import { InfoCards } from "../components/info-cards";
import { PlayerDemo } from "../components/player-demo";
import { SiteFooter } from "../components/site-footer";
import { SiteNav } from "../components/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />

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
          <Hero />
          <PlayerDemo />
          <CodeTabs />
          <InfoCards />
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
