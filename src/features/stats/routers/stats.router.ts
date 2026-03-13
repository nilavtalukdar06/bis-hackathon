import { baseProcedure, createTRPCRouter } from "@/dal/init";
import { getDashboardStats } from "@/features/stats/services/stats.service";

export const statsRouter = createTRPCRouter({
  getDashboardStats: baseProcedure.query(async () => {
    const data = await getDashboardStats();
    return data;
  }),
});

export type StatsRouter = typeof statsRouter;
