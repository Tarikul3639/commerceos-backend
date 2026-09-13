import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { PurchaseQueryDto } from '../dto/requests/purchase-query.dto';
import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetPurchasesService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: PurchaseQueryDto,
    ): Promise<PaginatedResponse<PurchaseResponseDto>> {
        const {
            page = '1',
            limit = '10',
            search,
            status,
            supplierId,
            warehouseId,
        } = query;

        const currentPage = Math.max(Number(page), 1);
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const where: Prisma.PurchaseWhereInput = {
            ...(status && { status }),
            ...(supplierId && { supplierId }),
            ...(warehouseId && { warehouseId }),
            ...(search && {
                OR: [
                    {
                        invoiceNo: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },
                    {
                        supplier: {
                            name: {
                                contains: search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }),
        };

        const [purchases, total] = await Promise.all([
            this.prisma.purchase.findMany({
                where,
                skip: (currentPage - 1) * pageSize,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    supplier: {
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
                    purchaseItems: {
                        select: {
                            id: true,
                            quantity: true,
                            unitPrice: true,
                            subtotal: true,
                            variantId: true,
                            createdAt: true,
                            updatedAt: true,
                            variant: {
                                select: {
                                    id: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.purchase.count({ where }),
        ]);

        return {
            data: purchases.map((purchase) => ({
                id: purchase.id,
                invoiceNo: purchase.invoiceNo,
                subtotal: purchase.subtotal.toString(),
                discount: purchase.discount.toString(),
                tax: purchase.tax.toString(),
                total: purchase.total.toString(),
                status: purchase.status,
                supplier: {
                    id: purchase.supplier.id,
                    name: purchase.supplier.name,
                },
                warehouse: {
                    id: purchase.warehouse.id,
                    name: purchase.warehouse.name,
                },
                user: {
                    id: purchase.user.id,
                    name: purchase.user.name,
                    email: purchase.user.email,
                },
                items: purchase.purchaseItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice.toString(),
                    subtotal: item.subtotal.toString(),
                    variantId: item.variantId,
                    variant: {
                        id: item.variant.id,
                        sku: item.variant.sku,
                    },
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })),
                createdAt: purchase.createdAt,
                updatedAt: purchase.updatedAt,
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