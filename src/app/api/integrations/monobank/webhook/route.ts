import { handleMonobankWebhook } from "@/lib/monobank/service";
import type { MonoWebhookPayload } from "@/lib/monobank/types";
import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json().catch(() => null)) as MonoWebhookPayload | null;
    if (payload && typeof payload === "object") {
      await handleMonobankWebhook(payload, req.headers.get("x-request-id"));
    }
  } catch {
    return new NextResponse("ok", { status: 200 });
  }
  return new NextResponse("ok", { status: 200 });
}
