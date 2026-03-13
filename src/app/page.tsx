import { auth } from "@/features/auth/services/auth";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (!result?.session) {
    redirect("/auth");
  }
  return (
    <div className="p-4 w-full">
      <LogoutButton />
    </div>
  );
}
