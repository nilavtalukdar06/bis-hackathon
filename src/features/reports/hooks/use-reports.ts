"use client";

import { useTRPC } from "@/dal/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useReports() {
  const trpc = useTRPC();
  return useQuery(trpc.reports.getReports.queryOptions());
}

export function useReportLocations() {
  const trpc = useTRPC();
  return useQuery(trpc.reports.getLocations.queryOptions());
}

export function useSubmitReport() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.reports.reportFakeMedicine.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["reports"] });
      },
    })
  );
}
