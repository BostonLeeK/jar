export const PAGE_THEMES = [
  {
    id: "midnight",
    name: "Noir",
    tag: "Темна",
    heading: "sans",
    background: "#0a0a0a",
    accent: "#ffffff",
    button: "#ffffff",
    text: "#f6f6f6",
    muted: "rgba(246,246,246,0.58)",
    surface: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.14)",
    field: "rgba(255,255,255,0.08)",
    buttonText: "#111111",
    radius: "999px",
    track: "rgba(255,255,255,0.16)",
    veil: "linear-gradient(90deg, #0a0a0a 0%, #0a0a0a 52%, rgba(10,10,10,0.35) 72%, transparent 100%)",
    note: "More good games",
    tone: "dark",
  },
  {
    id: "paper",
    name: "Paper",
    tag: "Скетч",
    heading: "script",
    background: "#f2e6d0",
    accent: "#2a241c",
    button: "#2a241c",
    text: "#2a241c",
    muted: "rgba(42,36,28,0.62)",
    surface: "rgba(255,250,242,0.7)",
    border: "rgba(42,36,28,0.14)",
    field: "rgba(255,255,255,0.72)",
    buttonText: "#f6efe3",
    radius: "999px",
    track: "rgba(42,36,28,0.14)",
    veil: "linear-gradient(90deg, #f2e6d0 0%, #f2e6d0 52%, rgba(242,230,208,0.4) 72%, transparent 100%)",
    note: "thank you",
    tone: "light",
  },
  {
    id: "violet",
    name: "Neon",
    tag: "Ніч",
    heading: "sans",
    background: "#12081c",
    accent: "#c084fc",
    button: "linear-gradient(90deg, #a855f7 0%, #7c3aed 100%)",
    text: "#f5f3ff",
    muted: "rgba(245,243,255,0.62)",
    surface: "rgba(168,85,247,0.1)",
    border: "rgba(192,132,252,0.28)",
    field: "rgba(8,4,16,0.55)",
    buttonText: "#ffffff",
    radius: "999px",
    track: "rgba(255,255,255,0.14)",
    veil: "linear-gradient(90deg, #12081c 0%, #12081c 50%, rgba(18,8,28,0.4) 72%, transparent 100%)",
    note: "good games good people",
    tone: "dark",
  },
  {
    id: "aurora",
    name: "Pink",
    tag: "Cute",
    heading: "rounded",
    background: "#ffd6e7",
    accent: "#e11d74",
    button: "#ec4899",
    text: "#831843",
    muted: "rgba(131,24,67,0.62)",
    surface: "rgba(255,255,255,0.45)",
    border: "rgba(236,72,153,0.22)",
    field: "rgba(255,255,255,0.7)",
    buttonText: "#ffffff",
    radius: "999px",
    track: "rgba(236,72,153,0.22)",
    veil: "linear-gradient(90deg, #ffd6e7 0%, #ffd6e7 52%, rgba(255,214,231,0.4) 72%, transparent 100%)",
    note: "",
    tone: "light",
  },
  {
    id: "mono",
    name: "Sky",
    tag: "Подорож",
    heading: "sans",
    background: "#eef3f8",
    accent: "#2b8fff",
    button: "linear-gradient(90deg, #38bdf8 0%, #2b8fff 100%)",
    text: "#16324f",
    muted: "rgba(22,50,79,0.58)",
    surface: "rgba(255,255,255,0.7)",
    border: "rgba(43,143,255,0.2)",
    field: "rgba(255,255,255,0.82)",
    buttonText: "#ffffff",
    radius: "999px",
    track: "rgba(22,50,79,0.12)",
    veil: "linear-gradient(90deg, #eef3f8 0%, #eef3f8 52%, rgba(238,243,248,0.4) 72%, transparent 100%)",
    note: "explore stream repeat",
    tone: "light",
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

export function headingClass(theme: PageTheme) {
  if (theme.heading === "script") {
    return "font-[family-name:var(--font-caveat)] font-bold tracking-tight";
  }
  if (theme.heading === "rounded") {
    return "font-[family-name:var(--font-nunito)] font-extrabold tracking-tight";
  }
  return "font-semibold tracking-tight";
}
