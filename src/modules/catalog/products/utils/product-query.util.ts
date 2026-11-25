import { Prisma } from '../../../../infrastructure/database/generated/prisma/client.js';

import { ProductQueryDto } from '../dto/requests/product-query.dto.js';

export function buildAdminProductWhere(
  query: ProductQueryDto,
): Prisma.ProductWhereInput {
  return {
    // deletedAt: null,

    ...(query.search && {
      name: {
        contains: query.search,
        mode: 'insensitive',
      },
    }),

    ...(query.categoryId && {
      categoryId: query.categoryId,
    }),

    ...(query.brandId && {
      brandId: query.brandId,
    }),

    ...(query.status && {
      status: query.status,
    }),
  };
}

export function buildStoreProductWhere(
  query: ProductQueryDto,
): Prisma.ProductWhereInput {
  return {
    deletedAt: null,
    status: 'PUBLISHED',

    ...(query.search?.trim() && {
      name: {
        contains: query.search.trim(),
        mode: 'insensitive',
      },
    }),

    ...(query.categoryId && {
      categoryId: query.categoryId,
    }),

    ...(query.brandId && {
      brandId: query.brandId,
    }),

    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      sellingPrice: {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      },
    }),

    ...(query.inStock && {
      variants: {
        some: {
          stock: {
            gt: 0,
          },
        },
      },
    }),

    ...(query.isFeatured !== undefined && {
      isFeatured: query.isFeatured,
    }),
  };
}
