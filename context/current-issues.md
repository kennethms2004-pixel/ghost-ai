## Open (deferred, non-blocking)

1. **pg SSL deprecation warning** — `DATABASE_URL` uses `?sslmode=require`. `pg-connection-string` warns this is treated as `verify-full` today but will adopt weaker libpq semantics in pg v9. Harmless now (TLS is still cert-verified). Fix when ready by changing `sslmode=require` → `sslmode=verify-full` in `.env.local` (`db.prisma.io` serves a public cert, so verify-full works). Surfaces "at EditorLayout" because that's the first DB query.
2. **Seed/verify scripts look for `.env` but env is now in `.env.local`** — `prisma/seed.ts` and `scripts/verify-prisma.ts` `import 'dotenv/config'`, which loads `.env` by default. `DATABASE_URL` was consolidated into `.env.local`, so these scripts won't find it until they're pointed at `.env.local` (e.g. `dotenv -e .env.local` or `config({ path: '.env.local' })`). The Next.js app is unaffected (it loads `.env.local`).

## Resolved

1. ~~When I login everything is fine, but when I logout Next.js renders infinitely.~~ Fixed: set `afterSignOutUrl="/sign-in"` on `ClerkProvider` so logout lands on the public sign-in page instead of bouncing through `/`'s auth redirect during sign-out handshake.
