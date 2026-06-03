import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

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
