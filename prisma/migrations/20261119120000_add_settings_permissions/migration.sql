-- Add dedicated permissions for sensitive application settings.
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'SETTING_READ';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'SETTING_UPDATE';
