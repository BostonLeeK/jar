import { WidgetsPanel } from "@/components/widgets-panel";
import { getAppUrl } from "@/lib/urls";
import { requireUser } from "@/lib/user";

export default async function WidgetsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">OBS</h1>
        <p className="mt-1 text-sm text-zinc-500">Три Browser Source віджети з прозорим фоном.</p>
      </div>
      <WidgetsPanel token={user.overlayToken} appUrl={getAppUrl()} />
    </div>
  );
}
