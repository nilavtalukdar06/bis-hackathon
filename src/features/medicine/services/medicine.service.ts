import prisma from "@/lib/prisma";

export async function findBatchByNumber(batchNumber: string) {
  return await prisma.medicineBatch.findUnique({
    where: { batchNumber },
    include: { scans: true },
  });
}

export async function createBatch(data: {
  batchNumber: string;
  medicineName?: string;
  manufacturer?: string;
  expiry?: Date;
  approved?: boolean;
  recallStatus?: boolean;
}) {
  return await prisma.medicineBatch.create({ data });
}

export async function createScan(data: {
  medicineBatchId?: string;
  imageUrl?: string;
  hologram?: boolean;
  spellingErrors?: string[];
  suspicious?: boolean;
  confidenceScore?: number;
  latitude?: number;
  longitude?: number;
  reportedById?: string;
}) {
  return await prisma.scan.create({ data });
}

export async function getSuspiciousScans() {
  return await prisma.scan.findMany({
    where: { suspicious: true },
    include: { medicineBatch: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentScans(limit = 10) {
  return await prisma.scan.findMany({
    include: { medicineBatch: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
