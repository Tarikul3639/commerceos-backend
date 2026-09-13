import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { OrderReturnResponseDto } from '../dto/responses/order-return-response.dto';

@Injectable()
export class GetOrderReturnService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(returnId: string): Promise<OrderReturnResponseDto> {
        const orderReturn = await this.prisma.orderReturn.findUnique({
            where: {
                id: returnId,
            },

            include: {
                order: {
                    select: {
                        id: true,

                        invoiceNo: true,

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
        });

        if (!orderReturn) {
            throw new NotFoundException('Order return not found');
        }

        return {
            id: orderReturn.id,
            returnNo: orderReturn.returnNo,
            status: orderReturn.status,
            reason: orderReturn.reason,
            order: orderReturn.order,

            items: orderReturn.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                reason: item.reason,
                orderItemId: item.orderItemId,
                orderItem: item.orderItem,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),

            createdBy: orderReturn.createdBy,
            approvedBy: orderReturn.approvedBy,
            approvedAt: orderReturn.approvedAt,
            createdAt: orderReturn.createdAt,
            updatedAt: orderReturn.updatedAt,
        };
    }
}
