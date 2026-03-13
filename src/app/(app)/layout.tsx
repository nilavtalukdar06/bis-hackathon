import { auth } from "@/features/auth/services/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShellWrapper } from "@/components/layout/app-shell-wrapper";

export default async function AppLayout({ children }: child) {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session) {
    redirect("/auth");
  }

  return <AppShellWrapper>{children}</AppShellWrapper>;
}
