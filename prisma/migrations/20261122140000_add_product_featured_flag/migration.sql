ALTER TABLE "products"
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "products_isFeatured_status_deletedAt_idx"
ON "products"("isFeatured", "status", "deletedAt");
