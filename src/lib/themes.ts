export const PAGE_THEMES = [
  {
    id: "midnight",
    name: "Midnight",
    tag: "Темна картка",
    layout: "center",
    background: "#0b0d12",
    accent: "#ffffff",
    text: "#f5f5f5",
    muted: "rgba(255,255,255,0.55)",
    surface: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    field: "rgba(0,0,0,0.35)",
    buttonText: "#0b0d12",
    radius: "24px",
    glow: "none",
  },
  {
    id: "aurora",
    name: "Aurora",
    tag: "Неон",
    layout: "center",
    background: "#070814",
    accent: "#7cffb2",
    text: "#eef6ff",
    muted: "rgba(238,246,255,0.6)",
    surface: "rgba(124,255,178,0.08)",
    border: "rgba(124,255,178,0.22)",
    field: "rgba(8,10,24,0.7)",
    buttonText: "#07110b",
    radius: "28px",
    glow: "radial-gradient(circle at 20% 10%, rgba(124,255,178,0.22), transparent 36%), radial-gradient(circle at 90% 80%, rgba(88,120,255,0.28), transparent 40%)",
  },
  {
    id: "violet",
    name: "Violet",
    tag: "Twitch",
    layout: "cover",
    background: "#0e0e10",
    accent: "#bf94ff",
    text: "#efeff1",
    muted: "rgba(239,239,241,0.62)",
    surface: "#18181b",
    border: "rgba(191,148,255,0.28)",
    field: "#0e0e10",
    buttonText: "#0e0e10",
    radius: "18px",
    glow: "linear-gradient(180deg, #5c16c5 0%, #0e0e10 42%)",
  },
  {
    id: "paper",
    name: "Paper",
    tag: "Світла",
    layout: "center",
    background: "#f4efe6",
    accent: "#1b1713",
    text: "#1b1713",
    muted: "rgba(27,23,19,0.58)",
    surface: "#fffaf2",
    border: "rgba(27,23,19,0.12)",
    field: "#fff",
    buttonText: "#f4efe6",
    radius: "20px",
    glow: "none",
  },
  {
    id: "mono",
    name: "Mono",
    tag: "Жорстка",
    layout: "split",
    background: "#000000",
    accent: "#ffffff",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.5)",
    surface: "#000000",
    border: "#ffffff",
    field: "#000000",
    buttonText: "#000000",
    radius: "0px",
    glow: "none",
  },
] as const;

export type PageThemeId = (typeof PAGE_THEMES)[number]["id"];
export type PageTheme = (typeof PAGE_THEMES)[number];

export function getPageTheme(id?: string | null): PageTheme {
  return PAGE_THEMES.find((theme) => theme.id === id) ?? PAGE_THEMES[0];
}

export function isPageThemeId(id: string): id is PageThemeId {
  return PAGE_THEMES.some((theme) => theme.id === id);
}
