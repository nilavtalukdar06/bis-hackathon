import { useState } from "react";
import { authClient } from "../services/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const login = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onRequest: () => {
          setIsLoggingIn(true);
        },
        onSuccess: () => {
          setIsLoggingIn(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsLoggingIn(false);
        },
      },
    );
  };

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setIsLoggingOut(true);
        },
        onSuccess: () => {
          setIsLoggingOut(false);
          router.replace("/auth");
        },
        onError: (ctx) => {
          setIsLoggingOut(false);
          toast.error(ctx.error.message);
        },
      },
    });
  };
  return {
    logout,
    login,
    isLoggingIn,
    isLoggingOut,
  };
};
