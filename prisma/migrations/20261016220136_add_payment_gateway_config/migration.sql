/*
  Warnings:

  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to drop the `payment_method_configs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'STRIPE', 'SSL_COMMERZ', 'BKASH', 'NAGAD', 'ROCKET');

-- CreateEnum
CREATE TYPE "PaymentGatewayMode" AS ENUM ('TEST', 'LIVE');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "originalPaymentId" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "sessionId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- DropTable
DROP TABLE "payment_method_configs";

-- CreateTable
CREATE TABLE "payment_gateway_configs" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "displayName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mode" "PaymentGatewayMode" NOT NULL DEFAULT 'TEST',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_configs_provider_key" ON "payment_gateway_configs"("provider");

-- CreateIndex
CREATE INDEX "payments_provider_idx" ON "payments"("provider");

-- CreateIndex
CREATE INDEX "payments_sessionId_idx" ON "payments"("sessionId");

-- CreateIndex
CREATE INDEX "payments_originalPaymentId_idx" ON "payments"("originalPaymentId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_originalPaymentId_fkey" FOREIGN KEY ("originalPaymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
