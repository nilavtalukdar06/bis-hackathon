"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "../hooks/use-auth";

export function LoginButton() {
  const { login, isLoggingIn } = useAuth();
  return (
    <Button variant="outline" size="lg" disabled={isLoggingIn} onClick={login}>
      <Image src="/google.svg" height={16} width={16} alt="google-image" />
      <span className="font-light">Login With Google</span>
    </Button>
  );
}
