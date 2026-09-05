import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ROOT = path.resolve(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  webm: "audio/webm",
};

export async function GET(_req: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  if (!segments.length || segments.some((part) => part === ".." || part.includes("\\") || part.includes("/"))) {
    return new Response("Not found", { status: 404 });
  }
  const file = path.resolve(ROOT, ...segments);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await readFile(file);
    const ext = path.extname(file).slice(1).toLowerCase();
    return new Response(data, {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
