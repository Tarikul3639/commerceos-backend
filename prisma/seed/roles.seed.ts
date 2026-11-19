import { Role } from "../../src/infrastructure/database/generated/prisma/client.js"

export async function seedRoles() {
  console.log("Seeding roles...")

  // Role seeding logic
  console.log("Available roles:", Object.values(Role))
}