# DawaScan --- Implementation Plan

**Project Base:** bis-hackathon Boilerplate\
**Stack:** Next.js + TypeScript + BetterAuth + Prisma + TRPC + React
Query + Tailwind + Upstash Redis\
**AI:** Vercel AI SDK + OpenAI Vision

------------------------------------------------------------------------

## 1. Project Architecture

### Core Stack

-   Frontend: Next.js App Router
-   API: TRPC
-   Database: PostgreSQL via Prisma
-   Auth: BetterAuth
-   AI: Vercel AI SDK + OpenAI Vision
-   Rate limiting: Upstash Redis
-   State Management: TanStack Query
-   Styling: Tailwind + shadcn/ui

------------------------------------------------------------------------

## 2. Feature-based Architecture

All new features live in:

src/features

Structure:

src/features ├ medicine │ ├ services │ │ └ cdsco.service.ts │ ├ routers
│ │ └ medicine.router.ts │ ├ hooks │ │ └ use-verify-batch.ts │ └ ui │ └
batch-scan-form.tsx │ ├ scan │ ├ services │ │ └ vision.service.ts │ ├
routers │ │ └ scan.router.ts │ ├ hooks │ │ └ use-analyze-package.ts │ └
ui │ └ image-upload.tsx │ └ reports ├ services │ └ report.service.ts ├
routers │ └ report.router.ts ├ hooks │ └ use-reports.ts └ ui └
report-form.tsx

------------------------------------------------------------------------

## 3. Database Schema

Modify:

prisma/schema.prisma

Add models:

``` prisma
model MedicineBatch {
  id           String   @id @default(cuid())
  batchNumber  String   @unique
  medicineName String?
  manufacturer String?
  expiry       DateTime?
  approved     Boolean  @default(false)
  recallStatus Boolean  @default(false)

  scans        Scan[]
  createdAt    DateTime @default(now())
}

model Scan {
  id          String   @id @default(cuid())

  batchId     String?
  imageUrl    String?

  hologram          Boolean?
  spellingErrors    Json?
  suspicious        Boolean?
  confidenceScore   Float?

  latitude   Float?
  longitude  Float?

  userId     String?
  createdAt  DateTime @default(now())

  batch      MedicineBatch? @relation(fields: [batchId], references: [id])
  user       User?          @relation(fields: [userId], references: [id])
}
```

Run migration:

npx prisma migrate dev --name medicine-schema

------------------------------------------------------------------------

## 4. Medicine Verification Feature

Service file:

src/features/medicine/services/cdsco.service.ts

Responsibilities:

1.  Check Prisma database for batch
2.  If exists → return cached result
3.  If not → scrape CDSCO
4.  Extract manufacturer, expiry, approval status
5.  Save to database
6.  Return verification result

------------------------------------------------------------------------

## 5. TRPC Router

Create:

src/features/medicine/routers/medicine.router.ts

Procedure:

verifyBatch

Input schema:

``` ts
z.object({
  batchNumber: z.string(),
  medicineName: z.string().optional()
})
```

Return:

-   isValid
-   manufacturer
-   expiry
-   recallStatus
-   confidence

Register router in:

src/dal/routers/\_app.ts

------------------------------------------------------------------------

## 6. AI Packaging Scan

File:

src/features/scan/services/vision.service.ts

Install dependencies:

npm install ai @ai-sdk/openai

Prompt:

You are a pharmaceutical packaging expert.

Analyze the medicine packaging and detect: - hologram presence -
spelling errors - batch format validity - print quality

Return JSON:

{ hologram: boolean spellingErrors: string\[\] suspicious: boolean
confidenceScore: number }

------------------------------------------------------------------------

## 7. Scan Router

Create:

src/features/scan/routers/scan.router.ts

Procedure:

analyzeImage

Flow:

upload image → call vision service → store result → return analysis

------------------------------------------------------------------------

## 8. Image Upload

Use Vercel Blob.

Install:

npm install @vercel/blob

Component:

src/features/scan/ui/image-upload.tsx

Responsibilities:

-   upload image
-   preview image
-   send image URL to API

------------------------------------------------------------------------

## 9. Reports Feature

Service:

src/features/reports/services/report.service.ts

Router:

src/features/reports/routers/report.router.ts

Procedure:

reportFakeMedicine

Input:

-   batchNumber
-   latitude
-   longitude
-   image

Store in Scan table.

------------------------------------------------------------------------

## 10. Heatmap

Page:

src/app/map/page.tsx

Install:

npm install leaflet react-leaflet

Features:

-   show suspicious medicine reports
-   cluster nearby locations
-   fraud heatmap

------------------------------------------------------------------------

## 11. Rate Limiting

Protect endpoints:

-   medicine.verifyBatch
-   scan.analyzeImage
-   reports.reportFakeMedicine

Configured in:

src/utils/config/rate-limit.ts

------------------------------------------------------------------------

## 12. Development Workflow (Cursor / Antigravity)

1.  Create feature file
2.  Ask AI to implement service
3.  Generate TRPC router
4.  Generate React hook
5.  Generate UI component

Example prompt:

Implement a TypeScript service that analyzes medicine packaging using
GPT-4o Vision with the Vercel AI SDK and returns structured JSON.

------------------------------------------------------------------------

## 13. Build Order

1. Prisma schema - Batch verification - TRPC router - Batch scan
UI

2. AI packaging analysis - Image upload

3. Reports system - Map heatmap

4. UI polish - Demo preparation

------------------------------------------------------------------------

## 14. Demo Flow

User opens app → enters batch number → system verifies medicine →
uploads packaging image → AI detects suspicious packaging → map displays
fraud hotspot.

------------------------------------------------------------------------

End of document.
