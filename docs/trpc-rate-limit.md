# TRPC & Rate Limiting

## Where to look

- TRPC init: `src/dal/init.ts`
- Main router: `src/dal/routers/_app.ts`
- API endpoint (with limiter): `src/app/api/trpc/[trpc]/route.ts`
- Rate limiter config: `src/utils/config/rate-limit.ts`

## Adjusting rate limits

1. Open `src/utils/config/rate-limit.ts` and modify the sliding window parameters (requests, duration).
2. Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in the environment for the runtime.
3. The TRPC route extracts client IP from `x-forwarded-for`; in environments without that header, adjust extraction logic accordingly.

## Adding new TRPC procedures

1. Edit or add routers under `src/dal/routers/` and export them from `_app.ts`.
2. Use `initTRPC` procedures (public or protected) depending on auth requirements.
3. Client-side, update `src/dal/client.tsx` to call new procedures via TRPC hooks.

## Testing the limiter locally

Use a small script or curl loop against the TRPC endpoint to verify 429 behavior when exceeding the configured rate.
