import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type RegistryFileSpec = {
  path: string;
  type: string;
  target?: string;
};

type RegistryItem = {
  $schema?: string;
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: Array<RegistryFileSpec & { content?: string }>;
};

const REGISTRY_DIR = path.join(process.cwd(), "registry");

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name: rawName } = await context.params;
  const name = rawName.replace(/\.json$/u, "");

  if (name === "registry") {
    const indexPath = path.join(REGISTRY_DIR, "registry.json");
    const index = await fs.readFile(indexPath, "utf8");
    return new NextResponse(index, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, s-maxage=60, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const descriptorPath = path.join(REGISTRY_DIR, "components", `${name}.json`);

  let raw: string;
  try {
    raw = await fs.readFile(descriptorPath, "utf8");
  } catch {
    return NextResponse.json(
      { error: `Registry item '${name}' not found.` },
      { status: 404 },
    );
  }

  const descriptor = JSON.parse(raw) as RegistryItem;
  const filesWithContent = await Promise.all(
    descriptor.files.map(async (file) => {
      const sourcePath = path.join(REGISTRY_DIR, file.path);
      const content = await fs.readFile(sourcePath, "utf8");
      return { ...file, content };
    }),
  );

  const body: RegistryItem = {
    ...descriptor,
    files: filesWithContent,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=60, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
