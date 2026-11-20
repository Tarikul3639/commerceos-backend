CREATE TABLE "banner_images" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "bannerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "banner_images_bannerId_sortOrder_idx"
ON "banner_images"("bannerId", "sortOrder");

ALTER TABLE "banner_images"
ADD CONSTRAINT "banner_images_bannerId_fkey"
FOREIGN KEY ("bannerId") REFERENCES "banners"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve every existing desktop banner image as the first responsive image.
INSERT INTO "banner_images" (
    "id", "imageUrl", "publicId", "sortOrder", "bannerId", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    "imageUrl",
    "imagePublicId",
    0,
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "banners";