import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { medicineRouter } from "@/features/medicine/routers/medicine.router";
import { scanRouter } from "@/features/scan/routers/scan.router";
import { reportRouter } from "@/features/reports/routers/report.router";

export const appRouter = createTRPCRouter({
  health: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        message: opts.input.text,
      };
    }),
  medicine: medicineRouter,
  scan: scanRouter,
  reports: reportRouter,
});

export type AppRouter = typeof appRouter;
