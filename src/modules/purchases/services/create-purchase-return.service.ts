import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PurchaseStatus } from '@/lib/prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreatePurchaseReturnDto } from '../dto/requests/create-purchase-return.dto';
import { PurchaseReturnResponseDto } from '../dto/responses/purchase-return-response.dto';

@Injectable()
export class CreatePurchaseReturnService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        createPurchaseReturnDto: CreatePurchaseReturnDto,
    ): Promise<PurchaseReturnResponseDto> {
        const { purchaseId, reason, items } = createPurchaseReturnDto;

        /*
         * Validate items
         */
        if (!items.length) {
            throw new BadRequestException('At least one return item is required');
        }

        /*
         * Prevent duplicate purchase items
         */
        const purchaseItemIds = items.map((item) => item.purchaseItemId);

        const uniquePurchaseItemIds = new Set(purchaseItemIds);

        if (uniquePurchaseItemIds.size !== purchaseItemIds.length) {
            throw new BadRequestException('Duplicate purchase items are not allowed');
        }

        /*
         * Get purchase with items
         */
        const purchase = await this.prisma.purchase.findUnique({
            where: {
                id: purchaseId,
            },

            include: {
                purchaseItems: {
                    include: {
                        returnItems: {
                            include: {
                                purchaseReturn: {
                                    select: {
                                        status: true,
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

        /*
         * Only received purchases can be returned
         */
        if (purchase.status !== PurchaseStatus.RECEIVED) {
            throw new BadRequestException('Only received purchases can be returned');
        }

        /*
         * Create map for purchase items
         */
        const purchaseItemMap = new Map(
            purchase.purchaseItems.map((item) => [item.id, item]),
        );

        /*
         * Validate return items
         */
        for (const returnItem of items) {
            const purchaseItem = purchaseItemMap.get(returnItem.purchaseItemId);

            /*
             * Purchase item must belong to purchase
             */
            if (!purchaseItem) {
                throw new BadRequestException(
                    'One or more purchase items do not belong to this purchase',
                );
            }

            /*
             * Calculate previously returned quantity
             *
             * Only approved returns should reduce
             * available return quantity.
             *
             * Depending on your PurchaseReturnStatus enum,
             * change APPROVED if needed.
             */
            const returnedQuantity = purchaseItem.returnItems.reduce(
                (total, returnRecord) => {
                    if (returnRecord.purchaseReturn.status === 'APPROVED') {
                        return total + returnRecord.quantity;
                    }

                    return total;
                },
                0,
            );

            const availableQuantity = purchaseItem.quantity - returnedQuantity;

            if (returnItem.quantity > availableQuantity) {
                throw new BadRequestException(
                    `Return quantity exceeds available quantity for purchase item ${purchaseItem.id}`,
                );
            }
        }

        /*
         * Generate return number
         */
        const returnNo = await this.generateReturnNo();

        /*
         * Create purchase return
         */
        const purchaseReturn = await this.prisma.purchaseReturn.create({
            data: {
                returnNo,
                reason: reason ?? null,
                purchaseId,
                createdById: userId,

                items: {
                    create: items.map((item) => ({
                        quantity: item.quantity,

                        reason: item.reason ?? null,

                        purchaseItemId: item.purchaseItemId,
                    })),
                },
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
                                variant: {
                                    select: {
                                        id: true,
                                        sku: true,
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
                    variant: item.purchaseItem.variant,
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

    /*
     * Generate purchase return number
     *
     * Example:
     *
     * PRET-20260913-0001
     */
    private async generateReturnNo(): Promise<string> {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        const prefix = `PRET-${date}`;

        const latestReturn = await this.prisma.purchaseReturn.findFirst({
            where: {
                returnNo: {
                    startsWith: prefix,
                },
            },

            orderBy: {
                returnNo: 'desc',
            },

            select: {
                returnNo: true,
            },
        });

        let sequence = 1;

        if (latestReturn) {
            const parts = latestReturn.returnNo.split('-');

            sequence = Number(parts[parts.length - 1]) + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }
}
