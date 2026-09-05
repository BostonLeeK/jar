import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { googleConfigured } from "@/lib/google";
import { getCurrentUser } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <style>{`html,body{background:#fff!important;min-height:100dvh;}`}</style>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Реєстрація</h1>
        <AuthForm mode="register" googleEnabled={googleConfigured()} />
      </main>
    </div>
  );
}
