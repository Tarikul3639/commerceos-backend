INSERT INTO "role_permissions" ("id", "role", "permission", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'ADMIN'::"Role", 'CART_READ'::"Permission", NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM "role_permissions" existing
  WHERE existing."role" = 'ADMIN'::"Role"
    AND existing."permission" = 'CART_READ'::"Permission"
);
