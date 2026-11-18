// Load .env.local first; fall back to .env for any missing variables.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: [".env.local", ".env.prod", '.env'] });
loadEnv();

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
