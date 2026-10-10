export function buildVariantTitle(value: string[] = []): string {
  return value.filter(Boolean).join(' / ');
}

export function buildVariantSku(base: string, values: string[] = []): string {
  const suffix = values.filter(Boolean).join('-').toUpperCase();
  return suffix ? `${base}-${suffix}` : base;
}
