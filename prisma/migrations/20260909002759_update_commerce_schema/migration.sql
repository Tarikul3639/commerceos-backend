/*
  Warnings:

  - Made the column `email` on table `customers` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "customer_refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_refresh_tokens_customerId_idx" ON "customer_refresh_tokens"("customerId");

-- CreateIndex
CREATE INDEX "customer_refresh_tokens_expiresAt_idx" ON "customer_refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");

-- AddForeignKey
ALTER TABLE "customer_refresh_tokens" ADD CONSTRAINT "customer_refresh_tokens_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
