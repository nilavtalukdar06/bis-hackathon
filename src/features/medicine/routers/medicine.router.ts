import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/dal/init";
import { verifyBatchNumber } from "@/features/medicine/services/cdsco.service";
import { getRecentScans } from "@/features/medicine/services/medicine.service";

export const medicineRouter = createTRPCRouter({
  verifyBatch: baseProcedure
    .input(
      z.object({
        batchNumber: z.string().min(1, "Batch number is required"),
        medicineName: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const result = await verifyBatchNumber(
        input.batchNumber,
        input.medicineName
      );
      return result;
    }),

  recentScans: baseProcedure.query(async () => {
    const scans = await getRecentScans(20);
    return scans;
  }),
});

export type MedicineRouter = typeof medicineRouter;
