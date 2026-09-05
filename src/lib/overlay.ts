export const OVERLAY_TONES = ["dark", "light"] as const;
export const OVERLAY_STYLES = ["minimal", "card", "banner"] as const;

export type OverlayTone = (typeof OVERLAY_TONES)[number];
export type OverlayStyle = (typeof OVERLAY_STYLES)[number];

export function isOverlayTone(value: string): value is OverlayTone {
  return OVERLAY_TONES.includes(value as OverlayTone);
}

export function isOverlayStyle(value: string): value is OverlayStyle {
  return OVERLAY_STYLES.includes(value as OverlayStyle);
}

export function overlayPalette(tone: string) {
  if (tone === "light") {
    return {
      text: "#111827",
      muted: "rgba(17,24,39,0.58)",
      dim: "rgba(17,24,39,0.38)",
      surface: "rgba(255,255,255,0.88)",
      border: "rgba(17,24,39,0.12)",
      track: "rgba(17,24,39,0.12)",
    };
  }
  return {
    text: "#ffffff",
    muted: "rgba(255,255,255,0.7)",
    dim: "rgba(255,255,255,0.4)",
    surface: "rgba(0,0,0,0.72)",
    border: "rgba(255,255,255,0.16)",
    track: "rgba(255,255,255,0.16)",
  };
}
