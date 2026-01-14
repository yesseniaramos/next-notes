import 'dotenv/config'
import type { PrismaConfig } from "prisma";

export default {
  schema: "src/db/schema/schema.prisma",
  migrations: {
    path: "src/db/migrations",
    seed: 'tsx src/db/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!
  }
} satisfies PrismaConfig;