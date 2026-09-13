import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreatePurchaseDto } from '../dto/requests/create-purchase.dto';
import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto';

import {
    generateDocumentNumber,
    getDocumentPrefix,
} from '../../../common/utils/document-number.util';

@Injectable()
export class CreatePurchaseService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        createPurchaseDto: CreatePurchaseDto,
    ): Promise<PurchaseResponseDto> {
        const {
            supplierId,
            warehouseId,
            items,
            discount = '0',
            tax = '0',
        } = createPurchaseDto;

        /*
         * Validate items
         */
        if (!items.length) {
            throw new BadRequestException('At least one purchase item is required');
        }

        /*
         * Prevent duplicate variants
         */
        const variantIds = items.map((item) => item.variantId);

        const uniqueVariantIds = new Set(variantIds);

        if (uniqueVariantIds.size !== variantIds.length) {
            throw new BadRequestException(
                'Duplicate product variants are not allowed',
            );
        }

        /*
         * Validate supplier
         */
        const supplier = await this.prisma.supplier.findFirst({
            where: {
                id: supplierId,
                deletedAt: null,
                isActive: true,
            },

            select: {
                id: true,
            },
        });

        if (!supplier) {
            throw new NotFoundException('Supplier not found or inactive');
        }

        /*
         * Validate warehouse
         */
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,
                deletedAt: null,
                isActive: true,
            },

            select: {
                id: true,
            },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found or inactive');
        }

        /*
         * Validate product variants
         */
        const variants = await this.prisma.productVariant.findMany({
            where: {
                id: {
                    in: variantIds,
                },

                isActive: true,

                product: {
                    deletedAt: null,
                    isActive: true,
                },
            },

            select: {
                id: true,
            },
        });

        if (variants.length !== variantIds.length) {
            throw new BadRequestException(
                'One or more product variants are invalid or inactive',
            );
        }

        /*
         * Calculate subtotal
         */
        const subtotal = items.reduce((total, item) => {
            return total + item.quantity * Number(item.unitPrice);
        }, 0);

        const discountAmount = Number(discount);

        const taxAmount = Number(tax);

        /*
         * Validate discount
         */
        if (discountAmount > subtotal) {
            throw new BadRequestException('Discount cannot exceed subtotal');
        }

        /*
         * Calculate total
         */
        const total = subtotal - discountAmount + taxAmount;

        /*
         * Generate invoice number
         *
         * Example:
         * PUR-20260913-0001
         */
        const invoiceNo = await this.generateInvoiceNo();

        /*
         * Create purchase
         */
        const purchase = await this.prisma.purchase.create({
            data: {
                invoiceNo,
                subtotal,
                discount: discountAmount,
                tax: taxAmount,
                total,
                supplierId,
                warehouseId,
                userId,

                purchaseItems: {
                    create: items.map((item) => {
                        const itemSubtotal = item.quantity * Number(item.unitPrice);

                        return {
                            quantity: item.quantity,
                            unitPrice: Number(item.unitPrice),
                            subtotal: itemSubtotal,
                            variantId: item.variantId,
                        };
                    }),
                },
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
        });

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

    /*
     * Generate purchase invoice number
     */
    private async generateInvoiceNo(): Promise<string> {
        const prefix = getDocumentPrefix('PUR');

        const latestPurchase = await this.prisma.purchase.findFirst({
            where: {
                invoiceNo: {
                    startsWith: prefix,
                },
            },

            orderBy: {
                invoiceNo: 'desc',
            },

            select: {
                invoiceNo: true,
            },
        });

        let sequence = 1;

        if (latestPurchase) {
            const parts = latestPurchase.invoiceNo.split('-');

            const lastSequence = Number(parts[parts.length - 1]);

            sequence = lastSequence + 1;
        }

        return generateDocumentNumber(prefix, sequence);
    }
}
