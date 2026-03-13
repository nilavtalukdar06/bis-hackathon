import { auth } from "@/features/auth/services/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (result?.session) {
    redirect("/");
  }
  return (
    <div className="w-full p-4">
      <p className="text-muted-foreground font-light">Auth Screen</p>
    </div>
  );
}
