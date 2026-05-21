import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loomix Player",
    short_name: "Loomix",
    description:
      "A polished, customizable React video player UI. Drop in a single component for scrubbable progress, volume, playback speed, captions, picture-in-picture, fullscreen, and YouTube — installable via the shadcn CLI or as an npm package.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
