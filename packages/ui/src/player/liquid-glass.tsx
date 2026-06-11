"use client";

import * as React from "react";

/* ----------------------------------------------------------------------------
 * Liquid glass refraction (after https://kube.io/blog/liquid-glass-css-svg/):
 * simulate light refracting through a circular glass button (Snell's law on a
 * convex-squircle bezel profile), bake the resulting radial displacement field
 * into an SVG displacement map (R = x, G = y, 128 = neutral), and apply it to
 * the backdrop via `backdrop-filter: url(#filter)` (Chromium-only; elsewhere
 * the buttons fall back to their regular backdrop blur).
 * ------------------------------------------------------------------------- */

const GLASS_IOR = 1.5;

/** Apple-style convex squircle bezel profile: y = (1 - (1 - x)^4)^(1/4). */
function convexSquircleHeight(x: number): number {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
}

export type GlassAssets = {
  displacementUrl: string;
  specularUrl: string;
  scale: number;
};

/**
 * Builds the two filter images for a circular glass button of `size` px:
 *
 * 1. A displacement map (R = x, G = y, 128 = neutral) combining a Snell's-law
 *    bezel refraction (ray-traced over the squircle profile, symmetric around
 *    the rim so a single radius is simulated and rotated) with an interior
 *    lens magnification, sampling inward like the article's magnifying glass.
 * 2. A specular rim-light image (white, alpha-encoded) blended over the
 *    refracted backdrop with `feBlend mode="screen"`.
 */
function buildGlassAssets(size: number): GlassAssets {
  const radius = size / 2;
  const bezelWidth = radius * 0.5;
  const glassHeight = radius * 0.75;
  // Interior zoom: sample offset grows linearly from the centre, i.e. the
  // backdrop under the flat part of the glass is uniformly magnified.
  const zoom = 0.2;
  // Artistic boost on top of the physical magnitudes (the article: scale can
  // be tweaked/animated freely without recomputing the map).
  const REFRACTION_BOOST = 2;

  // Pre-calculate bezel displacement magnitudes along one radius
  // (127 samples, matching the 8-bit displacement map resolution).
  const SAMPLES = 127;
  const bezelMagnitudes = new Float64Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    const x = i / (SAMPLES - 1);
    const delta = 0.001;
    const x1 = Math.max(x - delta, 0);
    const x2 = Math.min(x + delta, 1);
    const slope =
      ((convexSquircleHeight(x2) - convexSquircleHeight(x1)) / (x2 - x1)) *
      (glassHeight / bezelWidth);
    const theta1 = Math.atan(Math.abs(slope));
    const theta2 = Math.asin(Math.sin(theta1) / GLASS_IOR);
    const height = convexSquircleHeight(x) * glassHeight;
    bezelMagnitudes[i] = height * Math.tan(theta1 - theta2);
  }

  const magnitudeAt = (dist: number): number => {
    const zoomMagnitude = dist * zoom;
    const fromEdge = radius - dist;
    if (fromEdge >= bezelWidth) return zoomMagnitude;
    const t = Math.max(fromEdge / bezelWidth, 0);
    const index = Math.min(SAMPLES - 1, Math.round(t * (SAMPLES - 1)));
    return Math.max(bezelMagnitudes[index]!, zoomMagnitude);
  };

  let maxMagnitude = 0;
  for (let d = 0; d <= radius; d += 0.25) {
    maxMagnitude = Math.max(maxMagnitude, magnitudeAt(d));
  }

  const displacement = document.createElement("canvas");
  displacement.width = size;
  displacement.height = size;
  const displacementCtx = displacement.getContext("2d")!;
  const displacementImage = displacementCtx.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px + 0.5 - radius;
      const dy = py + 0.5 - radius;
      const dist = Math.hypot(dx, dy);
      let r = 128;
      let g = 128;
      if (dist > 0 && dist <= radius && maxMagnitude > 0) {
        const magnitude = magnitudeAt(dist) / maxMagnitude;
        // Convex glass bends rays toward the centre: sample inward so the
        // backdrop appears magnified through the lens.
        r = Math.round(128 + (-dx / dist) * magnitude * 127);
        g = Math.round(128 + (-dy / dist) * magnitude * 127);
      }
      const offset = (py * size + px) * 4;
      displacementImage.data[offset] = r;
      displacementImage.data[offset + 1] = g;
      displacementImage.data[offset + 2] = 128;
      displacementImage.data[offset + 3] = 255;
    }
  }
  displacementCtx.putImageData(displacementImage, 0, 0);

  // Specular rim light: intensity peaks mid-rim and varies with the angle
  // between the rim normal and a fixed light direction, with a fainter
  // counter-light on the opposite edge.
  const specular = document.createElement("canvas");
  specular.width = size;
  specular.height = size;
  const specularCtx = specular.getContext("2d")!;
  const specularImage = specularCtx.createImageData(size, size);
  const rimWidth = Math.max(2, radius * 0.22);
  const lightAngle = -Math.PI * 0.75; // top-left
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px + 0.5 - radius;
      const dy = py + 0.5 - radius;
      const dist = Math.hypot(dx, dy);
      let alpha = 0;
      const fromEdge = radius - dist;
      if (dist > 0 && fromEdge >= 0 && fromEdge < rimWidth) {
        const band = Math.sin((1 - fromEdge / rimWidth) * Math.PI * 0.5);
        const angle = Math.atan2(dy, dx);
        const main = Math.pow(Math.max(Math.cos(angle - lightAngle), 0), 2);
        const counter = Math.pow(
          Math.max(Math.cos(angle - lightAngle - Math.PI), 0),
          2,
        );
        alpha = Math.round(band * (main + counter * 0.45) * 0.9 * 255);
      }
      const offset = (py * size + px) * 4;
      specularImage.data[offset] = 255;
      specularImage.data[offset + 1] = 255;
      specularImage.data[offset + 2] = 255;
      specularImage.data[offset + 3] = alpha;
    }
  }
  specularCtx.putImageData(specularImage, 0, 0);

  // The map is normalized to the max displacement, so the max (in px) drives
  // the filter's `scale`.
  return {
    displacementUrl: displacement.toDataURL(),
    specularUrl: specular.toDataURL(),
    scale: maxMagnitude * REFRACTION_BOOST,
  };
}

/** Client-side liquid glass filter images for a circular button of `size` px. */
export function useLiquidGlass(size: number): GlassAssets | null {
  const [assets, setAssets] = React.useState<GlassAssets | null>(null);
  React.useEffect(() => {
    setAssets(buildGlassAssets(size));
  }, [size]);
  return assets;
}

/**
 * SVG filter combining refraction and the specular highlight: displace the
 * backdrop through the lens map, then screen the rim light over the result.
 */
export function GlassFilter({
  id,
  assets,
  size,
}: {
  id: string;
  assets: GlassAssets;
  size: number;
}) {
  return (
    <filter
      id={id}
      x="0"
      y="0"
      width="100%"
      height="100%"
      colorInterpolationFilters="sRGB"
    >
      <feImage
        href={assets.displacementUrl}
        x={0}
        y={0}
        width={size}
        height={size}
        result="displacement_map"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="displacement_map"
        scale={assets.scale}
        xChannelSelector="R"
        yChannelSelector="G"
        result="refracted"
      />
      <feImage
        href={assets.specularUrl}
        x={0}
        y={0}
        width={size}
        height={size}
        result="specular"
      />
      <feBlend in="specular" in2="refracted" mode="screen" />
    </filter>
  );
}
