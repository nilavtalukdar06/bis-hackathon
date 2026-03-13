"use client";

import { useTRPC } from "@/dal/client";
import { useQuery } from "@tanstack/react-query";

export function useVerifyBatch(batchNumber: string, medicineName?: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.medicine.verifyBatch.queryOptions(
      { batchNumber, medicineName },
      { enabled: batchNumber.length > 0 }
    )
  );
}
