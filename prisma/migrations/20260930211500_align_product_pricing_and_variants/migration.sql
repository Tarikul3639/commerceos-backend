-- Move pricing ownership from variants to products.
ALTER TABLE "product_variants"
ADD COLUMN "color" TEXT,
ADD COLUMN "colorHex" TEXT,
ADD COLUMN "size" TEXT;

ALTER TABLE "product_variants"
DROP COLUMN "purchasePrice",
DROP COLUMN "sellingPrice";

-- Dynamic attributes are no longer part of the catalog model.
DROP TABLE IF EXISTS "variant_attribute_values";
DROP TABLE IF EXISTS "attribute_values";
DROP TABLE IF EXISTS "attributes";
