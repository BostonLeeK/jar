import { ingestStatement } from "@/lib/donations";
import type { MonoWebhookPayload } from "@/lib/mono";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("ok", { status: 200 });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  try {
    const user = await prisma.user.findUnique({ where: { webhookToken: token } });
    if (!user) {
      return new NextResponse("ok", { status: 200 });
    }
    const payload = (await req.json()) as MonoWebhookPayload;
    if (payload.type === "StatementItem" && payload.data?.account && payload.data.statementItem) {
      await ingestStatement(user.id, payload.data.account, payload.data.statementItem);
    }
    return new NextResponse("ok", { status: 200 });
  } catch {
    return new NextResponse("error", { status: 500 });
  }
}
