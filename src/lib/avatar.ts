import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

const DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_BYTES = 2 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function avatarExt(type: string) {
  return TYPES[type] ?? null;
}

export function isAllowedAvatar(file: File) {
  return Boolean(avatarExt(file.type)) && file.size > 0 && file.size <= MAX_BYTES;
}

export async function saveAvatarFile(userId: string, file: File) {
  const ext = avatarExt(file.type);
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
  return `/uploads/avatars/${filename}?t=${Date.now()}`;
}

export async function removeAvatarFiles(userId: string) {
  const files = await readdir(DIR).catch(() => [] as string[]);
  await Promise.all(
    files
      .filter((name) => name.startsWith(`${userId}.`))
      .map((name) => unlink(path.join(DIR, name)).catch(() => undefined)),
  );
}
