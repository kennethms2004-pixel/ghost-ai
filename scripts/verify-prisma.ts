import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'

// This script runs outside Next.js (via tsx), which auto-loads `.env.local`.
// Mirror that here — `DATABASE_URL` lives in `.env.local` — falling back to
// `.env` if present (`.env.local` wins; dotenv keeps the first value set).
config({ path: ['.env.local', '.env'] })

import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '../generated/prisma/client.js'

// Mirror lib/prisma.ts branching so verification works against both Accelerate
// URLs (`prisma+postgres://`) and direct PostgreSQL connections.
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
  const projectCount = await prisma.project.count()
  const firstProject = await prisma.project.findFirst({
    include: { collaborators: true },
  })

  console.log('✅ Connected — Prisma Postgres reachable')
  console.log(`   projects in database: ${projectCount}`)
  if (firstProject) {
    console.log(
      `   sample: "${firstProject.name}" [${firstProject.status}] with ` +
        `${firstProject.collaborators.length} collaborator(s)`,
    )
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Connection/read failed:')
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
