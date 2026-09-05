import { SettingsPanel } from "@/components/settings-panel";
import { getAppUrl } from "@/lib/urls";
import { requireUser, toSafeUser } from "@/lib/user";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Налаштування</h1>
        <p className="mt-1 text-sm text-zinc-500">Акаунт, пароль і секрет віджетів.</p>
      </div>
      <SettingsPanel user={toSafeUser(user)} appUrl={getAppUrl()} />
    </div>
  );
}
