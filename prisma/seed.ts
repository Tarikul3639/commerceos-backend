import 'dotenv/config';

import bcrypt from 'bcrypt';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient, RoleName } from '../src/lib/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log('🌱 Seeding database...');

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
            description: 'System Administrator',
        },
    });

    await prisma.role.upsert({
        where: {
            name: RoleName.MANAGER,
        },

        update: {},

        create: {
            name: RoleName.MANAGER,
            description: 'Store Manager',
        },
    });

    await prisma.role.upsert({
        where: {
            name: RoleName.EMPLOYEE,
        },

        update: {},

        create: {
            name: RoleName.EMPLOYEE,
            description: 'Store Employee',
        },
    });

    console.log('✅ Roles created');

    /**
     * Admin User
     */

    const email = 'tarikulislam3639@gmail.com';
    const password = 'Admin@123';

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
        where: {
            email,
        },

        update: {},

        create: {
            name: 'Admin User',
            email,
            password: hashedPassword,
            isVerified: true,
            roleId: adminRole.id,
        },
    });

    console.log('✅ Admin user created');

    console.table([
        {
            email,
            password,
            role: RoleName.ADMIN,
        },
    ]);

    console.log('🌱 Database seeding completed');
}

main()
    .catch((error: unknown) => {
        console.error('❌ Database seeding failed:', error);

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
