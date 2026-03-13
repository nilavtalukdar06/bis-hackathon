import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/dal/init";
import {
  submitReport,
  getReports,
  getReportLocations,
} from "@/features/reports/services/report.service";

export const reportRouter = createTRPCRouter({
  reportFakeMedicine: baseProcedure
    .input(
      z.object({
        batchNumber: z.string().min(1, "Batch number is required"),
        latitude: z.number(),
        longitude: z.number(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await submitReport(input);
      return {
        success: true,
        scanId: result.scan.id,
        batchId: result.batch.id,
      };
    }),

  getReports: baseProcedure.query(async () => {
    return await getReports();
  }),

  getLocations: baseProcedure.query(async () => {
    return await getReportLocations();
  }),
});

export type ReportRouter = typeof reportRouter;
