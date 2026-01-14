import 'dotenv/config'
import type { PrismaConfig } from "prisma";
import { env } from "prisma/config";

export default {
  schema: "src/db/schema",
  migrations: {
    path: "src/db/migrations",
    seed: 'tsx src/db/seed.ts',
  },
  datasource: {
    url: env("DATABASE_URL")
  }
} satisfies PrismaConfig;