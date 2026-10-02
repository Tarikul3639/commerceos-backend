-- Product URLs and lookups use the product ID, so the old slug is no longer needed.
-- Drop its unique index before removing the column; all other product data is preserved.
DROP INDEX "products_slug_key";

ALTER TABLE "products"
DROP COLUMN "slug",
ADD COLUMN "subDescription" TEXT;
