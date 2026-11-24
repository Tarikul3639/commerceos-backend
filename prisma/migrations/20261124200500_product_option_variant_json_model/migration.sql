-- Product option values and variant combinations are being replaced by JSON fields.
-- Existing option/combination records are intentionally discarded; product, order,
-- and inventory records remain intact.

BEGIN;

DELETE FROM "product_options";

DROP TABLE "_ProductOptionValueToProductVariant";
DROP TABLE "product_option_values";

ALTER TABLE "product_options"
  DROP COLUMN "type";

DROP TYPE "ProductOptionType";

CREATE TYPE "ProductOptionType" AS ENUM (
  'COLOR',
  'SIZE',
  'STORAGE',
  'CAPACITY',
  'CUSTOM'
);

ALTER TABLE "product_options"
  ADD COLUMN "type" "ProductOptionType" NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "values" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "product_options"
  ALTER COLUMN "values" DROP DEFAULT;

ALTER TABLE "product_variants"
  DROP COLUMN "title",
  ADD COLUMN "options" JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE "product_variants"
  ALTER COLUMN "options" DROP DEFAULT;

CREATE INDEX "product_options_productId_sortOrder_idx"
  ON "product_options"("productId", "sortOrder");

COMMIT;
