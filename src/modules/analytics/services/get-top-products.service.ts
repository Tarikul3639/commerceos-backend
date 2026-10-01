import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AnalyticsQueryDto } from '../dto/requests/analytics-query.dto';
import { TopProductItemDto } from '../dto/responses/top-products-response.dto';
import { getAnalyticsDateRange } from '../utils/analytics-date-range.util';
import { getCreatedAtFilter } from '../utils/analytics-where.util';

/*
 * SERVICE: GetTopProductsService
 */

@Injectable()
export class GetTopProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: AnalyticsQueryDto): Promise<TopProductItemDto[]> {
        /*
         * Calculate date range filter
         */
        const { startDate, endDate } = getAnalyticsDateRange(query);
        const orderWhere: Prisma.OrderWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        /*
         * Fetch order items with product details
         */
        const items = await this.prisma.orderItem.findMany({
            where: { order: orderWhere },
            select: {
                quantity: true,
                subtotal: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: {
                            orderBy: { sortOrder: 'asc' },
                            take: 1,
                        },
                    },
                },
            },
        });

        /*
         * Aggregate quantity and revenue by product
         */
        const grouped = new Map<string, TopProductItemDto>();

        for (const item of items) {
            const current = grouped.get(item.product.id) ?? {
                productId: item.product.id,
                productName: item.product.name,
                productImage: item.product.images[0]?.imageUrl ?? null,
                totalSold: 0,
                totalRevenue: '0',
            };

            current.totalSold += item.quantity;
            current.totalRevenue = (
                Number(current.totalRevenue) + Number(item.subtotal)
            ).toString();

            grouped.set(item.product.id, current);
        }

        /*
         * Sort by total items sold and return top 10
         */
        return [...grouped.values()]
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 10);
    }
}