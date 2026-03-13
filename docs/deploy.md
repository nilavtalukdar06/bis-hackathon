# Deployment Checklist

## Environment

- Set `DATABASE_URL` for production Postgres.
- Set `BETTER_AUTH_URL` to your production domain.
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for the production OAuth client (redirects must match).
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for the rate-limiter.

## Build & Run

Run:

```
npm run build
npm run start
```

## Platform notes

- Vercel: Ensure server functions support the app router and that environment variables are set in the Vercel dashboard. Add the OAuth redirect in Google Cloud to point to `https://<your-vercel-domain>/api/auth/callback/google`.
- Serverless: Upstash is serverless-friendly; ensure network egress is allowed to Upstash endpoints.

## Monitoring & Safety

- Configure structured logging and error reporting (Sentry) before production rollout.
- Monitor rate-limiter metrics in Upstash and adjust thresholds to match expected traffic.
