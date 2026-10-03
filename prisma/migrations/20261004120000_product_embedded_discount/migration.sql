-- Keep the discount table aligned with the product-owned discount model.
DELETE FROM "discounts" WHERE "deletedAt" IS NOT NULL;

ALTER TABLE "discounts"
    DROP COLUMN IF EXISTS "name",
    DROP COLUMN IF EXISTS "description",
    DROP COLUMN IF EXISTS "deletedAt";

-- Product permissions now govern embedded discount creation and updates.
DELETE FROM "role_permissions"
WHERE "permission"::text IN ('DISCOUNT_CREATE', 'DISCOUNT_UPDATE');

ALTER TABLE "role_permissions"
    ALTER COLUMN "permission" TYPE TEXT USING "permission"::text;

CREATE TYPE "Permission_new" AS ENUM (
    'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE',
    'PERMISSION_READ', 'PERMISSION_UPDATE',
    'PRODUCT_CREATE', 'PRODUCT_READ', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
    'DISCOUNT_READ', 'DISCOUNT_DELETE',
    'ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE', 'ORDER_DELETE',
    'PURCHASE_CREATE', 'PURCHASE_READ', 'PURCHASE_UPDATE', 'PURCHASE_DELETE',
    'PURCHASE_RETURN_DELETE',
    'STOCK_CREATE', 'STOCK_READ', 'STOCK_UPDATE', 'STOCK_DELETE'
);

ALTER TABLE "role_permissions"
    ALTER COLUMN "permission" TYPE "Permission_new"
    USING "permission"::"Permission_new";

DROP TYPE "Permission";
ALTER TYPE "Permission_new" RENAME TO "Permission";
