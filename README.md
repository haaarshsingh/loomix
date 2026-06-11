![image](https://loomix.harshsingh.me/og.png)

<p align="center">
  <a href="https://loomix.harshsingh.me">
    <h2 align="center">Loomix</h2>
  </a>
</p>

<p align="center">A drop-in replacement for the native HTML5 video element, with a beautifully customizable UI.</p>

### Packages

- **ui**: `@repo/ui` — internal workspace containing the `LoomixPlayer` React component source. Published publicly as the `loomix` npm package and via the shadcn registry served from `apps/web/registry`.

### Apps

- **web**: official demo website and documentation (`apps/web`), deployed at [loomix.harshsingh.me](https://loomix.harshsingh.me).

### Install

```bash
# via the shadcn CLI (recommended, copies the source into your project)
npx shadcn@latest add https://loomix.harshsingh.me/r/loomix-player.json

# or as a traditional npm package
npm install loomix
# or
pnpm add loomix
# or
bun add loomix
```

### Monorepo development

Requirements: Node 20+ and Bun.

```bash
git clone https://github.com/haaarshsingh/loomix
cd loomix
bun install

# develop demo app and packages
bun run dev

# build all packages/apps
bun run build

# type-check and lint
bun run check-types
bun run lint
```

Scripts are powered by Turborepo and run across workspaces. See `package.json` and `turbo.json` for details.

### Usage

```tsx
import { LoomixPlayer } from "@/components/ui/loomix-player";

export default function Demo() {
  return (
    <LoomixPlayer
      src="/video.webm"
      youtubeUrl="https://youtu.be/dQw4w9WgXcQ"
      className="aspect-video w-full max-w-4xl"
    />
  );
}
```

***

Built by [Harsh Singh](https://harshsingh.me)
