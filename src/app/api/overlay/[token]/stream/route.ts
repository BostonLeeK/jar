import { onDonation } from "@/lib/events";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const user = await prisma.user.findUnique({ where: { overlayToken: token } });
  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let cleanup: () => void = () => undefined;
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let off: () => void = () => undefined;
      let ping: ReturnType<typeof setInterval> | undefined;
      const send = (payload: unknown) => {
        if (closed) {
          return;
        }
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          cleanup();
        }
      };
      cleanup = () => {
        if (closed) {
          return;
        }
        closed = true;
        off();
        if (ping) {
          clearInterval(ping);
        }
        try {
          controller.close();
        } catch {
          return;
        }
      };
      off = onDonation(user.id, (donation) => {
        send({ type: "donation", ...donation });
      });
      ping = setInterval(() => {
        send({ type: "ping" });
      }, 10000);
      send({ type: "ready" });
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
