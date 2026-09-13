import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CreateOrderReturnDto } from '../dto/requests/create-order-return.dto';
import { OrderReturnResponseDto } from '../dto/responses/order-return-response.dto';

import {
    generateDocumentNumber,
    getDocumentPrefix,
} from '../../../common/utils/document-number.util';

@Injectable()
export class CreateOrderReturnService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        orderId: string,
        createOrderReturnDto: CreateOrderReturnDto,
        userId: string,
    ): Promise<OrderReturnResponseDto> {
        const { reason, items } = createOrderReturnDto;

        const order = await this.prisma.order.findUnique({
            where: {
                id: orderId,
            },

            include: {
                orderItems: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const orderItemIds = items.map((item) => item.orderItemId);

        const uniqueOrderItemIds = [...new Set(orderItemIds)];

        if (uniqueOrderItemIds.length !== orderItemIds.length) {
            throw new BadRequestException('Duplicate order items are not allowed');
        }

        const orderItemsMap = new Map(
            order.orderItems.map((item) => [item.id, item]),
        );

        for (const item of items) {
            const orderItem = orderItemsMap.get(item.orderItemId);

            if (!orderItem) {
                throw new BadRequestException(
                    'Order item does not belong to this order',
                );
            }

            if (item.quantity > orderItem.quantity) {
                throw new BadRequestException(
                    'Return quantity cannot exceed ordered quantity',
                );
            }
        }

        return this.prisma.$transaction(async (tx) => {
            const prefix = getDocumentPrefix('OR');
            const returnNo = generateDocumentNumber(prefix, 1);

            const orderReturn = await tx.orderReturn.create({
                data: {
                    returnNo,
                    ...(reason !== undefined && {
                        reason,
                    }),
                    orderId,
                    createdById: userId,

                    items: {
                        create: items.map((item) => ({
                            orderItemId: item.orderItemId,
                            quantity: item.quantity,
                            ...(item.reason !== undefined && {
                                reason: item.reason,
                            }),
                            /*
                             * Connect OrderItem
                             */
                            orderItem: {
                                connect: {
                                    id: item.orderItemId,
                                },
                            },
                        })),
                    },
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
        });
    }
}
