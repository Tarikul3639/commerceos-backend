INSERT INTO "role_permissions" ("id", "role", "permission", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'ADMIN'::"Role", permission::"Permission", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM unnest(ARRAY['DASHBOARD_READ', 'ANALYTICS_READ']) AS permission
WHERE NOT EXISTS (
  SELECT 1
  FROM "role_permissions" existing
  WHERE existing."role" = 'ADMIN'::"Role"
    AND existing."permission" = permission::"Permission"
);
