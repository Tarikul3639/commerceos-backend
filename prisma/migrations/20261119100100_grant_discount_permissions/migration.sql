INSERT INTO "role_permissions" ("id", "role", "permission", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'ADMIN', permission::"Permission", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM unnest(ARRAY['DISCOUNT_CREATE','DISCOUNT_READ','DISCOUNT_UPDATE','DISCOUNT_DELETE']) AS permission
WHERE NOT EXISTS (
  SELECT 1 FROM "role_permissions" rp
  WHERE rp."role" = 'ADMIN'::"Role" AND rp."permission" = permission::"Permission"
);
