https://github.com/user-attachments/assets/b581a248-5c61-4520-a0ad-c2fe5f962e5a

# Halftone Dots

Recreate any image as an animated **halftone dot field** on a single HTML5 `<canvas>` — and morph between images with a dramatic radial wave (the old dots implode from the center, the new ones explode back in with overshoot).

It's one component, no animation libraries: just `requestAnimationFrame` + a little canvas math.

## How it works

1. The source image is drawn into a small offscreen buffer and **supersampled** — each output cell measures its *ink coverage* (fraction of non-white pixels) and the average ink color.
2. Each cell becomes a dot whose **radius tracks coverage** and whose color comes from the source (or an optional gradient override). White/background is keyed out.
3. Dots are painted on one supersampled `<canvas>` (crisp on HiDPI). On `src` change, a radial-wave morph animates them out and back in.
4. Honors `prefers-reduced-motion` (renders instantly, no morph).

## Usage

```tsx
import { DotHalftone } from './DotHalftone'

export default function Example() {
  return (
    <DotHalftone
      src="/samples/city.png"
      // optional top→bottom gradient that recolors the dots
      gradient={['#ff6ea6', '#7b2ff7']}
      accent="#5b21ff"
      style={{ width: 420, height: 420 }}
    />
  )
}
```

### Props

| Prop        | Type                       | Default     | Description                                         |
| ----------- | -------------------------- | ----------- | --------------------------------------------------- |
| `src`       | `string`                   | —           | Image to recreate as dots. Changing it morphs.      |
| `gradient`  | `[string, string]`         | —           | Optional top→bottom hex gradient recoloring dots.   |
| `accent`    | `string`                   | `'#5b21ff'` | Corner-cluster accent color.                        |
| `className` | `string`                   | —           | Class for the (relative) container.                 |
| `style`     | `React.CSSProperties`      | —           | Inline styles; set the size here or via `className`.|

> Tip: images with a **white/transparent background** and clear subject work best (the background is keyed out). Square sources fill the frame most naturally.

## Develop

```bash
pnpm install
pnpm dev
```
