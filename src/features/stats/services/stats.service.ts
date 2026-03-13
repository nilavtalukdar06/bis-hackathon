import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const [batchesVerified, fakesDetected, aiScans, reportsFiled] = await Promise.all([
    prisma.medicineBatch.count(),
    prisma.scan.count({ where: { suspicious: true } }),
    // AI Scans implies an imageUrl was used
    prisma.scan.count({ where: { imageUrl: { not: null } } }),
    // Reports filed implies a user reported it
    prisma.scan.count({ where: { reportedById: { not: null } } }),
  ]);

  return {
    batchesVerified,
    fakesDetected,
    aiScans,
    reportsFiled,
  };
}
