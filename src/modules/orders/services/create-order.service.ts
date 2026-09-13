import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CreateOrderDto } from '../dto/requests/create-order.dto';
import { OrderResponseDto } from '../dto/responses/order-response.dto';

import {
    generateDocumentNumber,
    getDocumentPrefix,
} from '../../../common/utils/document-number.util';

@Injectable()
export class CreateOrderService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        createOrderDto: CreateOrderDto,

        userId: string,
    ): Promise<OrderResponseDto> {
        const {
            customerId,
            warehouseId,
            discount = '0',
            tax = '0',
            items,
        } = createOrderDto;

        const customer = await this.prisma.customer.findFirst({
            where: {
                id: customerId,

                deletedAt: null,
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,

                deletedAt: null,

                isActive: true,
            },
        });

        if (!warehouse) {
            throw new NotFoundException('Active warehouse not found');
        }

        const variantIds = items.map((item) => item.variantId);

        const uniqueVariantIds = [...new Set(variantIds)];

        if (uniqueVariantIds.length !== variantIds.length) {
            throw new BadRequestException(
                'Duplicate product variants are not allowed',
            );
        }

        return this.prisma.$transaction(async (tx) => {
            const variants = await tx.productVariant.findMany({
                where: {
                    id: {
                        in: variantIds,
                    },
                },

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
            });

            if (variants.length !== uniqueVariantIds.length) {
                throw new BadRequestException('One or more product variants not found');
            }

            let subtotal = new Prisma.Decimal(0);

            const orderItems = items.map((item) => {
                const itemSubtotal = new Prisma.Decimal(item.unitPrice).mul(
                    item.quantity,
                );

                subtotal = subtotal.plus(itemSubtotal);

                return {
                    variantId: item.variantId,

                    quantity: item.quantity,

                    unitPrice: new Prisma.Decimal(item.unitPrice),

                    subtotal: itemSubtotal,
                };
            });

            const finalDiscount = new Prisma.Decimal(discount);

            const finalTax = new Prisma.Decimal(tax);

            const total = subtotal.minus(finalDiscount).plus(finalTax);

            if (total.lessThan(0)) {
                throw new BadRequestException('Order total cannot be negative');
            }

            const prefix = getDocumentPrefix('ORD');

            const invoiceNo = generateDocumentNumber(prefix, 1);

            // ORD-20260914-0001

            const order = await tx.order.create({
                data: {
                    invoiceNo,
                    subtotal,
                    discount: finalDiscount,
                    tax: finalTax,
                    total,
                    customerId,
                    warehouseId,
                    userId,

                    orderItems: {
                        create: orderItems,
                    },
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
            });

            return {
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
            };
        });
    }
}
