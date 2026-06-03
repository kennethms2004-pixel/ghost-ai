import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

// Seeds run as a standalone script (via tsx), so they instantiate their own
// adapter-backed client rather than importing the server-only lib/prisma.ts.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

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
