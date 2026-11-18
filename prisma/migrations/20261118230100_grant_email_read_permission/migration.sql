INSERT INTO "role_permissions" ("id", "role", "permission", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, roles.role, 'EMAIL_READ'::"Permission", NOW(), NOW()
FROM (VALUES ('SUPER_ADMIN'::"Role"), ('ADMIN'::"Role")) AS roles(role)
WHERE NOT EXISTS (
  SELECT 1
  FROM "role_permissions" existing
  WHERE existing."role" = roles.role
    AND existing."permission" = 'EMAIL_READ'::"Permission"
);
