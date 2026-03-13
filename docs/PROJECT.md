# DawaScan — Project Documentation

> **AI-powered medicine verification platform for India.** Verify batch numbers against CDSCO, scan packaging with AI vision, report counterfeits with geolocation, and view fraud hotspots on a live map.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Database Schema (Prisma)](#database-schema-prisma)
5. [Authentication](#authentication)
6. [Data Access Layer (tRPC)](#data-access-layer-trpc)
7. [API Routes](#api-routes)
8. [Feature Modules](#feature-modules)
9. [Frontend Pages & Components](#frontend-pages--components)
10. [Utilities](#utilities)
11. [Conventions & Patterns](#conventions--patterns)
12. [How to Add a New Feature](#how-to-add-a-new-feature)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Runtime** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` | 4.x |
| **UI Components** | shadcn/ui (Radix primitives + CVA) | latest |
| **Icons** | Lucide React, Phosphor Icons | latest |
| **API Layer** | tRPC v11 (httpBatchLink) | 11.12.0 |
| **Data Fetching** | TanStack React Query | 5.90.x |
| **Serialization** | SuperJSON | 2.2.6 |
| **Database** | PostgreSQL (via Prisma ORM) | — |
| **Prisma** | Prisma Client + `@prisma/adapter-pg` | 7.5.0 |
| **Auth** | Better Auth (Google OAuth) | 1.5.5 |
| **AI / Vision** | Vercel AI SDK + OpenAI GPT-4o | 6.x / 3.x |
| **Rate Limiting** | Upstash Redis + `@upstash/ratelimit` | latest |
| **Maps** | Leaflet + React Leaflet | 1.9.4 |
| **Toasts** | Sonner | 2.x |
| **Validation** | Zod v4 | 4.3.6 |

---

## Project Structure

```
bis-hackathon/
├── prisma/
│   └── schema.prisma              # Database models
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (TRPCReactProvider, Toaster, dark mode)
│   │   ├── page.tsx                # Redirects to /auth
│   │   ├── auth/page.tsx           # Login page (Google OAuth)
│   │   ├── (app)/                  # Authenticated route group
│   │   │   ├── layout.tsx          # Checks session → redirects if unauthenticated
│   │   │   ├── dashboard/page.tsx  # Dashboard with quick actions & stats
│   │   │   ├── medicine/page.tsx   # Batch number verification form
│   │   │   ├── scan/page.tsx       # AI packaging image analysis
│   │   │   ├── reports/page.tsx    # Report fake medicine form
│   │   │   └── map/page.tsx        # Leaflet fraud heatmap
│   │   └── api/
│   │       ├── route.ts            # GET /api — health check (rate-limited)
│   │       ├── trpc/[trpc]/route.ts# tRPC HTTP handler (rate-limited)
│   │       ├── auth/[...all]/route.ts # Better Auth catch-all handler
│   │       ├── medicine/verify/route.ts # POST /api/medicine/verify (REST)
│   │       └── upload/route.ts     # POST /api/upload (file → base64 data URL)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-shell.tsx       # Sidebar + mobile nav (client component)
│   │   │   └── app-shell-wrapper.tsx # Client-boundary wrapper
│   │   └── ui/                     # shadcn/ui primitives (Button, Sonner)
│   ├── dal/                        # Data Access Layer (tRPC wiring)
│   │   ├── init.ts                 # tRPC context, router, procedure factories
│   │   ├── client.tsx              # TRPCReactProvider + useTRPC hook
│   │   ├── server.tsx              # Server-side tRPC caller + options proxy
│   │   ├── query-client.ts         # TanStack QueryClient factory (SuperJSON)
│   │   └── routers/_app.ts         # Root app router (merges feature routers)
│   ├── features/                   # Feature-based modules
│   │   ├── auth/                   # Authentication
│   │   ├── medicine/               # Batch verification (CDSCO)
│   │   ├── scan/                   # AI packaging analysis
│   │   └── reports/                # Counterfeit reporting
│   ├── generated/prisma/           # Auto-generated Prisma Client
│   ├── lib/
│   │   ├── prisma.ts               # Singleton PrismaClient (PrismaPg adapter)
│   │   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│   ├── styles/globals.css          # Global styles + Tailwind directives
│   └── utils/
│       ├── config/rate-limit.ts    # Upstash sliding window rate limiter
│       └── error/
│           ├── errors.ts           # AppError class hierarchy
│           └── api-error.ts        # handleApiError() for REST routes
└── types/                          # Global type declarations
```

---

## Environment Variables

Create a `.env` file in the project root with:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# OpenAI (for AI vision scan)
OPENAI_API_KEY="sk-..."

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## Database Schema (Prisma)

**File:** `prisma/schema.prisma`
**Generator output:** `src/generated/prisma`
**Database:** PostgreSQL (`@prisma/adapter-pg`)

### Models

#### `User` (table: `user`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `name` | String | |
| `email` | String | Unique |
| `emailVerified` | Boolean | Default `false` |
| `image` | String? | Avatar URL |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

Relations: `sessions[]`, `accounts[]`, `scans[]` (via `UserScans`)

#### `Session` (table: `session`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `token` | String | Unique |
| `expiresAt` | DateTime | |
| `userId` | String | FK → User |
| `ipAddress` | String? | |
| `userAgent` | String? | |

#### `Account` (table: `account`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `accountId` | String | Provider's user ID |
| `providerId` | String | e.g. "google" |
| `userId` | String | FK → User |
| `accessToken` | String? | |
| `refreshToken` | String? | |
| `password` | String? | For email/password auth |

#### `Verification` (table: `verification`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `identifier` | String | Indexed |
| `value` | String | |
| `expiresAt` | DateTime | |

#### `MedicineBatch` (table: `medicine_batch`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `batchNumber` | String | **Unique** |
| `medicineName` | String? | |
| `manufacturer` | String? | |
| `expiry` | DateTime? | |
| `approved` | Boolean | Default `false` |
| `recallStatus` | Boolean | Default `false` |

Relations: `scans[]`

#### `Scan` (table: `scan`)
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `medicineBatchId` | String? | FK → MedicineBatch |
| `imageUrl` | String? | Base64 data URL or URL |
| `hologram` | Boolean? | AI-detected hologram presence |
| `spellingErrors` | Json? | Array of detected errors |
| `suspicious` | Boolean? | AI or user-flagged |
| `confidenceScore` | Float? | 0–1 |
| `latitude` | Float? | Geolocation |
| `longitude` | Float? | Geolocation |
| `reportedById` | String? | FK → User (nullable) |
| `createdAt` | DateTime | Auto |

### Commands

```bash
npx prisma generate     # Regenerate client (also runs on postinstall)
npx prisma migrate dev  # Apply migrations in development
npx prisma db push      # Push schema changes without migration files
npx prisma studio       # Visual DB browser
```

---

## Authentication

**Library:** [Better Auth](https://www.better-auth.com/) with Prisma adapter

### Server-side (`src/features/auth/services/auth.ts`)

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
});
```

### Client-side (`src/features/auth/services/auth-client.ts`)

```ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
});
```

### Auth API route (`src/app/api/auth/[...all]/route.ts`)

Better Auth's catch-all handler:
```ts
export const { POST, GET } = toNextJsHandler(auth);
```

### Route protection

The `(app)/layout.tsx` server component checks the session:
```ts
const result = await auth.api.getSession({ headers: await headers() });
if (!result?.session) redirect("/auth");
```

All pages inside `src/app/(app)/` are **automatically protected**. Unauthenticated users are redirected to `/auth`.

### Auth hooks

- `src/features/auth/hooks/use-auth.ts` — `useAuth()` hook using `authClient.useSession()`

### Auth UI

- `src/features/auth/ui/login-button.tsx` — Google sign-in button (calls `authClient.signIn.social({ provider: "google" })`)
- `src/features/auth/ui/logout-button.tsx` — Sign-out button

---

## Data Access Layer (tRPC)

### Architecture

```
Client (React)                Server
─────────────                 ──────
useTRPC() hook ──────────────→ /api/trpc/[trpc] route
  ↓ httpBatchLink                ↓ fetchRequestHandler
  ↓ SuperJSON transform         ↓ rate limiting (Upstash)
  ↓                              ↓
TanStack React Query         appRouter → featureRouter → service → Prisma
```

### Key files

| File | Purpose |
|------|---------|
| `dal/init.ts` | Creates tRPC instance, exports `baseProcedure`, `createTRPCRouter`, `createCallerFactory` |
| `dal/routers/_app.ts` | **Root router** — merges `medicine`, `scan`, `reports` sub-routers + `health` check |
| `dal/client.tsx` | **Client provider** — `TRPCReactProvider`, `useTRPC()` hook, `httpBatchLink` to `/api/trpc` |
| `dal/server.tsx` | **Server caller** — `trpc` options proxy + `caller` for server-side data fetching |
| `dal/query-client.ts` | `makeQueryClient()` — TanStack QueryClient with `staleTime: 30s`, SuperJSON hydration |

### tRPC Context

```ts
// dal/init.ts
export const createTRPCContext = cache(async () => {
  return { userId: "user_123" };
});
```

> **Note:** The context currently returns a hardcoded user. To integrate real auth, read `auth.api.getSession()` here.

### Root Router (all routes)

```ts
// dal/routers/_app.ts
export const appRouter = createTRPCRouter({
  health: baseProcedure.input(z.object({ text: z.string() })).query(...),
  medicine: medicineRouter,
  scan: scanRouter,
  reports: reportRouter,
});
```

### Using tRPC on the client

```tsx
"use client";
import { useTRPC } from "@/dal/client";
import { useQuery, useMutation } from "@tanstack/react-query";

function MyComponent() {
  const trpc = useTRPC();

  // Query
  const { data } = useQuery(
    trpc.medicine.verifyBatch.queryOptions({ batchNumber: "BATCH-2024-001" })
  );

  // Mutation
  const mutation = useMutation(
    trpc.scan.analyzeImage.mutationOptions()
  );
}
```

### Using tRPC on the server (RSC / Server Actions)

```ts
import { caller } from "@/dal/server";
const result = await caller.medicine.verifyBatch({ batchNumber: "BATCH-2024-001" });
```

---

## API Routes

### tRPC Routes (via `/api/trpc`)

All tRPC routes are called through the batch link at `/api/trpc`. They are rate-limited (Upstash: 10 requests / 10 seconds sliding window).

#### `medicine.verifyBatch` (Query)
- **Input:** `{ batchNumber: string, medicineName?: string }`
- **Returns:** `{ isValid, batchNumber, medicineName, manufacturer, expiry, approved, recallStatus, confidence, source }`
- **Flow:** DB cache check → CDSCO mock lookup → cache result → return
- **Service:** `src/features/medicine/services/cdsco.service.ts` → `verifyBatchNumber()`

#### `medicine.recentScans` (Query)
- **Input:** none
- **Returns:** Last 20 scans with `medicineBatch` included
- **Service:** `src/features/medicine/services/medicine.service.ts` → `getRecentScans(20)`

#### `scan.analyzeImage` (Mutation)
- **Input:** `{ imageUrl: string, medicineBatchId?: string, latitude?: number, longitude?: number }`
- **Returns:** `{ scanId, hologram, spellingErrors, suspicious, confidenceScore, batchFormatValid, printQuality, analysis }`
- **Flow:** AI vision analysis (GPT-4o) → save Scan to DB → return
- **Service:** `src/features/scan/services/vision.service.ts` → `analyzePackagingImage()`

#### `reports.reportFakeMedicine` (Mutation)
- **Input:** `{ batchNumber: string, latitude: number, longitude: number, imageUrl?: string }`
- **Returns:** `{ success: true, scanId, batchId }`
- **Flow:** Find or create MedicineBatch → create Scan (suspicious=true) → return
- **Service:** `src/features/reports/services/report.service.ts` → `submitReport()`

#### `reports.getReports` (Query)
- **Input:** none
- **Returns:** All scans where `suspicious=true` OR `confidenceScore < 0.5`, with `medicineBatch` and `reportedBy`
- **Service:** `report.service.ts` → `getReports()`

#### `reports.getLocations` (Query)
- **Input:** none
- **Returns:** Suspicious scans with `{ id, latitude, longitude, createdAt, medicineBatch: { batchNumber, medicineName } }`
- **Service:** `report.service.ts` → `getReportLocations()`

#### `health` (Query)
- **Input:** `{ text: string }`
- **Returns:** `{ message: text }` — echo health check

### REST API Routes

#### `GET /api`
- Health check endpoint. Rate-limited.
- Returns: `{ success: true, status: 200, message: "serverless functions are working" }`

#### `POST /api/medicine/verify`
- **Body:** `{ batchNumber: string }`
- **Returns:** `{ batch }` — looks up cached batch in DB via `findBatchByNumber()`
- **Note:** This is a simpler REST alternative to `medicine.verifyBatch`; only checks cached data (no CDSCO lookup).

#### `POST /api/upload`
- Accepts `multipart/form-data` with a `file` field
- **Validations:** JPEG/PNG/WebP/GIF only, max 10MB
- **Returns:** `{ url: "data:image/...;base64,...", filename, size, type }`
- Converts the file to a base64 data URL (no external storage)

#### `GET/POST /api/auth/[...all]`
- All Better Auth routes (login, callback, session, etc.)

---

## Feature Modules

Each feature follows this structure:

```
features/<feature>/
├── routers/       # tRPC router definitions
├── services/      # Business logic & DB queries
├── hooks/         # React hooks (client-side)
└── ui/            # React components (client-side)
```

### 1. Auth (`features/auth/`)

| File | Export | Purpose |
|------|--------|---------|
| `services/auth.ts` | `auth` | Better Auth server instance (Google OAuth + Prisma) |
| `services/auth-client.ts` | `authClient` | Better Auth client instance |
| `hooks/use-auth.ts` | `useAuth()` | Returns `{ session, user, isPending }` |
| `ui/login-button.tsx` | `<LoginButton />` | Google sign-in button |
| `ui/logout-button.tsx` | `<LogoutButton />` | Sign-out button |

### 2. Medicine (`features/medicine/`)

| File | Export | Purpose |
|------|--------|---------|
| `routers/medicine.router.ts` | `medicineRouter` | `verifyBatch` query + `recentScans` query |
| `services/cdsco.service.ts` | `verifyBatchNumber()` | CDSCO verification: DB cache → mock lookup → save |
| `services/medicine.service.ts` | `findBatchByNumber()`, `createBatch()`, `createScan()`, `getSuspiciousScans()`, `getRecentScans()` | CRUD for MedicineBatch & Scan |
| `hooks/use-verify-batch.ts` | `useVerifyBatch()` | Hook wrapping `trpc.medicine.verifyBatch` |
| `ui/batch-scan-form.tsx` | `<BatchScanForm />` | Form + result display for batch verification |

#### CDSCO Verification Flow

```
User enters batch number
        ↓
verifyBatchNumber(batchNumber)
        ↓
┌─ DB cache hit? ──→ Return cached result (source: "cache", confidence: 0.95)
│
└─ Cache miss
        ↓
   lookupCdsco() — mock CDSCO lookup
        ↓
   ┌─ Known demo batch? ──→ Return hardcoded result
   │   "BATCH-2024-001" → Valid (Cipla Paracetamol)
   │   "BATCH-2024-002" → Valid (Sun Pharma Amoxicillin)
   │   "BATCH-FAKE-001" → Invalid (Counterfeit)
   │   "RECALL-2024-001" → Invalid (Recalled)
   │
   └─ Unknown batch ──→ Return {isValid: false, confidence: 0.3}
        ↓
   Save result to DB (MedicineBatch)
        ↓
   Return result (source: "cdsco")
```

### 3. Scan (`features/scan/`)

| File | Export | Purpose |
|------|--------|---------|
| `routers/scan.router.ts` | `scanRouter` | `analyzeImage` mutation |
| `services/vision.service.ts` | `analyzePackagingImage()` | GPT-4o vision analysis |
| `hooks/use-analyze-package.ts` | `useAnalyzePackage()` | Mutation hook |
| `ui/image-upload.tsx` | `<ImageUpload />` | Upload form + analysis result display |

#### AI Vision Analysis

Uses **Vercel AI SDK's `generateObject()`** with **GPT-4o** and a structured Zod schema.

**Schema returned by AI:**
```ts
{
  hologram: boolean,       // Is hologram visible?
  spellingErrors: string[],// List of spelling errors found
  suspicious: boolean,     // Does it look counterfeit?
  confidenceScore: number, // 0–1 (1 = genuine)
  batchFormatValid: boolean,// Valid batch number format?
  printQuality: "high" | "medium" | "low",
  analysis: string         // Summary text
}
```

**System prompt:** The AI acts as a pharmaceutical packaging expert detecting counterfeits.

### 4. Reports (`features/reports/`)

| File | Export | Purpose |
|------|--------|---------|
| `routers/report.router.ts` | `reportRouter` | `reportFakeMedicine` mutation, `getReports` query, `getLocations` query |
| `services/report.service.ts` | `submitReport()`, `getReports()`, `getReportLocations()` | Report CRUD with geolocation |
| `hooks/use-reports.ts` | `useReports()`, `useSubmitReport()` | Query/mutation hooks |
| `ui/report-form.tsx` | `<ReportForm />` | Batch number + geolocation report form |

---

## Frontend Pages & Components

### Route Layout

```
/                       → Redirects to /auth
/auth                   → Login page (Google OAuth) — public
/dashboard              → Dashboard with stats & quick actions — protected
/medicine               → Batch verification form — protected
/scan                   → AI packaging scan — protected
/reports                → Report counterfeit medicine — protected
/map                    → Leaflet fraud heatmap — protected
```

### Root Layout (`src/app/layout.tsx`)

- Sets dark mode by default (`className="dark"`)
- Loads Inter font from Google Fonts
- Wraps everything in `<TRPCReactProvider>` (provides tRPC + React Query)
- Includes `<Toaster />` (sonner) for toast notifications

### App Layout (`src/app/(app)/layout.tsx`)

- **Server component** — checks session via `auth.api.getSession()`
- Redirects unauthenticated users to `/auth`
- Wraps authenticated pages in `<AppShellWrapper>` → `<AppShell>`

### AppShell (`src/components/layout/app-shell.tsx`)

- **Client component** with responsive sidebar navigation
- Desktop: fixed 64px-wide sidebar with nav items
- Mobile: hamburger menu with collapsible nav
- Nav items: Dashboard, Verify Batch, AI Scan, Report, Fraud Map
- Uses `usePathname()` to highlight active route

### Page Components

| Page | Key Components | Data Source |
|------|---------------|-------------|
| Dashboard | Stats grid (hardcoded), Quick action cards, Demo batch info | Static |
| Medicine | `<BatchScanForm />` → `<VerificationResult />` | `trpc.medicine.verifyBatch` |
| Scan | `<ImageUpload />` → upload → AI analysis display | `POST /api/upload` + `trpc.scan.analyzeImage` |
| Reports | `<ReportForm />` + reports list | `trpc.reports.reportFakeMedicine` + `trpc.reports.getReports` |
| Map | `<MapView />` — Leaflet with custom red pulse markers | `trpc.reports.getLocations` |

---

## Utilities

### Rate Limiting (`src/utils/config/rate-limit.ts`)

```ts
// Sliding window: 10 requests per 10 seconds per IP
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
});
```

Applied to: `/api` health check, `/api/trpc/[trpc]` handler.

### Error Handling (`src/utils/error/`)

Custom error class hierarchy:
```
AppError (base)
├── BadRequestError (400)
├── UnauthorizedError (401)
├── NotFoundError (404)
└── InternalServerError (500)
```

`handleApiError(error)` — converts `AppError` instances to proper JSON responses for REST routes.

### Prisma Client (`src/lib/prisma.ts`)

- Uses `@prisma/adapter-pg` (PrismaPg) for PostgreSQL connection
- Singleton pattern with `globalForPrisma` to prevent hot-reload connection leaks
- Connection string from `DATABASE_URL` env var

### cn() Helper (`src/lib/utils.ts`)

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
```

---

## Conventions & Patterns

### Feature-based architecture

All domain logic lives in `src/features/<name>/`. Each feature is self-contained with its own router, services, hooks, and UI.

### tRPC for API communication

- **No manual fetch calls** — all API calls go through tRPC + React Query
- Use `useQuery()` with `trpc.<router>.<procedure>.queryOptions()` for queries
- Use `useMutation()` with `trpc.<router>.<procedure>.mutationOptions()` for mutations
- `SuperJSON` transformer for serializing `Date`, `Map`, `Set`, etc.

### Server vs Client components

- **Server components** (default): layouts, pages that need auth checks
- **Client components** (`"use client"`): anything with hooks, state, or event handlers
- Auth-gated by the `(app)/layout.tsx` server component

### Validation

- All tRPC inputs are validated with **Zod v4** schemas
- AI responses are validated with `generateObject()` + Zod schema (structured output)

### Styling

- **Dark mode** is the default (applied via root `<html className="dark">`)
- Tailwind CSS v4 with custom `--font-sans` variable (Inter)
- Color system: `emerald` for positive/primary, `red`/`rose` for danger/counterfeit, `amber` for warnings
- Components use `rounded-2xl`, `border-border`, `bg-card` design tokens from shadcn

### File naming

- Routers: `<name>.router.ts`
- Services: `<name>.service.ts`
- Hooks: `use-<name>.ts`
- UI Components: kebab-case, e.g. `batch-scan-form.tsx`

---

## How to Add a New Feature

1. **Create the feature directory:**
   ```
   src/features/<feature-name>/
   ├── routers/<name>.router.ts
   ├── services/<name>.service.ts
   ├── hooks/use-<name>.ts
   └── ui/<component-name>.tsx
   ```

2. **Define the Prisma model** (if needed):
   - Add model to `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name <migration_name>`
   - Client regenerates automatically via `postinstall`

3. **Create the service** (`services/<name>.service.ts`):
   ```ts
   import prisma from "@/lib/prisma";
   
   export async function doSomething(data: { ... }) {
     return await prisma.myModel.create({ data });
   }
   ```

4. **Create the tRPC router** (`routers/<name>.router.ts`):
   ```ts
   import { z } from "zod";
   import { baseProcedure, createTRPCRouter } from "@/dal/init";
   import { doSomething } from "../services/<name>.service";
   
   export const myRouter = createTRPCRouter({
     myProcedure: baseProcedure
       .input(z.object({ ... }))
       .mutation(async ({ input }) => {
         return await doSomething(input);
       }),
   });
   ```

5. **Register the router** in `src/dal/routers/_app.ts`:
   ```ts
   import { myRouter } from "@/features/<name>/routers/<name>.router";
   
   export const appRouter = createTRPCRouter({
     // ...existing routers
     myFeature: myRouter,
   });
   ```

6. **Create the hook** (`hooks/use-<name>.ts`):
   ```ts
   import { useTRPC } from "@/dal/client";
   import { useMutation } from "@tanstack/react-query";
   
   export function useMyFeature() {
     const trpc = useTRPC();
     return useMutation(trpc.myFeature.myProcedure.mutationOptions());
   }
   ```

7. **Create the UI** (`ui/<component>.tsx`):
   ```tsx
   "use client";
   import { useMyFeature } from "../hooks/use-<name>";
   
   export function MyComponent() {
     const mutation = useMyFeature();
     // ...
   }
   ```

8. **Create the page** in `src/app/(app)/<route>/page.tsx`:
   ```tsx
   import { MyComponent } from "@/features/<name>/ui/<component>";
   
   export default function MyPage() {
     return <MyComponent />;
   }
   ```

9. **Add nav item** in `src/components/layout/app-shell.tsx`:
   ```ts
   const navItems = [
     // ...existing
     { href: "/<route>", label: "My Feature", icon: SomeIcon },
   ];
   ```

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server (Next.js)
npm run build            # Production build
npm run lint             # ESLint

# Database
npx prisma generate      # Regenerate Prisma client
npx prisma migrate dev   # Create/apply migrations
npx prisma db push       # Push schema without migration
npx prisma studio        # Visual DB editor

# Prisma format
npx prisma format        # Format schema.prisma
```
