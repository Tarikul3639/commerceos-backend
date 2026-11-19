/**
 * Converts CommerceOS decimal amounts to Stripe's integer minor-unit format.
 * The current Payment model uses Decimal(12, 2), so two decimal places apply.
 */
export function toStripeMinorUnits(amount: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    throw new Error('Payment amount must have at most two decimal places.');
  }

  const [whole, fraction = ''] = amount.split('.');
  const minorUnits = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));

  if (minorUnits <= 0n || minorUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Payment amount is outside the supported range.');
  }

  return Number(minorUnits);
}
