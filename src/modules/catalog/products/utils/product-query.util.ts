export type ProductQueryFilter = {
  search?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  status?: string | undefined;
  page: number;
  limit: number;
};

export function normalizeProductQuery(query: Record<string, any>): ProductQueryFilter {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  const normalized: ProductQueryFilter = {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
  };

  const search = typeof query.search === 'string' ? query.search.trim() || undefined : undefined;
  const categoryId = typeof query.categoryId === 'string' ? query.categoryId : undefined;
  const brandId = typeof query.brandId === 'string' ? query.brandId : undefined;
  const status = typeof query.status === 'string' ? query.status : undefined;

  if (search !== undefined) normalized.search = search;
  if (categoryId !== undefined) normalized.categoryId = categoryId;
  if (brandId !== undefined) normalized.brandId = brandId;
  if (status !== undefined) normalized.status = status;

  return normalized;
}
