import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

const DIR = path.join(process.cwd(), "public", "uploads", "alerts");
const GIF_MAX = 8 * 1024 * 1024;
const AUDIO_MAX = 4 * 1024 * 1024;
const GIF_TYPES: Record<string, string> = {
  "image/gif": "gif",
  "image/webp": "webp",
  "image/png": "png",
};
const AUDIO_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

function extFor(kind: "gif" | "audio", type: string) {
  return (kind === "gif" ? GIF_TYPES : AUDIO_TYPES)[type] ?? null;
}

export function isAllowedAlertFile(kind: "gif" | "audio", file: File) {
  const ext = extFor(kind, file.type);
  const max = kind === "gif" ? GIF_MAX : AUDIO_MAX;
  return Boolean(ext) && file.size > 0 && file.size <= max;
}

export async function saveAlertFile(userId: string, tierId: string, kind: "gif" | "audio", file: File) {
  const ext = extFor(kind, file.type);
  if (!ext) {
    throw new Error("Непідтримуваний формат");
  }
  const dir = path.join(DIR, userId);
  await mkdir(dir, { recursive: true });
  const files = await readdir(dir).catch(() => [] as string[]);
  const prefix = `${tierId}.${kind}.`;
  await Promise.all(
    files
      .filter((name) => name.startsWith(prefix))
      .map((name) => unlink(path.join(dir, name)).catch(() => undefined)),
  );
  const filename = `${tierId}.${kind}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/alerts/${userId}/${filename}?t=${Date.now()}`;
}

export async function removeAlertFile(userId: string, tierId: string, kind?: "gif" | "audio") {
  const dir = path.join(DIR, userId);
  const files = await readdir(dir).catch(() => [] as string[]);
  const prefix = kind ? `${tierId}.${kind}.` : `${tierId}.`;
  await Promise.all(
    files
      .filter((name) => name.startsWith(prefix))
      .map((name) => unlink(path.join(dir, name)).catch(() => undefined)),
  );
}
