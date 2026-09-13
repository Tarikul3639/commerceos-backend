import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { Prisma, PurchaseStatus } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdatePurchaseDto } from '../dto/requests/update-purchase.dto';
import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto';

@Injectable()
export class UpdatePurchaseService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        purchaseId: string,
        updatePurchaseDto: UpdatePurchaseDto,
    ): Promise<PurchaseResponseDto> {
        const { supplierId, warehouseId, discount, tax, items } = updatePurchaseDto;

        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch target purchase inside transaction
            const purchase = await tx.purchase.findUnique({
                where: { id: purchaseId },
            });

            if (!purchase) {
                throw new NotFoundException('Purchase not found');
            }

            if (purchase.status !== PurchaseStatus.PENDING) {
                throw new BadRequestException('Only pending purchases can be updated');
            }

            // 2. Validate Supplier if provided
            if (supplierId !== undefined) {
                const supplier = await tx.supplier.findFirst({
                    where: {
                        id: supplierId,
                        deletedAt: null,
                        isActive: true,
                    },
                });

                if (!supplier) {
                    throw new NotFoundException('Active supplier not found');
                }
            }

            // 3. Validate Warehouse if provided
            if (warehouseId !== undefined) {
                const warehouse = await tx.warehouse.findFirst({
                    where: {
                        id: warehouseId,
                        deletedAt: null,
                        isActive: true,
                    },
                });

                if (!warehouse) {
                    throw new NotFoundException('Active warehouse not found');
                }
            }

            // 4. Handle items calculation & validation
            let subtotal = purchase.subtotal;
            let validatedItems: Array<{
                variantId: string;
                quantity: number;
                unitPrice: string;
            }> = [];

            if (items !== undefined) {
                if (items.length === 0) {
                    throw new BadRequestException('Purchase must contain at least one item');
                }

                // Validate individual item structures
                for (const item of items) {
                    if (
                        item.variantId === undefined ||
                        item.quantity === undefined ||
                        item.unitPrice === undefined
                    ) {
                        throw new BadRequestException(
                            'Variant ID, quantity, and unit price are required for all items',
                        );
                    }
                }

                validatedItems = items.map((item) => ({
                    variantId: item.variantId as string,
                    quantity: item.quantity as number,
                    unitPrice: item.unitPrice as string,
                }));

                const variantIds = validatedItems.map((i) => i.variantId);

                // Check duplicates
                if (new Set(variantIds).size !== variantIds.length) {
                    throw new BadRequestException('Duplicate product variants are not allowed');
                }

                // Verify active variants exist
                const variants = await tx.productVariant.findMany({
                    where: { id: { in: variantIds } },
                    select: { id: true },
                });

                if (variants.length !== variantIds.length) {
                    throw new BadRequestException('One or more product variants not found');
                }

                // Calculate new subtotal
                subtotal = validatedItems.reduce((acc, item) => {
                    const itemSubtotal = new Prisma.Decimal(item.unitPrice).mul(item.quantity);
                    return acc.plus(itemSubtotal);
                }, new Prisma.Decimal(0));
            }

            // 5. Financial calculations
            const finalDiscount =
                discount !== undefined ? new Prisma.Decimal(discount) : purchase.discount;
            const finalTax =
                tax !== undefined ? new Prisma.Decimal(tax) : purchase.tax;

            const total = subtotal.minus(finalDiscount).plus(finalTax);

            if (total.lessThan(0)) {
                throw new BadRequestException('Purchase total cannot be negative');
            }

            // 6. Delete old items if payload contains new items
            if (items !== undefined) {
                await tx.purchaseItem.deleteMany({
                    where: { purchaseId },
                });
            }

            // 7. Update purchase record
            const updatedPurchase = await tx.purchase.update({
                where: { id: purchaseId },
                data: {
                    subtotal,
                    discount: finalDiscount,
                    tax: finalTax,
                    total,
                    ...(supplierId && { supplier: { connect: { id: supplierId } } }),
                    ...(warehouseId && { warehouse: { connect: { id: warehouseId } } }),
                    ...(items !== undefined && {
                        purchaseItems: {
                            create: validatedItems.map((item) => ({
                                variant: { connect: { id: item.variantId } },
                                quantity: item.quantity,
                                unitPrice: new Prisma.Decimal(item.unitPrice),
                                subtotal: new Prisma.Decimal(item.unitPrice).mul(item.quantity),
                            })),
                        },
                    }),
                },
                include: {
                    supplier: { select: { id: true, name: true } },
                    warehouse: { select: { id: true, name: true } },
                    user: { select: { id: true, name: true, email: true } },
                    purchaseItems: {
                        include: {
                            variant: { select: { id: true, sku: true } },
                        },
                    },
                },
            });

            // 8. Return formatted response
            return {
                id: updatedPurchase.id,
                invoiceNo: updatedPurchase.invoiceNo,
                subtotal: updatedPurchase.subtotal.toString(),
                discount: updatedPurchase.discount.toString(),
                tax: updatedPurchase.tax.toString(),
                total: updatedPurchase.total.toString(),
                status: updatedPurchase.status,
                supplier: updatedPurchase.supplier,
                warehouse: updatedPurchase.warehouse,
                user: updatedPurchase.user,
                items: updatedPurchase.purchaseItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice.toString(),
                    subtotal: item.subtotal.toString(),
                    variantId: item.variantId,
                    variant: item.variant,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })),
                createdAt: updatedPurchase.createdAt,
                updatedAt: updatedPurchase.updatedAt,
            };
        });
    }
}