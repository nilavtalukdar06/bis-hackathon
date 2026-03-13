# Quick Start

1. Install deps:

```bash
npm install
```

2. Create `.env` with required variables (see `project.txt`).

3. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

4. Start dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000` and use `/auth` to sign in.

## Notes

- If Prisma complains, verify `DATABASE_URL` and network access.
- For Google OAuth, ensure redirect URI `http://localhost:3000/api/auth/callback/google` is configured.
