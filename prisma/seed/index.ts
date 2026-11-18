import { prisma } from './client';

import { seedRoles } from './roles.seed';
import { seedPermissions } from './permissions.seed';
import { seedUsers } from './users.seed';
import { seedCategories } from './categories.seed';
import { seedBrands } from './brands.seed';
import { seedSizeGuides } from './size-guides.seed';
import { seedCustomers } from './customers.seed';
import { seedProducts } from './product.seed';
import { seedBanners } from './banners';
import { seedSuppliers } from './supplier.seed';
import { seedSettings } from "./settings.seed"
import { seedOrderReturns } from './order-returns.seed';
import { seedEmails } from './emails.seed';

async function main() {
    console.log('🌱 Database seeding started...\n');

    // // 1. Roles
    // await seedRoles();

    // // 2. Role permissions
    // await seedPermissions();

    // 3. Admin users required by Order Returns test fixtures
    await seedUsers();

    // // 4. Categories
    // await seedCategories();

    // // 5. Brands
    // await seedBrands();

    // // 6. Size guides
    // await seedSizeGuides();

    // 7. Customer required by Order Returns test fixtures
    await seedCustomers();

    // // 8. Products
    // await seedProducts();

    // // 9. Banners
    // await seedBanners();

    // // 10. Suppliers
    // await seedSuppliers();

    // 11. Settings
    await seedSettings();

    // 12. Order Returns test fixtures
    await seedOrderReturns();

    // 13. Email delivery log test fixtures
    await seedEmails();

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
