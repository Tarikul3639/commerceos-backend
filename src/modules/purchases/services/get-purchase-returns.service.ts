import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { PurchaseReturnQueryDto } from '../dto/requests/purchase-return-query.dto';
import { PurchaseReturnResponseDto } from '../dto/responses/purchase-return-response.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetPurchaseReturnsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: PurchaseReturnQueryDto,
    ): Promise<PaginatedResponse<PurchaseReturnResponseDto>> {
        const { page = '1', limit = '10', status, purchaseId } = query;

        const currentPage = Math.max(Number(page), 1);
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const where: Prisma.PurchaseReturnWhereInput = {
            ...(status && { status }),
            ...(purchaseId && { purchaseId }),
        };

        const [purchaseReturns, total] = await Promise.all([
            this.prisma.purchaseReturn.findMany({
                where,
                skip: (currentPage - 1) * pageSize,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    purchase: {
                        select: {
                            id: true,
                            invoiceNo: true,
                            supplier: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    items: {
                        include: {
                            purchaseItem: {
                                select: {
                                    id: true,
                                    quantity: true,
                                    unitPrice: true,
                                    subtotal: true,
                                    variantId: true,
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
            }),
            this.prisma.purchaseReturn.count({ where }),
        ]);

        return {
            data: purchaseReturns.map((purchaseReturn) => ({
                id: purchaseReturn.id,
                returnNo: purchaseReturn.returnNo,
                status: purchaseReturn.status,
                reason: purchaseReturn.reason,
                purchase: purchaseReturn.purchase,
                items: purchaseReturn.items.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    reason: item.reason,
                    purchaseItemId: item.purchaseItemId,
                    purchaseItem: {
                        id: item.purchaseItem.id,
                        quantity: item.purchaseItem.quantity,
                        unitPrice: item.purchaseItem.unitPrice.toString(),
                        subtotal: item.purchaseItem.subtotal.toString(),
                        variantId: item.purchaseItem.variantId,
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