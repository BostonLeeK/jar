import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

const DIR = path.join(process.cwd(), "public", "uploads", "covers");
const MAX_BYTES = 15 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function coverExt(type: string) {
  return TYPES[type] ?? null;
}

export function isAllowedCover(file: File) {
  return Boolean(coverExt(file.type)) && file.size > 0 && file.size <= MAX_BYTES;
}

export async function saveCoverFile(userId: string, file: File) {
  const ext = coverExt(file.type);
  if (!ext) {
    throw new Error("Непідтримуваний формат");
  }
  await mkdir(DIR, { recursive: true });
  const files = await readdir(DIR).catch(() => [] as string[]);
  await Promise.all(
    files
      .filter((name) => name.startsWith(`${userId}.`))
      .map((name) => unlink(path.join(DIR, name)).catch(() => undefined)),
  );
  const filename = `${userId}.${ext}`;
  await writeFile(path.join(DIR, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/covers/${filename}?t=${Date.now()}`;
}

export async function removeCoverFiles(userId: string) {
  const files = await readdir(DIR).catch(() => [] as string[]);
  await Promise.all(
    files
      .filter((name) => name.startsWith(`${userId}.`))
      .map((name) => unlink(path.join(DIR, name)).catch(() => undefined)),
  );
}
