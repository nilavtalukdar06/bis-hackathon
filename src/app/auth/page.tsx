import { auth } from "@/features/auth/services/auth";
import { LoginButton } from "@/features/auth/ui/login-button";
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
    <div className="w-full p-4 max-w-sm mx-auto min-h-screen flex justify-center items-center">
      <LoginButton />
    </div>
  );
}
