import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/dal/init";
import { analyzePackagingImage } from "@/features/scan/services/vision.service";
import { createScan } from "@/features/medicine/services/medicine.service";

export const scanRouter = createTRPCRouter({
  analyzeImage: baseProcedure
    .input(
      z.object({
        imageUrl: z.string().url("Valid image URL required"),
        medicineBatchId: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Call AI vision service
      const analysis = await analyzePackagingImage(input.imageUrl);

      // Store result in database
      const scan = await createScan({
        imageUrl: input.imageUrl,
        medicineBatchId: input.medicineBatchId,
        hologram: analysis.hologram,
        spellingErrors: analysis.spellingErrors,
        suspicious: analysis.suspicious,
        confidenceScore: analysis.confidenceScore,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      return {
        scanId: scan.id,
        ...analysis,
      };
    }),
});

export type ScanRouter = typeof scanRouter;
