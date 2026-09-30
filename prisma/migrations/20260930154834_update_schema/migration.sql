/*
  Warnings:

  - The values [ROLE_CREATE,ROLE_READ,ROLE_UPDATE,ROLE_DELETE] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `image` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `categories` table. All the data in the column will be lost.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roleId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[publicId]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role,permission]` on the table `role_permissions` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `role_permissions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `role` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `role_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'PERMISSION_READ', 'PERMISSION_UPDATE', 'PRODUCT_CREATE', 'PRODUCT_READ', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE', 'ORDER_DELETE', 'PURCHASE_CREATE', 'PURCHASE_READ', 'PURCHASE_UPDATE', 'PURCHASE_DELETE', 'STOCK_CREATE', 'STOCK_READ', 'STOCK_UPDATE', 'STOCK_DELETE');
ALTER TABLE "role_permissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_userId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropIndex
DROP INDEX "categories_publicId_key";

-- DropIndex
DROP INDEX "users_roleId_idx";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "image",
DROP COLUMN "publicId";

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sizeChartId" TEXT,
ADD COLUMN     "purchasePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "sellingPrice" DECIMAL(65,30) NOT NULL DEFAULT 0;

ALTER TABLE "products"
ALTER COLUMN "purchasePrice" DROP DEFAULT,
ALTER COLUMN "sellingPrice" DROP DEFAULT;

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
DROP COLUMN "roleId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roleId",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'EMPLOYEE';

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "size_charts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_chart_items" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "chest" DECIMAL(65,30),
    "length" DECIMAL(65,30),
    "shoulder" DECIMAL(65,30),
    "sleeve" DECIMAL(65,30),
    "waist" DECIMAL(65,30),
    "hip" DECIMAL(65,30),
    "inseam" DECIMAL(65,30),
    "sizeChartId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_chart_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "size_charts_name_key" ON "size_charts"("name");

-- CreateIndex
CREATE INDEX "size_chart_items_sizeChartId_idx" ON "size_chart_items"("sizeChartId");

-- CreateIndex
CREATE UNIQUE INDEX "size_chart_items_sizeChartId_size_key" ON "size_chart_items"("sizeChartId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "customers_publicId_key" ON "customers"("publicId");

-- CreateIndex
CREATE INDEX "products_sizeChartId_idx" ON "products"("sizeChartId");

-- CreateIndex
CREATE INDEX "role_permissions_role_idx" ON "role_permissions"("role");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_permission_key" ON "role_permissions"("role", "permission");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "size_charts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_chart_items" ADD CONSTRAINT "size_chart_items_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "size_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
