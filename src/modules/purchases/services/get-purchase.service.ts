import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto';

@Injectable()
export class GetPurchaseService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(purchaseId: string): Promise<PurchaseResponseDto> {
        const purchase = await this.prisma.purchase.findFirst({
            where: {
                id: purchaseId,
            },

            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
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

                purchaseItems: {
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

        if (!purchase) {
            throw new NotFoundException('Purchase not found');
        }

        return {
            id: purchase.id,
            invoiceNo: purchase.invoiceNo,
            subtotal: purchase.subtotal.toString(),
            discount: purchase.discount.toString(),
            tax: purchase.tax.toString(),
            total: purchase.total.toString(),
            status: purchase.status,
            supplier: purchase.supplier,
            warehouse: purchase.warehouse,
            user: purchase.user,

            items: purchase.purchaseItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toString(),

                subtotal: item.subtotal.toString(),
                
                variantId: item.variantId,
                variant: item.variant,

                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),

            createdAt: purchase.createdAt,
            updatedAt: purchase.updatedAt,
        };
    }
}
