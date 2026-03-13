import { auth } from "@/features/auth/services/auth";
import { LoginButton } from "@/features/auth/ui/login-button";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";

export default async function AuthPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (result?.session) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-950 via-gray-950 to-gray-900">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo & Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/30">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              DawaScan
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              AI-Powered Medicine Verification Platform
            </p>
          </div>

          {/* Features List */}
          <div className="mb-8 space-y-3">
            {[
              "Verify medicine batch numbers instantly",
              "AI-powered packaging fraud detection",
              "Report counterfeit medicines with geolocation",
              "View fraud hotspots on the heatmap",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-sm text-gray-300">{feature}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">Sign in to continue</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Login Button */}
          <div className="flex justify-center">
            <LoginButton />
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Protecting India from counterfeit medicines
          </p>
        </div>
      </div>
    </div>
  );
}
