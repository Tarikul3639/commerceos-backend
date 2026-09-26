//@ts-ignore
import "dotenv/config"

import bcrypt from "bcrypt"

import { PrismaPg } from "@prisma/adapter-pg"

import {
    Permission,
    PrismaClient,
    Role,
} from "../src/lib/prisma/client"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.")
}

const adapter = new PrismaPg({
    connectionString,
})

const prisma = new PrismaClient({
    adapter,
})

async function main() {
    console.log("🌱 Seeding database...")

    /**
     * Seed fixed role permission assignments.
     */
    const email = "tarikulislam3639@gmail.com"
    const password = "Admin@123"
    const role = Role.SUPER_ADMIN

    const permissions: Permission[] = Object.values(Permission) as Permission[]

    await prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
            role: Role.SUPER_ADMIN,
            permission,
        })),
        skipDuplicates: true,
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.upsert({
        where: {
            email,
        },

        update: {
            role: Role.SUPER_ADMIN,
        },

        create: {
            name: "Admin User",
            email,
            password: hashedPassword,
            isVerified: true,
            role: Role.SUPER_ADMIN,
        },
    })

    console.log("✅ Admin user created")

    console.table([
        {
            email,
            password,
            role,
        },
    ])

    console.log("🌱 Database seeding completed")
}

main()
    .catch((error: unknown) => {
        console.error("❌ Database seeding failed:", error)

        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })