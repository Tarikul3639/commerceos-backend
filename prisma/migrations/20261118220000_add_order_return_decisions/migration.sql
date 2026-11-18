-- Persist the reason and staff audit trail for return decisions.
ALTER TABLE "order_returns"
  ADD COLUMN "rejectionReason" TEXT,
  ADD COLUMN "rejectedById" TEXT,
  ADD COLUMN "rejectedAt" TIMESTAMP(3),
  ADD COLUMN "completedById" TEXT,
  ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE INDEX "order_returns_rejectedById_idx"
  ON "order_returns"("rejectedById");

CREATE INDEX "order_returns_completedById_idx"
  ON "order_returns"("completedById");

ALTER TABLE "order_returns"
  ADD CONSTRAINT "order_returns_rejectedById_fkey"
  FOREIGN KEY ("rejectedById") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_returns"
  ADD CONSTRAINT "order_returns_completedById_fkey"
  FOREIGN KEY ("completedById") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;