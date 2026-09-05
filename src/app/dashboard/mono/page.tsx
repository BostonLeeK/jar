import { MonoPanel } from "@/components/mono-panel";
import { decrypt } from "@/lib/crypto";
import { fetchClientInfo, type MonoJar } from "@/lib/mono";
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monobank</h1>
        <p className="mt-1 text-sm text-zinc-500">Токен, банка і webhook для алертів.</p>
      </div>
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
