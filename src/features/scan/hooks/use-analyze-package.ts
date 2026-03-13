"use client";

import { useTRPC } from "@/dal/client";
import { useMutation } from "@tanstack/react-query";

export function useAnalyzePackage() {
  const trpc = useTRPC();

  return useMutation(trpc.scan.analyzeImage.mutationOptions());
}
