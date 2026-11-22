CREATE TABLE "product_discounts" (
  "id" TEXT NOT NULL,
  "type" "DiscountType" NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_discounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_discounts_productId_key"
  ON "product_discounts"("productId");
CREATE INDEX "product_discounts_isActive_startsAt_endsAt_idx"
  ON "product_discounts"("isActive", "startsAt", "endsAt");

ALTER TABLE "product_discounts"
  ADD CONSTRAINT "product_discounts_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;