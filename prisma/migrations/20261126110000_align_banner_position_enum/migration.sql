-- Remove the temporary page-specific values and keep the canonical placements.
-- Preserve any banners created with the temporary values by mapping them to the
-- corresponding canonical placement before replacing the enum type.
CREATE TYPE "BannerPosition_new" AS ENUM (
  'HOME_TOP',
  'HOME_MIDDLE',
  'HOME_BOTTOM',
  'CATEGORY_TOP',
  'CATEGORY_MIDDLE',
  'PRODUCT_TOP',
  'PRODUCT_MIDDLE',
  'BRAND_TOP',
  'SHOP_TOP',
  'SHOP_MIDDLE',
  'SIDEBAR'
);

ALTER TABLE "banners"
ALTER COLUMN "position" TYPE "BannerPosition_new"
USING (
  CASE "position"::text
    WHEN 'PRODUCT_PAGE_TOP' THEN 'PRODUCT_TOP'
    WHEN 'BRAND_PAGE_TOP' THEN 'BRAND_TOP'
    ELSE "position"::text
  END
)::"BannerPosition_new";

DROP TYPE "BannerPosition";
ALTER TYPE "BannerPosition_new" RENAME TO "BannerPosition";
