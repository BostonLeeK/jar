export const TTS_LANGS = ["uk", "en"] as const;

export type TtsLang = (typeof TTS_LANGS)[number];

const VOICES: Record<TtsLang, string> = {
  uk: "uk-UA-PolinaNeural",
  en: "en-US-JennyNeural",
};

export const TTS_LANG_LABELS: Record<TtsLang, string> = {
  uk: "Українська",
  en: "English",
};

export const TTS_SAMPLE: Record<TtsLang, string> = {
  uk: "Привіт, це перевірка озвучки. Дякую за донат.",
  en: "Hello, this is a voice check. Thanks for the donation.",
};

export function isTtsLang(value: string): value is TtsLang {
  return TTS_LANGS.includes(value as TtsLang);
}

export function normalizeTtsLang(value?: string | null): TtsLang {
  return value === "en" ? "en" : "uk";
}

function cleanText(text: string) {
  return text.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
}

async function googleTts(text: string, lang: TtsLang) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += 180) {
    chunks.push(text.slice(i, i + 180));
  }
  const parts: Uint8Array[] = [];
  for (const chunk of chunks) {
    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("tl", lang);
    url.searchParams.set("q", chunk);
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });
    if (!res.ok) {
      throw new Error("google-tts");
    }
    parts.push(new Uint8Array(await res.arrayBuffer()));
  }
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

export async function synthesizeSpeech(text: string, lang: TtsLang) {
  const spoken = cleanText(text);
  if (!spoken) {
    throw new Error("empty");
  }
  try {
    const { UniversalEdgeTTS } = await import("edge-tts-universal");
    const tts = new UniversalEdgeTTS(spoken, VOICES[lang]);
    const result = await tts.synthesize();
    return new Uint8Array(await result.audio.arrayBuffer());
  } catch {
    return googleTts(spoken, lang);
  }
}

export function ttsAudioResponse(audio: Uint8Array) {
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
