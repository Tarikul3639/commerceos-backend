import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { PurchaseReturnResponseDto } from '../dto/responses/purchase-return-response.dto';

@Injectable()
export class GetPurchaseReturnService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(purchaseReturnId: string): Promise<PurchaseReturnResponseDto> {
        const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
            where: {
                id: purchaseReturnId,
            },

            include: {
                purchase: {
                    select: {
                        id: true,
                        invoiceNo: true,
                    },
                },

                items: {
                    include: {
                        purchaseItem: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        sku: true,
                                        name: true,
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

        if (!purchaseReturn) {
            throw new NotFoundException('Purchase return not found');
        }

        return {
            id: purchaseReturn.id,
            returnNo: purchaseReturn.returnNo,
            status: purchaseReturn.status,
            reason: purchaseReturn.reason,
            purchase: purchaseReturn.purchase,

            items: purchaseReturn.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                reason: item.reason,

                purchaseItem: {
                    id: item.purchaseItem.id,
                    quantity: item.purchaseItem.quantity,
                    unitPrice: item.purchaseItem.unitPrice.toString(),
                    productId: item.purchaseItem.productId,
                    product: item.purchaseItem.product,
                },

                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),

            createdBy: purchaseReturn.createdBy,
            approvedBy: purchaseReturn.approvedBy,
            approvedAt: purchaseReturn.approvedAt,

            createdAt: purchaseReturn.createdAt,
            updatedAt: purchaseReturn.updatedAt,
        };
    }
}
