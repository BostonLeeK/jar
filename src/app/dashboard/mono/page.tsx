import { MonoPanel } from "@/components/mono-panel";
import { MonobankProviderPanel } from "@/components/monobank-provider-panel";
import { decrypt } from "@/lib/crypto";
import { fetchClientInfo, type MonoJar } from "@/lib/mono";
import { monobankConfigured } from "@/lib/monobank/config";
import { catchUpStatement, getClientInfo, getConnectionByUserId, verifyAuthorization } from "@/lib/monobank/service";
import type { MonoAccount } from "@/lib/monobank/types";
import { getAppUrl } from "@/lib/urls";
import { requireUser } from "@/lib/user";

export default async function MonoPage() {
  const user = await requireUser();
  let jars: MonoJar[] = [];
  if (user.monoTokenEnc) {
    try {
      const info = await fetchClientInfo(decrypt(user.monoTokenEnc));
      jars = info.jars ?? [];
    } catch {
      jars = [];
    }
  }

  let connection = await getConnectionByUserId(user.id);
  if (connection?.status === "pending" && monobankConfigured()) {
    try {
      await verifyAuthorization(connection.requestId);
      connection = await getConnectionByUserId(user.id);
    } catch {
      connection = await getConnectionByUserId(user.id);
    }
  }

  if (connection?.status === "connected" && connection.selectedAccountId && monobankConfigured()) {
    try {
      await catchUpStatement(user.id);
    } catch {}
  }

  let accounts: MonoAccount[] = [];
  if (connection?.status === "connected" && monobankConfigured()) {
    try {
      const info = await getClientInfo(connection.requestId);
      accounts = info.accounts ?? [];
    } catch {
      accounts = [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monobank</h1>
        <p className="mt-1 text-sm text-zinc-500">Provider API, токен, банка і webhook для алертів.</p>
      </div>
      <MonobankProviderPanel
        key={`${connection?.id ?? "none"}:${connection?.status ?? "disconnected"}`}
        configured={monobankConfigured()}
        status={connection?.status ?? "disconnected"}
        clientName={connection?.clientName ?? null}
        selectedAccountId={connection?.selectedAccountId ?? null}
        initialAccounts={accounts}
        appUrl={getAppUrl()}
      />
      <MonoPanel
        hasToken={Boolean(user.monoTokenEnc)}
        selectedJarId={user.monoJarId}
        webhookSet={user.monoWebhookSet}
        initialJars={jars}
        appUrl={getAppUrl()}
      />
    </div>
  );
}
