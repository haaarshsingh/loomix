import { promises as fs } from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
  target: "es2022",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["react", "react-dom"],
  // esbuild's bundler strips module-level `"use client"` directives, so we
  // re-prepend the directive to the final outputs after the build. Without
  // this, consumers using the Next.js App Router would treat `LoomixPlayer`
  // as a Server Component and crash on the first hook call.
  onSuccess: async () => {
    const files = ["dist/index.js", "dist/index.cjs"];
    await Promise.all(
      files.map(async (rel) => {
        const file = path.resolve(rel);
        const contents = await fs.readFile(file, "utf8");
        if (contents.startsWith('"use client"')) return;
        await fs.writeFile(file, `"use client";\n${contents}`);
      }),
    );
  },
});
