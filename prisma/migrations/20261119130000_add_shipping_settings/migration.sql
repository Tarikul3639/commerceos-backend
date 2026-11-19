CREATE TABLE "shipping_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "freeShippingThreshold" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL,
    "districtCity" TEXT NOT NULL,
    "districtCityKey" TEXT NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipping_zones_districtCityKey_key" ON "shipping_zones"("districtCityKey");
CREATE INDEX "shipping_zones_isActive_idx" ON "shipping_zones"("isActive");
