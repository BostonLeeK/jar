import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { isValidSlug } from "@/lib/slug";
import { requireApiUser } from "@/lib/user";
import { isOverlayStyle, isOverlayTone } from "@/lib/overlay";
import { isPageThemeId } from "@/lib/themes";
import { cleanSocialInput } from "@/lib/social";
import { sanitizeCss, sanitizeHtml, TEMPLATE_LIMIT } from "@/lib/template";
import { clamp, isEmail, isHexColor } from "@/lib/validate";
import { NextResponse } from "next/server";

const STYLES = new Set(["minimal", "card", "banner"]);

export async function PATCH(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }

  const body = await readJson<{
    name?: string;
    email?: string;
    slug?: string;
    pageTitle?: string;
    pageBio?: string;
    pageTheme?: string;
    accentColor?: string;
    background?: string;
    showGoal?: boolean;
    goalAmount?: number;
    minAmount?: number;
    overlayDuration?: number;
    overlayTone?: string;
    overlayAccent?: string;
    alertStyle?: string;
    alertShowMessage?: boolean;
    goalStyle?: string;
    goalShowTitle?: boolean;
    recentStyle?: string;
    recentLimit?: number;
    recentTitle?: string;
    pageUseCustom?: boolean;
    pageCustomHtml?: string;
    pageCustomCss?: string;
    alertUseCustom?: boolean;
    alertCustomHtml?: string;
    alertCustomCss?: string;
    goalUseCustom?: boolean;
    goalCustomHtml?: string;
    goalCustomCss?: string;
    recentUseCustom?: boolean;
    recentCustomHtml?: string;
    recentCustomCss?: string;
    socialTwitch?: string;
    socialYoutube?: string;
    socialDiscord?: string;
    socialInstagram?: string;
    socialTiktok?: string;
    socialX?: string;
  }>(req);

  const name = body.name?.trim() ?? user.name;
  const email = body.email?.trim().toLowerCase() ?? user.email;
  const slug = body.slug?.trim().toLowerCase() ?? user.slug;
  const pageTitle = body.pageTitle?.trim() ?? user.pageTitle;
  const pageBio = body.pageBio?.trim() ?? user.pageBio;
  const pageTheme = body.pageTheme?.trim() ?? user.pageTheme;
  const accentColor = body.accentColor?.trim() ?? user.accentColor;
  const background = body.background?.trim() ?? user.background;
  const overlayTone = body.overlayTone ?? user.overlayTone;
  const overlayAccent = body.overlayAccent?.trim() ?? user.overlayAccent;
  const alertStyle = body.alertStyle ?? user.alertStyle;
  const goalStyle = body.goalStyle ?? user.goalStyle;
  const recentStyle = body.recentStyle ?? user.recentStyle;
  const recentTitle = (body.recentTitle ?? user.recentTitle).trim().slice(0, 40) || "Останні донати";

  if (name.length < 2 || name.length > 40) {
    return jsonError("Імʼя має бути від 2 до 40 символів");
  }
  if (!isEmail(email)) {
    return jsonError("Некоректний email");
  }
  if (!isValidSlug(slug)) {
    return jsonError("Slug: 3–32 символи, латиниця, цифри та дефіс");
  }
  if (pageTitle.length > 60 || pageBio.length > 240) {
    return jsonError("Заголовок або опис занадто довгі");
  }
  if (!isPageThemeId(pageTheme)) {
    return jsonError("Невідомий шаблон сторінки");
  }
  if (!isHexColor(accentColor) || !isHexColor(background) || !isHexColor(overlayAccent)) {
    return jsonError("Колір має бути у форматі #ffffff");
  }
  if (!isOverlayTone(overlayTone)) {
    return jsonError("Невідома тема віджетів");
  }
  if (!STYLES.has(alertStyle) || !isOverlayStyle(goalStyle) || !isOverlayStyle(recentStyle)) {
    return jsonError("Невідомий стиль віджета");
  }

  if (slug !== user.slug) {
    const taken = await prisma.user.findUnique({ where: { slug } });
    if (taken) {
      return jsonError("Цей slug уже зайнятий", 409);
    }
  }
  if (email !== user.email) {
    const takenEmail = await prisma.user.findUnique({ where: { email } });
    if (takenEmail) {
      return jsonError("Цей email уже зайнятий", 409);
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      slug,
      pageTitle,
      pageBio,
      pageTheme,
      accentColor,
      background,
      showGoal: body.showGoal ?? user.showGoal,
      goalAmount: clamp(Math.round(body.goalAmount ?? user.goalAmount), 0, 100_000_000),
      minAmount: clamp(Math.round(body.minAmount ?? user.minAmount), 100, 1_000_000),
      overlayTone,
      overlayAccent,
      overlayDuration: clamp(Math.round(body.overlayDuration ?? user.overlayDuration), 3, 40),
      alertStyle,
      alertShowMessage: body.alertShowMessage ?? user.alertShowMessage,
      goalStyle,
      goalShowTitle: body.goalShowTitle ?? user.goalShowTitle,
      recentStyle,
      recentLimit: clamp(Math.round(body.recentLimit ?? user.recentLimit), 1, 12),
      recentTitle,
      pageUseCustom: body.pageUseCustom ?? user.pageUseCustom,
      pageCustomHtml: sanitizeHtml((body.pageCustomHtml ?? user.pageCustomHtml).slice(0, TEMPLATE_LIMIT)),
      pageCustomCss: sanitizeCss((body.pageCustomCss ?? user.pageCustomCss).slice(0, TEMPLATE_LIMIT)),
      alertUseCustom: body.alertUseCustom ?? user.alertUseCustom,
      alertCustomHtml: sanitizeHtml((body.alertCustomHtml ?? user.alertCustomHtml).slice(0, TEMPLATE_LIMIT)),
      alertCustomCss: sanitizeCss((body.alertCustomCss ?? user.alertCustomCss).slice(0, TEMPLATE_LIMIT)),
      goalUseCustom: body.goalUseCustom ?? user.goalUseCustom,
      goalCustomHtml: sanitizeHtml((body.goalCustomHtml ?? user.goalCustomHtml).slice(0, TEMPLATE_LIMIT)),
      goalCustomCss: sanitizeCss((body.goalCustomCss ?? user.goalCustomCss).slice(0, TEMPLATE_LIMIT)),
      recentUseCustom: body.recentUseCustom ?? user.recentUseCustom,
      recentCustomHtml: sanitizeHtml((body.recentCustomHtml ?? user.recentCustomHtml).slice(0, TEMPLATE_LIMIT)),
      recentCustomCss: sanitizeCss((body.recentCustomCss ?? user.recentCustomCss).slice(0, TEMPLATE_LIMIT)),
      socialTwitch: cleanSocialInput(body.socialTwitch ?? user.socialTwitch),
      socialYoutube: cleanSocialInput(body.socialYoutube ?? user.socialYoutube),
      socialDiscord: cleanSocialInput(body.socialDiscord ?? user.socialDiscord),
      socialInstagram: cleanSocialInput(body.socialInstagram ?? user.socialInstagram),
      socialTiktok: cleanSocialInput(body.socialTiktok ?? user.socialTiktok),
      socialX: cleanSocialInput(body.socialX ?? user.socialX),
    },
  });

  return NextResponse.json({ slug: updated.slug });
}

export async function POST() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const overlayToken = `${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  await prisma.user.update({
    where: { id: user.id },
    data: { overlayToken },
  });
  return NextResponse.json({ overlayToken });
}
