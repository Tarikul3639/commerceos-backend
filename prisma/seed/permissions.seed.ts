import { Permission, Role } from '../../src/lib/prisma/client';

import { prisma } from './client';

const rolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission) as Permission[],

  [Role.ADMIN]: [
    Permission.DASHBOARD_READ,
    Permission.ANALYTICS_READ,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.PERMISSION_READ,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_DELETE,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,
    Permission.BRAND_CREATE,
    Permission.BRAND_READ,
    Permission.BRAND_UPDATE,
    Permission.BRAND_DELETE,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_RESTORE,
    Permission.DISCOUNT_CREATE,
    Permission.DISCOUNT_READ,
    Permission.DISCOUNT_UPDATE,
    Permission.DISCOUNT_DELETE,
    Permission.STOCK_CREATE,
    Permission.STOCK_READ,
    Permission.STOCK_UPDATE,
    Permission.STOCK_DELETE,
    Permission.PURCHASE_CREATE,
    Permission.PURCHASE_READ,
    Permission.PURCHASE_UPDATE,
    Permission.PURCHASE_DELETE,
    Permission.PURCHASE_RETURN_DELETE,
    Permission.SUPPLIER_CREATE,
    Permission.SUPPLIER_READ,
    Permission.SUPPLIER_UPDATE,
    Permission.SUPPLIER_DELETE,
    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
    Permission.CART_CREATE,
    Permission.CART_READ,
    Permission.CART_UPDATE,
    Permission.CART_DELETE,
    Permission.BANNER_CREATE,
    Permission.BANNER_READ,
    Permission.BANNER_UPDATE,
    Permission.BANNER_DELETE,
    Permission.ACTIVITY_LOG_READ,
    Permission.EMAIL_READ,
    Permission.NOTIFICATION_CREATE,
    Permission.NOTIFICATION_READ,
    Permission.NOTIFICATION_UPDATE,
    Permission.NOTIFICATION_DELETE,
    Permission.SETTING_READ,
    Permission.SETTING_UPDATE,
  ],

  [Role.MANAGER]: [
    Permission.DASHBOARD_READ,
    Permission.ANALYTICS_READ,
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
    Permission.DASHBOARD_READ,
    Permission.PRODUCT_READ,
    Permission.ORDER_READ,
    Permission.PURCHASE_READ,
    Permission.STOCK_READ,
    Permission.BANNER_READ,
  ],
};

/**
 * Seed the role-to-permission assignments without duplicating existing grants.
 */
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
