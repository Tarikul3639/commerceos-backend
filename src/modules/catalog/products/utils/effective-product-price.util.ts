import { Prisma } from '../../../../infrastructure/database/generated/prisma/client.js';

export function getEffectiveProductPrice(
  sellingPrice: Prisma.Decimal,
  discount: {
    type: 'PERCENTAGE' | 'FIXED';
    value: Prisma.Decimal;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  } | null,
  now = new Date(),
): Prisma.Decimal {
  if (
    !discount?.isActive ||
    (discount.startsAt && discount.startsAt > now) ||
    (discount.endsAt && discount.endsAt < now)
  ) {
    return sellingPrice;
  }

  const discountAmount =
    discount.type === 'PERCENTAGE'
      ? sellingPrice.mul(discount.value).div(100)
      : discount.value;

  const finalPrice = sellingPrice.minus(discountAmount);
  return finalPrice.lessThan(0) ? new Prisma.Decimal(0) : finalPrice;
}
