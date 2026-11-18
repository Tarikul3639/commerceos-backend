CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

CREATE TABLE "discounts" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "type" "DiscountType" NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "minOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "maxDiscountAmount" DECIMAL(10,2),
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "usageLimit" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "discounts_code_key" ON "discounts"("code");
CREATE INDEX "discounts_isActive_idx" ON "discounts"("isActive");
CREATE INDEX "discounts_startsAt_endsAt_idx" ON "discounts"("startsAt", "endsAt");

ALTER TABLE "discounts" ADD CONSTRAINT "discounts_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
