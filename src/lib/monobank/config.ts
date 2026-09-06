import { getAppUrl } from "@/lib/urls";

const DEFAULT_BASE_URL = "https://api.monobank.ua";

export function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

export function monobankConfigured() {
  return Boolean(process.env.MONOBANK_KEY_ID?.trim() && process.env.MONOBANK_PRIVATE_KEY?.trim());
}

export function getMonobankConfig() {
  const keyId = process.env.MONOBANK_KEY_ID?.trim() ?? "";
  const privateKeyRaw = process.env.MONOBANK_PRIVATE_KEY ?? "";
  if (!keyId || !privateKeyRaw.trim()) {
    throw new Error("Monobank Provider API не налаштовано");
  }
  const origin = getAppUrl();
  return {
    baseUrl: (process.env.MONOBANK_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, ""),
    keyId,
    privateKey: normalizePrivateKey(privateKeyRaw),
    callbackUrl: (process.env.MONOBANK_CALLBACK_URL?.trim() || `${origin}/api/integrations/monobank/callback`).replace(
      /\/$/,
      "",
    ),
    webhookUrl: (process.env.MONOBANK_WEBHOOK_URL?.trim() || `${origin}/api/integrations/monobank/webhook`).replace(
      /\/$/,
      "",
    ),
  };
}
