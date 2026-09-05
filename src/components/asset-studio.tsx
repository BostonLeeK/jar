"use client";

import { CopyField } from "@/components/copy-field";
import { Button, Card, Input, Label } from "@/components/ui";
import { ASSET_PRESETS, assetExportScale, type AssetPreset } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { getPageTheme, PAGE_THEMES, type PageTheme } from "@/lib/themes";
import { useEffect, useRef, useState } from "react";

function loadImage(src: string | null | undefined) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function headingFont(theme: PageTheme, size: number) {
  if (theme.heading === "script") {
    return `700 ${size}px Caveat, cursive`;
  }
  if (theme.heading === "rounded") {
    return `800 ${size}px Nunito, sans-serif`;
  }
  return `600 ${size}px Inter, sans-serif`;
}

function paintFill(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (!value.startsWith("linear-gradient")) {
    ctx.fillStyle = value;
    return;
  }
  const colors = value.match(/#(?:[0-9a-fA-F]{3,8})\b/g) ?? [];
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  if (!colors.length) {
    ctx.fillStyle = "#ffffff";
    return;
  }
  colors.forEach((color, index) => {
    gradient.addColorStop(colors.length === 1 ? 0 : index / (colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

type Photo = HTMLImageElement | ImageBitmap;

function coverDraw(
  ctx: CanvasRenderingContext2D,
  image: Photo,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
}

function glow(ctx: CanvasRenderingContext2D, theme: PageTheme, width: number, height: number) {
  const gradient = ctx.createRadialGradient(width * 0.72, height * 0.38, 0, width * 0.72, height * 0.38, width * 0.55);
  gradient.addColorStop(0, theme.tone === "light" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.16)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function veil(ctx: CanvasRenderingContext2D, theme: PageTheme, width: number, height: number, kind: AssetPreset["kind"]) {
  const light = theme.tone === "light";
  if (kind === "banner" || kind === "stage") {
    const fade = ctx.createLinearGradient(0, 0, width * 0.72, 0);
    fade.addColorStop(0, light ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.78)");
    fade.addColorStop(0.55, light ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  ctx.fillStyle = light ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  ctx.fillRect(0, 0, width, height);
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  height: number,
  theme: PageTheme,
) {
  if (!logo) {
    return 0;
  }
  const width = (logo.width / logo.height) * height;
  ctx.save();
  if (theme.tone === "light") {
    ctx.filter = "invert(1)";
  }
  ctx.drawImage(logo, x, y, width, height);
  ctx.restore();
  return width;
}

function drawAsset(
  canvas: HTMLCanvasElement,
  preset: AssetPreset,
  theme: PageTheme,
  title: string,
  label: string,
  url: string,
  logo: HTMLImageElement | null,
  cover: Photo | null,
) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    return;
  }
  const { width, height, kind } = preset;
  const scale = assetExportScale(preset);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
  if (cover) {
    coverDraw(ctx, cover, 0, 0, width, height);
    veil(ctx, theme, width, height, kind);
  } else {
    glow(ctx, theme, width, height);
  }

  const host = url.replace(/^https?:\/\//, "");
  const col = kind === "banner" || kind === "stage" ? width * 0.46 : width;

  if (kind === "button") {
    const pad = 10;
    roundRect(ctx, pad, pad, width - pad * 2, height - pad * 2, height);
    paintFill(ctx, theme.button, pad, pad, width - pad * 2, height - pad * 2);
    ctx.fill();
    ctx.fillStyle = theme.buttonText;
    ctx.font = `700 ${Math.round(height * 0.28)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, width / 2, height / 2);
    return;
  }

  const layout =
    kind === "card"
      ? { pad: 16, logo: 16, title: 22, url: 11, btnH: 34, btnW: width - 32 }
      : kind === "square"
        ? { pad: 56, logo: 36, title: 64, url: 22, btnH: 64, btnW: 360 }
        : kind === "banner"
          ? { pad: 48, logo: 28, title: 56, url: 20, btnH: 56, btnW: 280 }
          : { pad: 96, logo: 44, title: 92, url: 28, btnH: 72, btnW: 360 };

  drawLogo(ctx, logo, layout.pad, layout.pad, layout.logo, theme);

  const titleY = layout.pad + layout.logo + (kind === "card" ? 28 : layout.title + 12);
  ctx.fillStyle = theme.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = headingFont(theme, layout.title);
  ctx.fillText(title, layout.pad, titleY, col - layout.pad * 2);

  const urlY = titleY + layout.url + (kind === "card" ? 10 : 16);
  ctx.fillStyle = theme.muted;
  ctx.font = `500 ${layout.url}px Inter, sans-serif`;
  ctx.fillText(host, layout.pad, urlY, col - layout.pad * 2);

  const btnY = height - layout.pad - layout.btnH;
  roundRect(ctx, layout.pad, btnY, layout.btnW, layout.btnH, layout.btnH);
  paintFill(ctx, theme.button, layout.pad, btnY, layout.btnW, layout.btnH);
  ctx.fill();
  ctx.fillStyle = theme.buttonText;
  ctx.font = `700 ${Math.round(layout.btnH * 0.38)}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, layout.pad + layout.btnW / 2, btnY + layout.btnH / 2);
}

function AssetCard({
  preset,
  theme,
  title,
  label,
  url,
  logo,
  cover,
}: {
  preset: AssetPreset;
  theme: PageTheme;
  title: string;
  label: string;
  url: string;
  logo: HTMLImageElement | null;
  cover: Photo | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const node = canvas.current;
    if (!node) {
      return;
    }
    void document.fonts.ready.then(() => {
      drawAsset(node, preset, theme, title, label, url, logo, cover);
    });
  }, [cover, label, logo, preset, theme, title, url]);

  async function download() {
    const node = canvas.current;
    if (!node) {
      return;
    }
    setBusy(true);
    const blob = await new Promise<Blob | null>((resolve) => node.toBlob(resolve, "image/png"));
    setBusy(false);
    if (!blob) {
      return;
    }
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `jar-${preset.id}-${title.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, "-")}.png`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50 p-4">
        <canvas
          ref={canvas}
          className="mx-auto block h-auto max-h-56 w-auto max-w-full"
          style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
        />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-medium">{preset.name}</p>
          <p className="mt-1 text-xs text-zinc-500">{preset.hint}</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void download()} disabled={busy}>
          {busy ? "…" : "Завантажити PNG"}
        </Button>
      </div>
    </Card>
  );
}

export function AssetStudio({
  name,
  slug,
  themeId,
  donateUrl,
  cover,
}: {
  name: string;
  slug: string;
  themeId: string;
  donateUrl: string;
  cover: string | null;
}) {
  const [theme, setTheme] = useState(themeId);
  const [label, setLabel] = useState("Підтримати →");
  const [title, setTitle] = useState(name);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(cover);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [drag, setDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const localUrl = useRef<string | null>(null);
  const bitmap = useRef<ImageBitmap | null>(null);
  const selected = getPageTheme(theme);

  useEffect(() => {
    void loadImage("/jar-logo.png").then(setLogo);
  }, []);

  useEffect(() => {
    if (!cover || localUrl.current) {
      return;
    }
    void loadImage(cover).then((image) => {
      if (image) {
        setPhoto(image);
      }
    });
  }, [cover]);

  useEffect(() => {
    return () => {
      if (localUrl.current) {
        URL.revokeObjectURL(localUrl.current);
      }
      bitmap.current?.close();
    };
  }, []);

  async function setBackground(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }
    if (localUrl.current) {
      URL.revokeObjectURL(localUrl.current);
    }
    bitmap.current?.close();
    bitmap.current = null;
    const next = URL.createObjectURL(file);
    localUrl.current = next;
    setBgUrl(next);
    try {
      const decoded = await createImageBitmap(file);
      bitmap.current = decoded;
      setPhoto(decoded);
    } catch {
      const image = await loadImage(next);
      setPhoto(image);
    }
  }

  function clearBackground() {
    if (localUrl.current) {
      URL.revokeObjectURL(localUrl.current);
      localUrl.current = null;
    }
    bitmap.current?.close();
    bitmap.current = null;
    setBgUrl(null);
    setPhoto(null);
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <CopyField
          label="Посилання на донати"
          value={donateUrl}
          hint="У Twitch: Creator Dashboard → About → Edit panels → Add Image → встав це посилання."
        />
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div>
            <Label htmlFor="asset-title">Заголовок</Label>
            <Input id="asset-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="asset-label">Текст кнопки</Label>
            <Input id="asset-label" value={label} onChange={(event) => setLabel(event.target.value)} />
          </div>
        </div>
        <div>
          <Label>Фото на фон</Label>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDrag(false);
              void setBackground(event.dataTransfer.files[0]);
            }}
            className={cn(
              "relative h-32 w-full overflow-hidden rounded-2xl border bg-zinc-100",
              drag ? "border-zinc-900" : "border-zinc-200",
            )}
          >
            {bgUrl ? (
              <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${bgUrl}")` }} />
            ) : (
              <span className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center text-sm text-zinc-500">
                <span>Натисни або кинь фото сюди</span>
                <span className="text-xs text-zinc-400">JPG, PNG або WEBP</span>
              </span>
            )}
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}>
              Завантажити фото
            </Button>
            {bgUrl ? (
              <Button type="button" variant="ghost" onClick={clearBackground}>
                Прибрати
              </Button>
            ) : null}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void setBackground(file);
            }}
          />
        </div>
        <div>
          <Label>Стиль</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PAGE_THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={cn(
                  "cursor-pointer rounded-xl border px-3 py-2 text-left text-sm",
                  theme === item.id ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400",
                )}
              >
                <span className="mb-2 block h-2 rounded-full" style={{ background: item.accent }} />
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Кнопка 320×96 — стандартна панель Twitch. Банер і офлайн-екран тягни в налаштування каналу. Лінк на донат:{" "}
          <span className="font-mono">/d/{slug}</span>
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {ASSET_PRESETS.map((preset) => (
          <AssetCard
            key={preset.id}
            preset={preset}
            theme={selected}
            title={title || name}
            label={label || "Підтримати →"}
            url={donateUrl}
            logo={logo}
            cover={photo}
          />
        ))}
      </div>
    </div>
  );
}
