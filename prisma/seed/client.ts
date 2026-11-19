import { config as loadEnv } from "dotenv";

loadEnv({ path: [".env.local", ".env.prod", '.env'] });
loadEnv();

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../src/infrastructure/database/generated/prisma/client.js"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.")
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({ adapter })