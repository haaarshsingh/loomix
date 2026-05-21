## Learned User Preferences

- Use Tailwind CSS for styling in `apps/web`; do not introduce CSS modules.
- Use the `motion` library (not `framer-motion`) for React animations.
- Do not add intro/mount animations; UI must appear in its final position on load.
- Persistent UI controls (e.g., rail navigation arrows) must stay in a fixed position and not animate in/out when the active selection changes.
- Use fixed pixel dimensions for video/thumbnail sizing (no viewport or percentage units).
- Country videos must not have hover effects.
- Use Space Mono via `next/font/google` for monospace/eyebrow labels.
- Use Tabler icons (`@tabler/icons-react`); prefer filled variants for social icons like GitHub and Twitter.
- Modal/dialog overlays should close on outside-click, not only the explicit close button.
- Horizontal scrollers must have no visible scrollbar and smooth scroll behavior.
- Apply `text-wrap: balance` to descriptive paragraph text.
- The active item in the video rail should align flush-left with the main content container regardless of how navigation happened (mouse, click, or arrow keys).

## Learned Workspace Facts

- Turborepo monorepo using Bun (`bun.lock`); only `apps/web` (Next.js 16 app router, React 19) is active:  `apps/docs` was removed.
- Product brand is "Loomix"; app icon at `apps/web/public/icon.png`, favicon at `apps/web/app/favicon.ico`.
- Country teaser videos are hosted on `https://cdn.harshsingh.me/` as `.webm` files (`croatia.webm`, `kyrgyzstan.webm`, `laos.webm`, `new-zealand.webm`, `peru.webm`, `tanzania.webm`, `turks-and-caicos.webm`). They are referenced by full URL from `apps/web/app/page.tsx` and are not stored in the repo.
- Stack pins in `apps/web`: Next.js 16.2, React 19.2, Tailwind v4 (`@tailwindcss/postcss`), `motion` ^12, `@tabler/icons-react` ^3, TypeScript 5.9.
- Web dev server runs on port 3000 via `next dev --port 3000`; before starting a new one, check existing terminals in `.cursor/projects/.../terminals/` since port 3000 is often already in use.
- Type-check the web app with `npm run check-types` (runs `next typegen && tsc --noEmit`); lint with `npm run lint` from `apps/web`.
