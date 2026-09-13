import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { OrderQueryDto } from '../dto/requests/order-query.dto';
import { OrderResponseDto } from '../dto/responses/order-response.dto';

import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetOrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: OrderQueryDto,
    ): Promise<PaginatedResponse<OrderResponseDto>> {
        const {
            page = '1',
            limit = '10',

            search,
            status,
            paymentStatus,

            customerId,
            warehouseId,
            userId,
        } = query;

        const currentPage = Math.max(Number(page), 1);

        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const where: Prisma.OrderWhereInput = {
            ...(status && {
                status,
            }),

            ...(paymentStatus && {
                paymentStatus,
            }),

            ...(customerId && {
                customerId,
            }),

            ...(warehouseId && {
                warehouseId,
            }),

            ...(userId && {
                userId,
            }),

            ...(search && {
                OR: [
                    {
                        invoiceNo: {
                            contains: search.trim(),

                            mode: 'insensitive',
                        },
                    },

                    {
                        customer: {
                            name: {
                                contains: search.trim(),

                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }),
        };

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,

                skip: (currentPage - 1) * pageSize,

                take: pageSize,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },

                    orderItems: {
                        include: {
                            variant: {
                                select: {
                                    id: true,
                                    sku: true,

                                    product: {
                                        select: {
                                            id: true,
                                            name: true,
                                            slug: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),

            this.prisma.order.count({
                where,
            }),
        ]);

        return {
            data: orders.map((order) => ({
                id: order.id,
                invoiceNo: order.invoiceNo,
                subtotal: order.subtotal.toString(),
                discount: order.discount.toString(),
                tax: order.tax.toString(),
                total: order.total.toString(),
                paymentStatus: order.paymentStatus,
                status: order.status,
                customer: order.customer,
                warehouse: order.warehouse,
                user: order.user,

                items: order.orderItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,

                    unitPrice: item.unitPrice.toString(),
                    subtotal: item.subtotal.toString(),

                    variantId: item.variantId,
                    variant: item.variant,

                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })),

                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            })),

            meta: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasNextPage: currentPage * pageSize < total,
                hasPreviousPage: currentPage > 1,
            },
        };
    }
}
