import prisma from "@/lib/prisma";

export async function submitReport(data: {
  batchNumber: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  reportedById?: string;
}) {
  // Find or create the batch
  let batch = await prisma.medicineBatch.findUnique({
    where: { batchNumber: data.batchNumber },
  });

  if (!batch) {
    batch = await prisma.medicineBatch.create({
      data: {
        batchNumber: data.batchNumber,
        approved: false,
        recallStatus: true,
      },
    });
  }

  // Create a scan record marked as suspicious
  const scan = await prisma.scan.create({
    data: {
      medicineBatchId: batch.id,
      imageUrl: data.imageUrl,
      suspicious: true,
      latitude: data.latitude,
      longitude: data.longitude,
      reportedById: data.reportedById,
    },
  });

  return { scan, batch };
}

export async function getReports() {
  return await prisma.scan.findMany({
    where: {
      OR: [{ suspicious: true }, { confidenceScore: { lt: 0.5 } }],
    },
    include: {
      medicineBatch: true,
      reportedBy: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReportLocations() {
  return await prisma.scan.findMany({
    where: {
      suspicious: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      medicineBatch: {
        select: {
          batchNumber: true,
          medicineName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
