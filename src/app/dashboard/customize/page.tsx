import { PageEditor } from "@/components/page-editor";
import { requireUser, toSafeUser } from "@/lib/user";

export default async function CustomizePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Сторінка</h1>
        <p className="mt-1 text-sm text-zinc-500">Кольори, текст, ціль і стиль алертів.</p>
      </div>
      <PageEditor user={toSafeUser(user)} />
    </div>
  );
}
