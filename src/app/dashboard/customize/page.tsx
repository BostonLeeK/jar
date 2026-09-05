import { PageEditor } from "@/components/page-editor";
import { requireUser, toSafeUser } from "@/lib/user";

export default async function CustomizePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Сторінка донатів</h1>
        <p className="mt-1 text-sm text-zinc-500">Шаблон, текст і ціль збору.</p>
      </div>
      <PageEditor user={toSafeUser(user)} />
    </div>
  );
}
