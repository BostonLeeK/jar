import { googleAuthorizeUrl, googleConfigured } from "@/lib/google";
import { jsonError } from "@/lib/http";
import { signState } from "@/lib/session";
import { getPublicOrigin } from "@/lib/urls";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!googleConfigured()) {
    return jsonError("Google авторизація не налаштована");
  }
  const state = await signState("google");
  return NextResponse.redirect(googleAuthorizeUrl(state, getPublicOrigin(req)));
}
