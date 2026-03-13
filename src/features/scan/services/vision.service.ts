import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const analysisSchema = z.object({
  hologram: z
    .boolean()
    .describe("Whether a hologram is visible on the packaging"),
  spellingErrors: z
    .array(z.string())
    .describe("List of spelling errors found on the packaging"),
  suspicious: z
    .boolean()
    .describe("Whether the packaging appears suspicious or counterfeit"),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Confidence score from 0 to 1 where 1 is most confident it is genuine",
    ),
  batchFormatValid: z
    .boolean()
    .describe("Whether the batch number format appears valid"),
  printQuality: z
    .enum(["high", "medium", "low"])
    .describe("Overall print quality of the packaging"),
  analysis: z.string().describe("Brief summary of the analysis findings"),
});

export type PackagingAnalysis = z.infer<typeof analysisSchema>;

export async function analyzePackagingImage(
  imageUrl: string,
): Promise<PackagingAnalysis> {
  const isDataUrl = imageUrl.startsWith("data:");
  const imageData = isDataUrl ? imageUrl.split(",")[1] : new URL(imageUrl);
  const mimeType = isDataUrl
    ? (imageUrl.split(";")[0].split(":")[1] as
        | "image/jpeg"
        | "image/png"
        | "image/webp"
        | "image/gif")
    : undefined;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: analysisSchema,
    messages: [
      {
        role: "system",
        content: `You are a pharmaceutical packaging expert specializing in detecting counterfeit medicines.
Analyze the medicine packaging image and detect:
- Hologram presence (genuine medicines typically have holograms)
- Spelling errors on the packaging (common in counterfeits)
- Batch format validity
- Print quality (counterfeits often have low print quality)
 
Be thorough but fair in your analysis. If the image is not a medicine package, mark it as suspicious with low confidence.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this medicine packaging image for authenticity indicators.",
          },
          {
            type: "image",
            image: imageData,
            mimeType,
          },
        ],
      },
    ],
  });

  return object;
}
