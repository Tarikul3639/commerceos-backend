import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, RoleName } from "../src/lib/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Seeding database...");

    // ============================
    // Roles
    // ============================

    const adminRole = await prisma.role.upsert({
        where: {
            name: RoleName.ADMIN,
        },
        update: {},
        create: {
            name: RoleName.ADMIN,
            description: "System Administrator",
        },
    });

    const managerRole = await prisma.role.upsert({
        where: {
            name: RoleName.MANAGER,
        },
        update: {},
        create: {
            name: RoleName.MANAGER,
            description: "Store Manager",
        },
    });

    const employeeRole = await prisma.role.upsert({
        where: {
            name: RoleName.EMPLOYEE,
        },
        update: {},
        create: {
            name: RoleName.EMPLOYEE,
            description: "Store Employee",
        },
    });

    // ============================
    // Admin User
    // ============================

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await prisma.user.upsert({
        where: {
            email: "admin@commerceos.com",
        },
        update: {},
        create: {
            firstName: "System",
            lastName: "Administrator",
            email: "admin@commerceos.com",
            password: hashedPassword,
            isVerified: true,
            roleId: adminRole.id,
        },
    });

    console.log("✅ Roles Created");
    console.log("✅ Admin User Created");

    console.table([
        {
            email: "admin@commerceos.com",
            password: "Admin@123",
            role: "ADMIN",
        },
    ]);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });