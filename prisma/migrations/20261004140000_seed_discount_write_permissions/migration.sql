INSERT INTO "role_permissions" ("id", "role", "permission", "createdAt", "updatedAt")
SELECT
    md5(random()::text || clock_timestamp()::text),
    assignments."role"::"Role",
    assignments."permission"::"Permission",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (VALUES
    ('SUPER_ADMIN', 'DISCOUNT_READ'),
    ('SUPER_ADMIN', 'DISCOUNT_CREATE'),
    ('SUPER_ADMIN', 'DISCOUNT_UPDATE'),
    ('SUPER_ADMIN', 'DISCOUNT_DELETE'),
    ('ADMIN', 'DISCOUNT_READ'),
    ('ADMIN', 'DISCOUNT_CREATE'),
    ('ADMIN', 'DISCOUNT_UPDATE'),
    ('ADMIN', 'DISCOUNT_DELETE'),
    ('MANAGER', 'DISCOUNT_READ'),
    ('MANAGER', 'DISCOUNT_CREATE'),
    ('MANAGER', 'DISCOUNT_UPDATE'),
    ('EMPLOYEE', 'DISCOUNT_READ')
) AS assignments("role", "permission")
ON CONFLICT ("role", "permission") DO NOTHING;
