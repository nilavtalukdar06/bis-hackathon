import prisma from "@/lib/prisma";

/**
 * CDSCO (Central Drugs Standard Control Organization) verification service.
 *
 * Flow:
 *   1. Check Prisma DB cache for batch
 *   2. If exists → return cached result
 *   3. If not → simulate CDSCO lookup (mock for hackathon demo)
 *   4. Save to database
 *   5. Return verification result
 */

interface CdscoVerificationResult {
  isValid: boolean;
  batchNumber: string;
  medicineName: string | null;
  manufacturer: string | null;
  expiry: Date | null;
  approved: boolean;
  recallStatus: boolean;
  confidence: number;
  source: "cache" | "cdsco";
}

export async function verifyBatchNumber(
  batchNumber: string,
  medicineName?: string
): Promise<CdscoVerificationResult> {
  // 1. Check database cache first
  const cached = await prisma.medicineBatch.findUnique({
    where: { batchNumber },
  });

  if (cached) {
    return {
      isValid: cached.approved,
      batchNumber: cached.batchNumber,
      medicineName: cached.medicineName,
      manufacturer: cached.manufacturer,
      expiry: cached.expiry,
      approved: cached.approved,
      recallStatus: cached.recallStatus,
      confidence: 0.95,
      source: "cache",
    };
  }

  // 2. Simulate CDSCO lookup
  const cdscoResult = await lookupCdsco(batchNumber, medicineName);

  // 3. Save to database for future cache hits
  await prisma.medicineBatch.create({
    data: {
      batchNumber,
      medicineName: cdscoResult.medicineName,
      manufacturer: cdscoResult.manufacturer,
      expiry: cdscoResult.expiry,
      approved: cdscoResult.approved,
      recallStatus: cdscoResult.recallStatus,
    },
  });

  return cdscoResult;
}

/**
 * Mock CDSCO lookup for hackathon demonstration.
 *
 * In production, this would scrape/query the CDSCO database at
 * https://cdscoonline.gov.in/ or use their API if available.
 */
async function lookupCdsco(
  batchNumber: string,
  medicineName?: string
): Promise<CdscoVerificationResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Known demo batches for testing
  const knownBatches: Record<
    string,
    Partial<CdscoVerificationResult>
  > = {
    "BATCH-2024-001": {
      isValid: true,
      medicineName: "Paracetamol 500mg",
      manufacturer: "Cipla Ltd.",
      expiry: new Date("2026-12-31"),
      approved: true,
      recallStatus: false,
      confidence: 0.98,
    },
    "BATCH-2024-002": {
      isValid: true,
      medicineName: "Amoxicillin 250mg",
      manufacturer: "Sun Pharma",
      expiry: new Date("2025-06-30"),
      approved: true,
      recallStatus: false,
      confidence: 0.97,
    },
    "BATCH-FAKE-001": {
      isValid: false,
      medicineName: "Counterfeit Drug",
      manufacturer: "Unknown",
      expiry: null,
      approved: false,
      recallStatus: true,
      confidence: 0.15,
    },
    "RECALL-2024-001": {
      isValid: false,
      medicineName: "Recalled Cough Syrup",
      manufacturer: "Maiden Pharmaceuticals",
      expiry: new Date("2025-03-15"),
      approved: false,
      recallStatus: true,
      confidence: 0.92,
    },
  };

  const upper = batchNumber.toUpperCase();
  if (knownBatches[upper]) {
    return {
      batchNumber,
      source: "cdsco",
      isValid: false,
      medicineName: null,
      manufacturer: null,
      expiry: null,
      approved: false,
      recallStatus: false,
      confidence: 0,
      ...knownBatches[upper],
    };
  }

  // Unknown batch — flag as unverified
  return {
    isValid: false,
    batchNumber,
    medicineName: medicineName || null,
    manufacturer: null,
    expiry: null,
    approved: false,
    recallStatus: false,
    confidence: 0.3,
    source: "cdsco",
  };
}
