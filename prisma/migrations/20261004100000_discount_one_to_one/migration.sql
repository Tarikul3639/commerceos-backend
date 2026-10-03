-- Convert legacy many-to-many assignments to one product per discount.
-- When legacy assignments conflict, keep one active/latest assignment per product.
ALTER TYPE "Permission" ADD VALUE 'DISCOUNT_CREATE';
ALTER TYPE "Permission" ADD VALUE 'DISCOUNT_READ';
ALTER TYPE "Permission" ADD VALUE 'DISCOUNT_UPDATE';
ALTER TYPE "Permission" ADD VALUE 'DISCOUNT_DELETE';

CREATE TEMP TABLE "_discount_product_map" AS
WITH product_ranked AS (
    SELECT
        pd."discountId",
        pd."productId",
        ROW_NUMBER() OVER (
            PARTITION BY pd."productId"
            ORDER BY pd."isActive" DESC, (pd."deletedAt" IS NULL) DESC, pd."createdAt" DESC, pd."id"
        ) AS product_rank
    FROM "product_discounts" pd
    WHERE pd."deletedAt" IS NULL
), discount_ranked AS (
    SELECT
        "discountId",
        "productId",
        ROW_NUMBER() OVER (PARTITION BY "discountId" ORDER BY "productId") AS discount_rank
    FROM product_ranked
    WHERE product_rank = 1
)
SELECT "discountId", "productId"
FROM discount_ranked
WHERE discount_rank = 1;

ALTER TABLE "discounts" ADD COLUMN "productId" TEXT;

UPDATE "discounts" AS d
SET "productId" = mapping."productId"
FROM "_discount_product_map" AS mapping
WHERE d."id" = mapping."discountId";

-- Convert fixed amount discounts to equivalent percentages based on the chosen product price.
UPDATE "discounts" AS d
SET "value" = CASE
    WHEN p."sellingPrice" <= 0 THEN 100
    ELSE LEAST(100, ROUND((d."value" / NULLIF(p."sellingPrice", 0)) * 100, 2))
END
FROM "products" AS p
WHERE d."productId" = p."id"
  AND d."type" = 'FIXED';

-- A discount without an eligible legacy assignment cannot satisfy the required product relation.
DELETE FROM "discounts" WHERE "productId" IS NULL;

ALTER TABLE "discounts" ALTER COLUMN "productId" SET NOT NULL;
ALTER TABLE "discounts" DROP COLUMN "isActive";
ALTER TABLE "discounts" DROP COLUMN "type";
DROP TABLE "product_discounts";
DROP TYPE "DiscountType";

CREATE UNIQUE INDEX "discounts_productId_key" ON "discounts"("productId");
ALTER TABLE "discounts"
    ADD CONSTRAINT "discounts_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "_discount_product_map";
