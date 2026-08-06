import type { PrismaConfig } from "prisma";

export default {
  schema: "src/db/schema/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: "src/db/migrations",
    seed: 'tsx src/db/seed.ts',
  },
} satisfies PrismaConfig;
