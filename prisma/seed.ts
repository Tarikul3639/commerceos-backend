//@ts-ignore
import "dotenv/config"

import bcrypt from "bcrypt"

import { PrismaPg } from "@prisma/adapter-pg"

import {
    PrismaClient,
    RoleName,
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
     * Seed User Configuration
     */
    const email = "tarikulislam3639@gmail.com"
    const password = "Admin@123"
    const role = RoleName.SUPER_ADMIN

    /**
     * Roles
     */
    const adminRole = await prisma.role.upsert({
        where: {
            name: RoleName.ADMIN,
        },
        update: {},
        create: {
            name: RoleName.ADMIN,
            description: "System Administrator",
        },
    })

    await prisma.role.upsert({
        where: {
            name: RoleName.MANAGER,
        },
        update: {},
        create: {
            name: RoleName.MANAGER,
            description: "Store Manager",
        },
    })

    await prisma.role.upsert({
        where: {
            name: RoleName.EMPLOYEE,
        },
        update: {},
        create: {
            name: RoleName.EMPLOYEE,
            description: "Store Employee",
        },
    })

    /**
     * SUPER_ADMIN Role
     *
     * Make sure SUPER_ADMIN also exists
     * because the user role comes from `role` constant.
     */
    const superAdminRole = await prisma.role.upsert({
        where: {
            name: RoleName.SUPER_ADMIN,
        },
        update: {},
        create: {
            name: RoleName.SUPER_ADMIN,
            description: "Super Administrator",
        },
    })

    console.log("✅ Roles created")

    /**
     * Admin User
     */
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.upsert({
        where: {
            email,
        },

        update: {
            roleId: superAdminRole.id,
        },

        create: {
            name: "Admin User",
            email,
            password: hashedPassword,
            isVerified: true,
            roleId: superAdminRole.id,
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