import bcrypt from 'bcrypt';

import { CustomerStatus } from '../../src/lib/prisma/client';

import { prisma } from './client';

const customers = [
    {
        name: 'Rahim Ahmed',
        email: 'rahim@example.com',
        phone: '+8801700000001',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Karim Hasan',
        email: 'karim@example.com',
        phone: '+8801700000002',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Nusrat Jahan',
        email: 'nusrat@example.com',
        phone: '+8801700000003',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Sadia Islam',
        email: 'sadia@example.com',
        phone: '+8801700000004',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Tanvir Hossain',
        email: 'tanvir@example.com',
        phone: '+8801700000005',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Mehedi Hasan',
        email: 'mehedi@example.com',
        phone: '+8801700000006',
        status: CustomerStatus.ACTIVE,
        isVerified: false,
    },
    {
        name: 'Farzana Akter',
        email: 'farzana@example.com',
        phone: '+8801700000007',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Imran Khan',
        email: 'imran@example.com',
        phone: '+8801700000008',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Sumaiya Rahman',
        email: 'sumaiya@example.com',
        phone: '+8801700000009',
        status: CustomerStatus.ACTIVE,
        isVerified: false,
    },
    {
        name: 'Arif Hossain',
        email: 'arif@example.com',
        phone: '+8801700000010',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Mim Akter',
        email: 'mim@example.com',
        phone: '+8801700000011',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Sakib Ahmed',
        email: 'sakib@example.com',
        phone: '+8801700000012',
        status: CustomerStatus.INACTIVE,
        isVerified: true,
    },
    {
        name: 'Jannatul Ferdous',
        email: 'jannatul@example.com',
        phone: '+8801700000013',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Fahim Rahman',
        email: 'fahim@example.com',
        phone: '+8801700000014',
        status: CustomerStatus.SUSPENDED,
        isVerified: true,
    },
    {
        name: 'Tanjila Sultana',
        email: 'tanjila@example.com',
        phone: '+8801700000015',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Shakil Ahmed',
        email: 'shakil@example.com',
        phone: '+8801700000016',
        status: CustomerStatus.ACTIVE,
        isVerified: false,
    },
    {
        name: 'Raisa Islam',
        email: 'raisa@example.com',
        phone: '+8801700000017',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Hasan Mahmud',
        email: 'hasan@example.com',
        phone: '+8801700000018',
        status: CustomerStatus.INACTIVE,
        isVerified: true,
    },
    {
        name: 'Anika Tasnim',
        email: 'anika@example.com',
        phone: '+8801700000019',
        status: CustomerStatus.ACTIVE,
        isVerified: true,
    },
    {
        name: 'Rifat Hossain',
        email: 'rifat@example.com',
        phone: '+8801700000020',
        status: CustomerStatus.DELETED,
        isVerified: true,
    },
] as const;

export async function seedCustomers() {
    console.log('Seeding customers...');

    // Use a development-only password for all seeded customers.
    // const password = process.env.SEED_CUSTOMER_PASSWORD;
    const password = 'Customer@123'; // Development-only password for all seeded customers.

    if (!password || password.length < 12) {
        throw new Error(
            'SEED_CUSTOMER_PASSWORD must be set and at least 12 characters long.',
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    for (const customer of customers) {
        await prisma.customer.upsert({
            where: { email: customer.email },
            update: {
                name: customer.name,
                status: customer.status,
                isVerified: customer.isVerified,
            },
            create: {
                ...customer,
                password: hashedPassword,
            },
        });

        console.log(`  ✓ ${customer.name}`);
    }

    console.log(`Seeded ${customers.length} customers.`);
}
