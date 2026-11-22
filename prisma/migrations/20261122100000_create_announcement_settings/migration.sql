CREATE TABLE "announcement_settings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "message" TEXT NOT NULL DEFAULT 'Free delivery on orders over $50',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "announcement_settings_pkey" PRIMARY KEY ("id")
);
