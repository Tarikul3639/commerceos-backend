import bcrypt from 'bcrypt';

import { Role, UserStatus } from '../../src/lib/prisma/client';

import { prisma } from './client';

const users = [
    {
        name: 'Super Admin',
        email: 'tarikulislam3639@gmail.com',
        phone: '+8801700000101',
        role: Role.SUPER_ADMIN,
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+8801700000102',
        role: Role.ADMIN,
    },
    {
        name: 'Manager User',
        email: 'manager@example.com',
        phone: '+8801700000103',
        role: Role.MANAGER,
    },
    {
        name: 'Employee User',
        email: 'employee@example.com',
        phone: '+8801700000104',
        role: Role.EMPLOYEE,
    },
] as const;

export async function seedUsers() {
    console.log('Seeding users...');

    // const password = process.env.SEED_USER_PASSWORD;
    const password = 'User@123'; // Development-only password for all seeded users.

    if (!password || password.length < 8) {
        throw new Error(
            'SEED_USER_PASSWORD must be set and at least 8 characters long.',
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                role: user.role,
            },
            create: {
                ...user,
                password: hashedPassword,
                status: UserStatus.ACTIVE,
                isVerified: true,
            },
        });

        console.log(`  ✓ ${user.email} (${user.role})`);
    }

    console.log(`Seeded ${users.length} users.`);
}
