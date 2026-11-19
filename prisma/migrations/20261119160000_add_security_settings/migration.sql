CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "accessTokenLifetimeMinutes" INTEGER NOT NULL DEFAULT 15,
    "refreshTokenLifetimeDays" INTEGER NOT NULL DEFAULT 7,
    "rememberMeRefreshLifetimeDays" INTEGER NOT NULL DEFAULT 30,
    "minimumPasswordLength" INTEGER NOT NULL DEFAULT 12,
    "maximumFailedLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "accountLockoutDurationMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "users"
  ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3);

CREATE INDEX "users_lockedUntil_idx" ON "users"("lockedUntil");