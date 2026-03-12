import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireUser } from "@/lib/auth";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return <DashboardLayout email={user.email || ""}>{children}</DashboardLayout>;
}
