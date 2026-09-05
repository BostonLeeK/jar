import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/user";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <DashboardNav email={user.email} />
      <div className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
