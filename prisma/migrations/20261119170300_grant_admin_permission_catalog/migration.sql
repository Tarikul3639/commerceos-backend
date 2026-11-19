INSERT INTO "role_permissions" ("id", "role", "permission", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'ADMIN'::"Role", permission::"Permission", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM unnest(ARRAY[
  'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE',
  'CATEGORY_CREATE', 'CATEGORY_READ', 'CATEGORY_UPDATE', 'CATEGORY_DELETE',
  'BRAND_CREATE', 'BRAND_READ', 'BRAND_UPDATE', 'BRAND_DELETE',
  'PRODUCT_RESTORE',
  'SUPPLIER_CREATE', 'SUPPLIER_READ', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE',
  'CART_CREATE', 'CART_UPDATE', 'CART_DELETE',
  'NOTIFICATION_CREATE', 'NOTIFICATION_READ', 'NOTIFICATION_UPDATE', 'NOTIFICATION_DELETE'
]) AS permission
WHERE NOT EXISTS (
  SELECT 1
  FROM "role_permissions" existing
  WHERE existing."role" = 'ADMIN'::"Role"
    AND existing."permission" = permission::"Permission"
);
