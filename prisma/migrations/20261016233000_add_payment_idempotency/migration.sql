ALTER TABLE "payments" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "payments" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'BDT';
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");
