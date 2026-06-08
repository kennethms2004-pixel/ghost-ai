## Open (deferred, non-blocking)

_None._

## Resolved

1. ~~When I log in everything is fine, but when I log out Next.js renders infinitely.~~ Fixed: set `afterSignOutUrl="/sign-in"` on `ClerkProvider` so logout lands on the public sign-in page instead of bouncing through `/`'s auth redirect during sign-out handshake.
2. ~~pg SSL deprecation warning (`?sslmode=require`).~~ Fixed: changed `sslmode=require` → `sslmode=verify-full` in `.env.local`'s `DATABASE_URL` (`db.prisma.io` serves a publicly-trusted cert). Verified with `tsx scripts/verify-prisma.ts` — DB still connects, warning gone.
3. ~~Seed/verify scripts looked for `.env` but env is now in `.env.local`.~~ Fixed: `prisma/seed.ts` and `scripts/verify-prisma.ts` now `config({ path: ['.env.local', '.env'] })` (from `dotenv`) instead of `import 'dotenv/config'`, mirroring Next.js's `.env.local`-first load order (`.env.local` wins; `.env` is a fallback). Verified the script loads env and reads the DB.
