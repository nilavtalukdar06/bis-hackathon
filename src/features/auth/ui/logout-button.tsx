"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/use-auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout, isLoggingOut } = useAuth();
  return (
    <Button
      disabled={isLoggingOut}
      onClick={logout}
      variant="destructive"
      className="font-normal"
    >
      Logout
      <LogOut />
    </Button>
  );
}
