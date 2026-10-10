import { prisma } from './client';

import { seedRoles } from './roles.seed';
import { seedPermissions } from './permissions.seed';
import { seedUsers } from './users.seed';
import { seedCategories } from './categories.seed';
import { seedBrands } from './brands.seed';
import { seedSizeGuides } from './size-guides.seed';
import { seedCustomers } from './customers.seed';

async function main() {
    console.log('🌱 Database seeding started...\n');

    // 1. Roles
    await seedRoles();

    // 2. Role permissions
    await seedPermissions();

    // 3. Admin user
    await seedUsers();

    // 4. Categories
    await seedCategories();

    // 5. Brands
    await seedBrands();

    // 6. Size guides
    await seedSizeGuides();

    // 7. Customers
    await seedCustomers();

    console.log('\n✅ Database seeding completed.');
}

main()
    .catch((error: unknown) => {
        console.error('❌ Database seeding failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
