import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@/generated/prisma/client'

// Branch on the connection string: Accelerate URLs (`prisma+postgres://`) must
// use the Accelerate extension and must NOT be passed to a driver adapter; any
// other URL is a direct PostgreSQL connection handled by the pg adapter.
// The return type is pinned to the base `PrismaClient` so callers see one
// concrete type. The Accelerate-extended client is a structural superset; we
// don't use its `cacheStrategy` args, so bridging it back is safe and keeps the
// two branches from collapsing into an uncallable union.
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing DATABASE_URL environment variable')
  }

  if (url.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: url }).$extends(
      withAccelerate(),
    ) as unknown as PrismaClient
  }

  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

type CachedPrismaClient = PrismaClient

// Cache the client on `globalThis` in development so hot reloads reuse one
// instance instead of exhausting database connections.
const globalForPrisma = globalThis as unknown as {
  prisma?: CachedPrismaClient
}

export const prisma: CachedPrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
