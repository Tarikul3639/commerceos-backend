import {
    Injectable,
} from '@nestjs/common';

import {
    Prisma,
} from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { OrderReturnQueryDto } from '../dto/requests/order-return-query.dto';
import { OrderReturnResponseDto } from '../dto/responses/order-return-response.dto';

import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetOrderReturnsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(
        query: OrderReturnQueryDto,
    ): Promise<
        PaginatedResponse<OrderReturnResponseDto>
    > {
        const {
            page = '1',
            limit = '10',

            status,

            orderId,

            createdById,

            approvedById,
        } = query;

        const currentPage =
            Math.max(
                Number(page),
                1,
            );

        const pageSize =
            Math.min(
                Math.max(
                    Number(limit),
                    1,
                ),
                100,
            );

        const where:
            Prisma.OrderReturnWhereInput = {
                ...(status && {
                    status,
                }),

                ...(orderId && {
                    orderId,
                }),

                ...(createdById && {
                    createdById,
                }),

                ...(approvedById && {
                    approvedById,
                }),
            };

        const [
            orderReturns,
            total,
        ] =
            await Promise.all([
                this.prisma.orderReturn.findMany({
                    where,

                    skip:
                        (currentPage - 1) *
                        pageSize,

                    take:
                        pageSize,

                    orderBy: {
                        createdAt:
                            'desc',
                    },

                    include: {
                        order: {
                            select: {
                                id: true,

                                invoiceNo:
                                    true,

                                customer: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },

                        items: {
                            include: {
                                orderItem: {
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
                        },

                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },

                        approvedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                }),

                this.prisma.orderReturn.count({
                    where,
                }),
            ]);

        return {
            data:
                orderReturns.map(
                    (orderReturn) => ({
                        id:
                            orderReturn.id,

                        returnNo:
                            orderReturn.returnNo,

                        status:
                            orderReturn.status,

                        reason:
                            orderReturn.reason,

                        order:
                            orderReturn.order,

                        items:
                            orderReturn.items.map(
                                (item) => ({
                                    id:
                                        item.id,

                                    quantity:
                                        item.quantity,

                                    reason:
                                        item.reason,

                                    orderItemId:
                                        item.orderItemId,

                                    orderItem:
                                        item.orderItem,

                                    createdAt:
                                        item.createdAt,

                                    updatedAt:
                                        item.updatedAt,
                                }),
                            ),

                        createdBy:
                            orderReturn.createdBy,

                        approvedBy:
                            orderReturn.approvedBy,

                        approvedAt:
                            orderReturn.approvedAt,

                        createdAt:
                            orderReturn.createdAt,

                        updatedAt:
                            orderReturn.updatedAt,
                    }),
                ),

            meta: {
                total,

                page:
                    currentPage,

                limit:
                    pageSize,

                totalPages:
                    Math.ceil(
                        total /
                        pageSize,
                    ),

                hasNextPage:
                    currentPage *
                        pageSize <
                    total,

                hasPreviousPage:
                    currentPage >
                    1,
            },
        };
    }
}