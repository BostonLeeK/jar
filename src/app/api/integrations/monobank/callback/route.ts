import { MonobankApiError } from "@/lib/monobank/errors";
import { verifyAuthorization } from "@/lib/monobank/service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id");
  if (!requestId) {
    return new NextResponse("ok", { status: 200 });
  }

  try {
    await verifyAuthorization(requestId);
    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    if (error instanceof MonobankApiError && (error.status === 401 || error.status === 404)) {
      return new NextResponse("ok", { status: 200 });
    }
    return new NextResponse("error", { status: 502 });
  }
}
