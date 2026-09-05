export const SOCIAL_FIELDS = [
  { key: "socialTwitch", kind: "twitch", label: "Twitch", placeholder: "bostonlee_k" },
  { key: "socialYoutube", kind: "youtube", label: "YouTube", placeholder: "@channel або URL" },
  { key: "socialDiscord", kind: "discord", label: "Discord", placeholder: "інвайт або URL" },
  { key: "socialInstagram", kind: "instagram", label: "Instagram", placeholder: "@nick" },
  { key: "socialTiktok", kind: "tiktok", label: "TikTok", placeholder: "@nick" },
  { key: "socialX", kind: "x", label: "X", placeholder: "@nick" },
] as const;

export type SocialKind = (typeof SOCIAL_FIELDS)[number]["kind"];
export type SocialKey = (typeof SOCIAL_FIELDS)[number]["key"];
export type SocialLinks = Record<SocialKind, string | null>;

const PREFIX: Record<SocialKind, string> = {
  twitch: "https://twitch.tv/",
  youtube: "https://youtube.com/@",
  discord: "https://discord.gg/",
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/@",
  x: "https://x.com/",
};

export function cleanSocialInput(value: string) {
  return value.trim().slice(0, 200);
}

export function socialHref(kind: SocialKind, value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) {
    return null;
  }
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
      }
      return url.toString();
    } catch {
      return null;
    }
  }
  const handle = raw.replace(/^@/, "").replace(/^\/+/, "");
  if (!handle) {
    return null;
  }
  return `${PREFIX[kind]}${handle}`;
}

export function resolveSocial(user: {
  twitchLogin?: string | null;
  socialTwitch?: string | null;
  socialYoutube?: string | null;
  socialDiscord?: string | null;
  socialInstagram?: string | null;
  socialTiktok?: string | null;
  socialX?: string | null;
}): SocialLinks {
  return {
    twitch: socialHref("twitch", user.socialTwitch) || socialHref("twitch", user.twitchLogin),
    youtube: socialHref("youtube", user.socialYoutube),
    discord: socialHref("discord", user.socialDiscord),
    instagram: socialHref("instagram", user.socialInstagram),
    tiktok: socialHref("tiktok", user.socialTiktok),
    x: socialHref("x", user.socialX),
  };
}

export function hasSocial(links: SocialLinks) {
  return Object.values(links).some(Boolean);
}
