import { createTestDonation } from "@/lib/donations";
import { jsonError, readJson } from "@/lib/http";
import { uahToKopiyky } from "@/lib/money";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const body = await readJson<{ amount?: number; nickname?: string; message?: string }>(req);
  const donation = await createTestDonation(user.id, {
    amount: uahToKopiyky(Number(body.amount) || 200),
    nickname: body.nickname?.trim() || "boston_fan",
    message: body.message?.trim() || "запускай Condemned",
  });
  return NextResponse.json({ id: donation.id });
}
