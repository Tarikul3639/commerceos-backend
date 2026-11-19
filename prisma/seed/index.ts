import { prisma } from './client.js';

import { seedRoles } from './roles.seed.js';
import { seedPermissions } from './permissions.seed.js';
import { seedUsers } from './users.seed.js';
import { seedCategories } from './categories.seed.js';
import { seedBrands } from './brands.seed.js';
import { seedSizeGuides } from './size-guides.seed.js';
import { seedCustomers } from './customers.seed.js';
import { seedProducts } from './product.seed.js';
import { seedBanners } from './banners.js';
import { seedSuppliers } from './supplier.seed.js';
import { seedSettings } from "./settings.seed.js"
import { seedOrderReturns } from './order-returns.seed.js';
import { seedEmails } from './emails.seed.js';
import { seedCarts } from './carts.seed.js';

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

    // 14. Admin Carts test fixtures
    await seedCarts();

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