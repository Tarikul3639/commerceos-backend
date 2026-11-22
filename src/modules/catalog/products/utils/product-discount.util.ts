export function parseProductDiscountDate(
  value: string | Date | null | undefined,
  endOfDay = false,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;

  const dateOnly =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (dateOnly && endOfDay) {
    return new Date(`${value}T23:59:59.999Z`);
  }

  return new Date(value);
}
