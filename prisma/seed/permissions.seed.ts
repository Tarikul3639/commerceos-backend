import { Permission, Role } from '../../src/lib/prisma/client';

import { prisma } from './client';

const rolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: Object.values(Permission) as Permission[],

    [Role.ADMIN]: [
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.PERMISSION_READ,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_READ,
        Permission.PRODUCT_UPDATE,
        Permission.PRODUCT_DELETE,
        Permission.DISCOUNT_CREATE,
        Permission.DISCOUNT_READ,
        Permission.DISCOUNT_UPDATE,
        Permission.DISCOUNT_DELETE,
        Permission.ORDER_CREATE,
        Permission.ORDER_READ,
        Permission.ORDER_UPDATE,
        Permission.ORDER_DELETE,
        Permission.PURCHASE_CREATE,
        Permission.PURCHASE_READ,
        Permission.PURCHASE_UPDATE,
        Permission.PURCHASE_DELETE,
        Permission.PURCHASE_RETURN_DELETE,
        Permission.STOCK_CREATE,
        Permission.STOCK_READ,
        Permission.STOCK_UPDATE,
        Permission.STOCK_DELETE,
        Permission.BANNER_CREATE,
        Permission.BANNER_READ,
        Permission.BANNER_UPDATE,
        Permission.BANNER_DELETE,
    ],

    [Role.MANAGER]: [
        Permission.USER_READ,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_READ,
        Permission.PRODUCT_UPDATE,
        Permission.DISCOUNT_READ,
        Permission.ORDER_CREATE,
        Permission.ORDER_READ,
        Permission.ORDER_UPDATE,
        Permission.PURCHASE_CREATE,
        Permission.PURCHASE_READ,
        Permission.PURCHASE_UPDATE,
        Permission.STOCK_CREATE,
        Permission.STOCK_READ,
        Permission.STOCK_UPDATE,
        Permission.BANNER_READ,
    ],

    [Role.EMPLOYEE]: [
        Permission.PRODUCT_READ,
        Permission.ORDER_READ,
        Permission.PURCHASE_READ,
        Permission.STOCK_READ,
        Permission.BANNER_READ,
    ],
};

export async function seedPermissions() {
    console.log('Seeding role permissions...');

    for (const role of Object.values(Role)) {
        const permissions = rolePermissions[role];

        await prisma.rolePermission.createMany({
            data: permissions.map((permission) => ({
                role,
                permission,
            })),
            skipDuplicates: true,
        });

        console.log(`  ✓ ${role}: ${permissions.length} permissions`);
    }

    console.log('Role permissions seeded.');
}
