ALTER TABLE "security_settings"
ALTER COLUMN "minimumPasswordLength" SET DEFAULT 8;

UPDATE "security_settings"
SET "minimumPasswordLength" = 8
WHERE "id" = 'default';
