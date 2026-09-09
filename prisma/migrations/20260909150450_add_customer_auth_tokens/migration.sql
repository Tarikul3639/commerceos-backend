/*
  Warnings:

  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "refresh_tokens";

-- CreateTable
CREATE TABLE "user_refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_password_reset_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_email_verification_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_email_verification_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_password_reset_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_refresh_tokens_tokenHash_key" ON "user_refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "user_refresh_tokens_userId_idx" ON "user_refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "user_refresh_tokens_expiresAt_idx" ON "user_refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "user_refresh_tokens_revokedAt_idx" ON "user_refresh_tokens"("revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_password_reset_tokens_tokenHash_key" ON "user_password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "user_password_reset_tokens_userId_idx" ON "user_password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "user_password_reset_tokens_expiresAt_idx" ON "user_password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_verification_tokens_tokenHash_key" ON "user_email_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "user_email_verification_tokens_userId_idx" ON "user_email_verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "user_email_verification_tokens_expiresAt_idx" ON "user_email_verification_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_email_verification_tokens_tokenHash_key" ON "customer_email_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "customer_email_verification_tokens_customerId_idx" ON "customer_email_verification_tokens"("customerId");

-- CreateIndex
CREATE INDEX "customer_email_verification_tokens_expiresAt_idx" ON "customer_email_verification_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_password_reset_tokens_tokenHash_key" ON "customer_password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "customer_password_reset_tokens_customerId_idx" ON "customer_password_reset_tokens"("customerId");

-- CreateIndex
CREATE INDEX "customer_password_reset_tokens_expiresAt_idx" ON "customer_password_reset_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "user_refresh_tokens" ADD CONSTRAINT "user_refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_password_reset_tokens" ADD CONSTRAINT "user_password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_email_verification_tokens" ADD CONSTRAINT "user_email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_email_verification_tokens" ADD CONSTRAINT "customer_email_verification_tokens_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_password_reset_tokens" ADD CONSTRAINT "customer_password_reset_tokens_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
