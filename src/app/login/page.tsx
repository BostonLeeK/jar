import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { googleConfigured } from "@/lib/google";
import { getCurrentUser } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <style>{`html,body{background:#fff!important;min-height:100dvh;}`}</style>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Увійти</h1>
        <AuthForm mode="login" googleEnabled={googleConfigured()} error={error} />
      </main>
    </div>
  );
}
