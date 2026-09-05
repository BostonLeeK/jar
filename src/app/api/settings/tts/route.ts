import { jsonError } from "@/lib/http";
import { isTtsLang, normalizeTtsLang, synthesizeSpeech, ttsAudioResponse } from "@/lib/tts";
import { requireApiUser } from "@/lib/user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const query = new URL(req.url).searchParams;
  const text = query.get("text") || "";
  const lang = query.get("lang");
  try {
    return ttsAudioResponse(
      await synthesizeSpeech(text, lang && isTtsLang(lang) ? lang : normalizeTtsLang(user.ttsLang)),
    );
  } catch {
    return jsonError("Не вдалося озвучити", 502);
  }
}
