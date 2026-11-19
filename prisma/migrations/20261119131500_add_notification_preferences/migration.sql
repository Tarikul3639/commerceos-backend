CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "ordersInApp" BOOLEAN NOT NULL DEFAULT true,
    "ordersEmail" BOOLEAN NOT NULL DEFAULT true,
    "returnsInApp" BOOLEAN NOT NULL DEFAULT true,
    "returnsEmail" BOOLEAN NOT NULL DEFAULT true,
    "inventoryInApp" BOOLEAN NOT NULL DEFAULT true,
    "inventoryEmail" BOOLEAN NOT NULL DEFAULT true,
    "paymentsInApp" BOOLEAN NOT NULL DEFAULT true,
    "paymentsEmail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);