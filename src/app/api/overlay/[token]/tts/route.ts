import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { normalizeTtsLang, synthesizeSpeech, ttsAudioResponse } from "@/lib/tts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const text = new URL(req.url).searchParams.get("text") || "";
  const user = await prisma.user.findUnique({
    where: { overlayToken: token },
    select: { ttsLang: true },
  });
  if (!user) {
    return jsonError("Not found", 404);
  }
  try {
    return ttsAudioResponse(await synthesizeSpeech(text, normalizeTtsLang(user.ttsLang)));
  } catch {
    return jsonError("Не вдалося озвучити", 502);
  }
}
