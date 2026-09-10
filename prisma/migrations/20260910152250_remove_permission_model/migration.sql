/*
  Warnings:

  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permissionId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `permission` to the `role_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PermissionName" AS ENUM ('USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CREATE', 'ROLE_READ', 'ROLE_UPDATE', 'ROLE_DELETE', 'PRODUCT_CREATE', 'PRODUCT_READ', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'ORDER_CREATE', 'ORDER_READ', 'ORDER_UPDATE', 'ORDER_DELETE', 'PURCHASE_CREATE', 'PURCHASE_READ', 'PURCHASE_UPDATE', 'PURCHASE_DELETE', 'STOCK_CREATE', 'STOCK_READ', 'STOCK_UPDATE', 'STOCK_DELETE');

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropIndex
DROP INDEX "role_permissions_permissionId_idx";

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
DROP COLUMN "permissionId",
ADD COLUMN     "permission" "PermissionName" NOT NULL,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId", "permission");

-- DropTable
DROP TABLE "permissions";

-- CreateIndex
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions"("permission");
