/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `brands` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `product_images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `product_discounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('HERO', 'PROMOTION', 'OFFER', 'PRODUCT', 'CATEGORY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('HOME_TOP', 'HOME_MIDDLE', 'HOME_BOTTOM');

-- AlterEnum
ALTER TYPE "CustomerStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "product_discounts" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "publicId" TEXT;

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "type" "BannerType" NOT NULL,
    "position" "BannerPosition" NOT NULL,
    "link" TEXT,
    "buttonText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_type_idx" ON "banners"("type");

-- CreateIndex
CREATE INDEX "banners_position_idx" ON "banners"("position");

-- CreateIndex
CREATE INDEX "banners_isActive_idx" ON "banners"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "brands_publicId_key" ON "brands"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_publicId_key" ON "categories"("publicId");

-- CreateIndex
CREATE INDEX "product_discounts_productId_isActive_idx" ON "product_discounts"("productId", "isActive");

-- CreateIndex
CREATE INDEX "product_discounts_deletedAt_idx" ON "product_discounts"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_publicId_key" ON "product_images"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_publicId_key" ON "product_variants"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "products_publicId_key" ON "products"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "users_publicId_key" ON "users"("publicId");
