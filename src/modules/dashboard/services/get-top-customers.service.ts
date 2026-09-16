import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { TopCustomersResponseDto } from '../dto/responses/top-customers-response.dto';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util';
import { getCreatedAtFilter } from '../utils/dashboard-where.util';

@Injectable()
export class GetTopCustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: DashboardQueryDto): Promise<TopCustomersResponseDto> {
        /**
         * Get the selected dashboard date range.
         */
        const { startDate, endDate } = getDashboardDateRange(query);

        /**
         * Build the order filter using
         * the selected date range.
         */
        const where: Prisma.OrderWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        /**
         * Get orders created within the selected period.
         *
         * Only the fields required for calculating
         * top customers are selected.
         */
        const orders = await this.prisma.order.findMany({
            where,
            select: {
                customerId: true,
                total: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        /**
         * Group orders by customer.
         *
         * Each customer keeps:
         * - Customer information
         * - Total number of orders
         * - Total amount spent
         */
        const grouped = new Map<
            string,
            {
                customerId: string;
                customerName: string;
                customerEmail: string;
                customerPhone: string | null;
                totalOrders: number;
                totalSpent: number;
            }
        >();

        /**
         * Process each order and aggregate
         * order count and spending by customer.
         */
        for (const order of orders) {
            /**
             * Get existing customer data,
             * or create a new entry.
             */
            const current = grouped.get(order.customerId) ?? {
                customerId: order.customer.id,
                customerName: order.customer.name,
                customerEmail: order.customer.email,
                customerPhone: order.customer.phone,
                totalOrders: 0,
                totalSpent: 0,
            };

            /**
             * Increment the customer's
             * total order count.
             */
            current.totalOrders++;

            /**
             * Add the order total to the
             * customer's total spending.
             */
            current.totalSpent += Number(order.total);

            /**
             * Save the updated customer data
             * back into the Map.
             */
            grouped.set(order.customerId, current);
        }

        /**
         * Sort customers by total spending
         * in descending order and keep
         * only the top 10 customers.
         */
        const data = Array.from(grouped.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10)
            .map((item) => ({
                ...item,
                totalSpent: item.totalSpent.toString(),
            }));

        /**
         * Return the top customers response.
         */
        return {
            data,
        };
    }
}
