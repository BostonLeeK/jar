import { googleAuthorizeUrl, googleConfigured } from "@/lib/google";
import { jsonError } from "@/lib/http";
import { signState } from "@/lib/session";
import { getPublicOrigin } from "@/lib/urls";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!googleConfigured()) {
    return jsonError("Google авторизація не налаштована");
  }
  const origin = getPublicOrigin(req);
  try {
    const state = await signState("google");
    return NextResponse.redirect(googleAuthorizeUrl(state, origin));
  } catch {
    try {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("не вдалося почати вхід через Google")}`, `${origin}/`),
      );
    } catch {
      return jsonError("не вдалося почати вхід через Google");
    }
  }
}
