import { removeAlertFile } from "@/lib/alert-media";
import { jsonError, readJson } from "@/lib/http";
import { isTtsLang } from "@/lib/tts";
import { clamp } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const count = await prisma.alertTier.count({ where: { userId: user.id } });
  if (count >= 12) {
    return jsonError("Можна додати щонайбільше 12 рівнів");
  }
  const last = await prisma.alertTier.findFirst({
    where: { userId: user.id },
    orderBy: { minAmount: "desc" },
  });
  const minAmount = last ? last.minAmount + 10000 : user.minAmount;
  const tier = await prisma.alertTier.create({
    data: { userId: user.id, minAmount },
  });
  return NextResponse.json(tier);
}

export async function PATCH(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const body = await readJson<{
    alertTts?: boolean;
    ttsLang?: string;
    tiers?: Array<{ id: string; minAmount?: number; tts?: boolean }>;
  }>(req);

  if (typeof body.alertTts === "boolean" || (body.ttsLang && isTtsLang(body.ttsLang))) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(typeof body.alertTts === "boolean" ? { alertTts: body.alertTts } : {}),
        ...(body.ttsLang && isTtsLang(body.ttsLang) ? { ttsLang: body.ttsLang } : {}),
      },
    });
  }

  if (body.tiers) {
    await Promise.all(
      body.tiers.map((tier) =>
        prisma.alertTier.updateMany({
          where: { id: tier.id, userId: user.id },
          data: {
            ...(typeof tier.minAmount === "number"
              ? { minAmount: clamp(Math.round(tier.minAmount), 100, 100_000_000) }
              : {}),
            ...(typeof tier.tts === "boolean" ? { tts: tier.tts } : {}),
          },
        }),
      ),
    );
  }

  const tiers = await prisma.alertTier.findMany({
    where: { userId: user.id },
    orderBy: { minAmount: "asc" },
  });
  return NextResponse.json({ alertTts: body.alertTts ?? user.alertTts, tiers });
}

export async function DELETE(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return jsonError("Немає id");
  }
  const tier = await prisma.alertTier.findFirst({ where: { id, userId: user.id } });
  if (!tier) {
    return jsonError("Рівень не знайдено", 404);
  }
  await removeAlertFile(user.id, id);
  await prisma.alertTier.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
