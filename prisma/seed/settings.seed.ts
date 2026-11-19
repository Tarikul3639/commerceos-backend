import { prisma } from "./client.js"
import type { Prisma } from "../../src/infrastructure/database/generated/prisma/client.js"

const settingsId = "seed-general-settings"

const settings: Prisma.SettingsCreateInput = {
  id: settingsId,

  companyName: "CommerceOS Store",
  companyEmail: "support@commerceos.com",
  companyPhone: "+8801700000000",
  companyAddress: "Dhaka, Bangladesh",

  logo: null,
  favicon: null,

  currency: "BDT",
  timezone: "Asia/Dhaka",
}

export async function seedSettings() {
  console.log("Seeding settings...")

  const { id: _id, ...data } = settings

  await prisma.settings.upsert({
    where: { id: settingsId },
    update: data,
    create: settings,
  })

  console.log(`  ✓ ${settings.companyName}`)
  console.log("Seeded settings.")
}