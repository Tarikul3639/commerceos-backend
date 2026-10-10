import { Prisma } from '@/lib/prisma/client';

import { ProductQueryDto } from '../dto/requests/product-query.dto';

export function buildAdminProductWhere(
    query: ProductQueryDto,
): Prisma.ProductWhereInput {
    return {
        deletedAt: null,

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
    };
}
