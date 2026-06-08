import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'

// This script runs outside Next.js (via tsx), which auto-loads `.env.local`.
// Mirror that here — `DATABASE_URL` lives in `.env.local` — falling back to
// `.env` if present (`.env.local` wins; dotenv keeps the first value set).
config({ path: ['.env.local', '.env'] })

import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '../generated/prisma/client.js'

// Seeds run as a standalone script (via tsx), so they instantiate their own
// client rather than importing the server-only lib/prisma.ts. Mirror its
// branching: Accelerate URLs (`prisma+postgres://`) use the Accelerate
// extension; any other URL is a direct connection via the pg adapter.
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing DATABASE_URL environment variable')
  }
  if (url.startsWith('prisma+postgres://')) {
    // Pin to the base client type so the two branches don't collapse into an
    // uncallable union (see lib/prisma.ts for the full rationale).
    return new PrismaClient({ accelerateUrl: url }).$extends(
      withAccelerate(),
    ) as unknown as PrismaClient
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}

const prisma = createPrismaClient()

async function main() {
  const ownerId = 'user_seed_owner'

  // Idempotent: clear this owner's seed data (cascades to collaborators),
  // then recreate it.
  await prisma.project.deleteMany({ where: { ownerId } })

  const project = await prisma.project.create({
    data: {
      ownerId,
      name: 'Demo Architecture',
      description: 'Seed project for local development.',
      status: 'DRAFT',
      canvasJsonPath: 'canvas/demo-architecture.json',
      collaborators: {
        create: [{ email: 'collaborator@example.com' }],
      },
    },
    include: { collaborators: true },
  })

  console.log(
    `Seeded project "${project.name}" (${project.id}) — ` +
      `${project.collaborators.length} collaborator`,
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
