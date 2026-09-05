export const ASSET_PRESETS = [
  {
    id: "panel",
    name: "Кнопка панелі Twitch",
    hint: "320×96 · PNG 960×288",
    width: 320,
    height: 96,
    kind: "button",
  },
  {
    id: "panel-wide",
    name: "Панель Twitch",
    hint: "320×160 · PNG 960×480",
    width: 320,
    height: 160,
    kind: "card",
  },
  {
    id: "profile",
    name: "Банер профілю",
    hint: "1200×480 · PNG 2400×960",
    width: 1200,
    height: 480,
    kind: "banner",
  },
  {
    id: "offline",
    name: "Офлайн-екран",
    hint: "1920×1080 · PNG 3840×2160",
    width: 1920,
    height: 1080,
    kind: "stage",
  },
  {
    id: "square",
    name: "Квадрат",
    hint: "800×800 · PNG 1600×1600",
    width: 800,
    height: 800,
    kind: "square",
  },
] as const;

export type AssetPreset = (typeof ASSET_PRESETS)[number];
export type AssetPresetId = AssetPreset["id"];

export function assetExportScale(preset: AssetPreset) {
  return preset.width <= 400 ? 3 : 2;
}
