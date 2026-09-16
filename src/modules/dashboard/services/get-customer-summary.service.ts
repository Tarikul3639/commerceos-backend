import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { CustomerSummaryResponseDto } from '../dto/responses/customer-summary-response.dto';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util';
import { getCreatedAtFilter } from '../utils/dashboard-where.util';

@Injectable()
export class GetCustomerSummaryService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: DashboardQueryDto): Promise<CustomerSummaryResponseDto> {
        /**
         * Get the selected dashboard date range.
         */
        const { startDate, endDate } = getDashboardDateRange(query);

        /**
         * Build a reusable createdAt filter
         * for the selected period.
         */
        const createdAt = getCreatedAtFilter(startDate, endDate);

        /**
         * Build the common customer filter.
         */
        const where: Prisma.CustomerWhereInput = {
            createdAt,
        };

        /**
         * Get customer statistics in parallel.
         */
        const [totalCustomers, newCustomers, activeCustomers, returnedOrders] =
            await Promise.all([
                /**
                 * Count all customers.
                 */
                this.prisma.customer.count(),

                /**
                 * Count customers created
                 * within the selected period.
                 */
                this.prisma.customer.count({
                    where,
                }),

                /**
                 * Count active customers created
                 * within the selected period.
                 */
                this.prisma.customer.count({
                    where: {
                        ...where,
                        status: 'ACTIVE',
                    },
                }),

                /**
                 * Get returned orders within
                 * the selected period.
                 *
                 * OrderReturn does not have a direct customerId.
                 * So we access the customer through:
                 *
                 * OrderReturn -> Order -> Customer
                 */
                this.prisma.orderReturn.findMany({
                    where: {
                        createdAt: getCreatedAtFilter(startDate, endDate),
                    },
                    select: {
                        order: {
                            select: {
                                customerId: true,
                            },
                        },
                    },
                    /**
                     * Prevent duplicate return records
                     * for the same order.
                     */
                    distinct: ['orderId'],
                }),
            ]);

        /**
         * Calculate the number of unique customers
         * whose orders were returned.
         *
         * map() extracts customer IDs.
         * Set() removes duplicate customer IDs.
         * size returns the unique customer count.
         */
        const returningCustomers = new Set(
            returnedOrders.map(({ order }) => order.customerId),
        ).size;

        /**
         * Calculate the previous period using
         * the same duration as the current period.
         */
        const periodLength = endDate.getTime() - startDate.getTime();

        const previousStartDate = new Date(startDate.getTime() - periodLength);

        const previousEndDate = new Date(startDate);

        /**
         * Count customers created during
         * the previous period.
         */
        const previousCustomers = await this.prisma.customer.count({
            where: {
                createdAt: getCreatedAtFilter(previousStartDate, previousEndDate),
            },
        });

        /**
         * Calculate customer growth percentage.
         *
         * Formula:
         *
         * ((current - previous) / previous) * 100
         *
         * If there are no customers in the previous period,
         * return 0 to avoid division by zero.
         */
        const customerGrowth = Number(
            (previousCustomers > 0
                ? ((newCustomers - previousCustomers) / previousCustomers) * 100
                : 0
            ).toFixed(2),
        );

        /**
         * Return the customer dashboard summary.
         */
        return {
            totalCustomers,
            newCustomers,
            activeCustomers,
            returningCustomers,
            customerGrowth,
        };
    }
}
