import path from 'node:path'
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: path.join(import.meta.dirname, 'prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: path.join(import.meta.dirname, 'prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
})
