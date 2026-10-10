import { Role } from "../../src/lib/prisma/client"

export async function seedRoles() {
  console.log("Seeding roles...")

  // Role seeding logic
  console.log("Available roles:", Object.values(Role))
}