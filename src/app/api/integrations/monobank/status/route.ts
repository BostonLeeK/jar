import { jsonError } from "@/lib/http";
import { getConnectionByUserId } from "@/lib/monobank/service";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }

  const connection = await getConnectionByUserId(user.id);
  if (!connection) {
    return NextResponse.json({ status: "disconnected" });
  }

  return NextResponse.json({
    status: connection.status,
    clientName: connection.clientName,
    selectedAccountId: connection.selectedAccountId,
  });
}
