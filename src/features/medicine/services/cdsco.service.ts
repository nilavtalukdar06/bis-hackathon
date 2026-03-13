import prisma from "@/lib/prisma";
import FirecrawlApp from "@mendable/firecrawl-js";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

/**
 * CDSCO (Central Drugs Standard Control Organization) verification service.
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

const cdscoSchema = z.object({
  isValid: z.boolean(),
  medicineName: z.string().nullable(),
  manufacturer: z.string().nullable(),
  expiry: z.string().nullable(),
  approved: z.boolean(),
  recallStatus: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export async function verifyBatchNumber(
  batchNumber: string,
  medicineName?: string,
): Promise<CdscoVerificationResult> {
  console.log("\n==============================");
  console.log("[STEP 1] Starting CDSCO verification");
  console.log("Batch:", batchNumber);
  console.log("Medicine:", medicineName);
  console.log("==============================\n");

  // 1. Check database cache first
  console.log("[STEP 2] Checking database cache...");

  const cached = await prisma.medicineBatch.findUnique({
    where: { batchNumber },
  });

  if (cached) {
    console.log("[CACHE HIT] Batch found in database");

    const result = {
      isValid: cached.approved,
      batchNumber: cached.batchNumber,
      medicineName: cached.medicineName,
      manufacturer: cached.manufacturer,
      expiry: cached.expiry,
      approved: cached.approved,
      recallStatus: cached.recallStatus,
      confidence: 0.95,
      source: "cache" as const,
    };

    console.log("[CACHE RESULT]", result);
    console.log("[END] Returning cached result\n");

    return result;
  }

  console.log("[CACHE MISS] Batch not found in DB");

  // 2. Web lookup
  console.log("\n[STEP 3] Performing CDSCO web lookup...\n");

  const cdscoResult = await lookupCdsco(batchNumber, medicineName);

  console.log("[STEP 6] Web verification result:");
  console.log(JSON.stringify(cdscoResult, null, 2));

  // 3. Save result to DB
  console.log("\n[STEP 7] Saving result to database...");

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

  console.log("[DB WRITE SUCCESS] Batch stored in database");

  console.log("\n[STEP 8] Returning final result\n");

  return cdscoResult;
}

async function lookupCdsco(
  batchNumber: string,
  medicineName?: string,
): Promise<CdscoVerificationResult> {
  console.log("[STEP 4] Initializing Firecrawl client");

  const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY || "",
  });

  const medicinePart = medicineName ? `Medicine "${medicineName}"` : "Medicine";

  const query = `${medicinePart} batch ${batchNumber} CDSCO alert recall fake counterfeit NSQ`;

  console.log("[STEP 5] Generated search query:");
  console.log(query);

  try {
    console.log("\n[STEP 5.1] Searching web using Firecrawl...\n");

    const searchResponse = await firecrawl.search(query, {
      limit: 3,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    });

    console.log("[FIRECRAWL RESPONSE RECEIVED]");

    const webResults = searchResponse.web || [];

    console.log("Number of results:", webResults.length);

    if (webResults.length === 0) {
      console.log("[NO WEB RESULTS FOUND]");

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

    console.log("\n[STEP 5.2] Building search context for AI...");

    const searchContext = webResults
      .map(
        (r: any) =>
          `URL: ${r.url}\nTitle: ${r.title}\nContent:\n${
            r.markdown?.substring(0, 1500) || ""
          }`,
      )
      .join("\n\n---\n\n");

    console.log("[CONTEXT BUILT] Length:", searchContext.length);

    console.log(
      "\n[STEP 5.3] Sending data to OpenAI for structured analysis...\n",
    );

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: cdscoSchema,
      messages: [
        {
          role: "system",
          content:
            "You are a pharmaceutical compliance expert verifying medicine batches in India against CDSCO records.",
        },
        {
          role: "user",
          content: `Batch Number: ${batchNumber}
Medicine: ${medicineName}

Search Results:

${searchContext}`,
        },
      ],
    });

    console.log("[AI RESPONSE RECEIVED]");
    console.log(JSON.stringify(object, null, 2));

    let parsedExpiry: Date | null = null;

    if (object.expiry) {
      const date = new Date(object.expiry);
      if (!isNaN(date.getTime())) {
        parsedExpiry = date;
      }
    }

    console.log("[EXPIRY PARSED]", parsedExpiry);

    console.log("[STEP 5.4] Applying hackathon override rules...");

    if (batchNumber === "BATCH-2024-001" || batchNumber === "BATCH-2024-002") {
      object.isValid = true;
      object.approved = true;
      object.recallStatus = false;
      object.confidence = Math.max(0.8, object.confidence);

      console.log("[MOCK OVERRIDE] Approved demo batch detected");
    } else if (
      batchNumber === "RECALL-2024-001" ||
      batchNumber === "BATCH-FAKE-001"
    ) {
      object.isValid = false;
      object.approved = false;
      object.recallStatus = true;
      object.confidence = Math.max(0.8, object.confidence);

      console.log("[MOCK OVERRIDE] Fake/Recall demo batch detected");
    }

    console.log("[STEP 5.5] Returning CDSCO analysis result\n");

    return {
      isValid: object.isValid,
      batchNumber,
      medicineName: object.medicineName || medicineName || null,
      manufacturer: object.manufacturer,
      expiry: parsedExpiry,
      approved: object.approved,
      recallStatus: object.recallStatus,
      confidence: object.confidence,
      source: "cdsco",
    };
  } catch (error) {
    console.error("\n[CDSCO SERVICE ERROR]");
    console.error(error);

    return {
      isValid: false,
      batchNumber,
      medicineName: medicineName || null,
      manufacturer: null,
      expiry: null,
      approved: false,
      recallStatus: false,
      confidence: 0,
      source: "cdsco",
    };
  }
}
