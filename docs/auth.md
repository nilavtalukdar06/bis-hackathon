# Authentication (BetterAuth)

## Server-side

- Configured in `src/features/auth/services/auth.ts`.
- Uses Prisma adapter to persist `User`, `Session`, and `Account` models.
- Ensure `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` are set in `.env`.

## Google OAuth setup

1. Create a Google Cloud project and OAuth 2.0 credentials.
2. Set the authorized redirect URI to:

   `http://localhost:3000/api/auth/callback/google`

3. Copy the client ID and secret into `.env`.

## Client-side

- Client initialization lives in `src/features/auth/services/auth-client.ts`.
- Use the `use-auth` hook at `src/features/auth/hooks/use-auth.ts` for login/logout flows.

## Troubleshooting

- Mismatched redirect URI produces an OAuth error — verify the exact URL in Google Cloud.
- If session persistence fails, check Prisma connection and `src/lib/prisma.ts` for correct `DATABASE_URL`.
