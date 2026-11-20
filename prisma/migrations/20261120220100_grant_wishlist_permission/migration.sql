INSERT INTO "role_permissions" ("id", "role", "permission", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'ADMIN'::"Role", 'WISHLIST_READ'::"Permission", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "role_permissions"
  WHERE "role" = 'ADMIN'::"Role" AND "permission" = 'WISHLIST_READ'::"Permission"
);
