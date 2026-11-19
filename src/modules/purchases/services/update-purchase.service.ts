import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PurchaseStatus } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../infrastructure/database/generated/prisma/client.js';

import { UpdatePurchaseDto } from '../dto/requests/update-purchase.dto.js';
import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto.js';

@Injectable()
export class UpdatePurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Update a pending purchase and record the authenticated staff actor atomically.
   */
  async execute(
    purchaseId: string,
    dto: UpdatePurchaseDto,
    userId: string,
  ): Promise<PurchaseResponseDto> {
    return this.prisma.$transaction(
      async (tx) => {
        const purchase = await tx.purchase.findUnique({
          where: { id: purchaseId },
        });

        if (!purchase) {
          throw new NotFoundException('Purchase not found');
        }

        if (purchase.status !== PurchaseStatus.PENDING) {
          throw new BadRequestException(
            'Only pending purchases can be updated',
          );
        }

        if (dto.supplierId !== undefined) {
          const supplier = await tx.supplier.findFirst({
            where: {
              id: dto.supplierId,
              deletedAt: null,
              isActive: true,
            },
            select: { id: true },
          });

          if (!supplier) {
            throw new NotFoundException('Active supplier not found');
          }
        }

        let subtotal = purchase.subtotal;

        if (dto.items !== undefined) {
          if (!dto.items.length) {
            throw new BadRequestException(
              'Purchase must contain at least one item',
            );
          }

          if (
            dto.items.some(
              (item) =>
                !item.productId ||
                item.quantity === undefined ||
                item.unitPrice === undefined,
            )
          ) {
            throw new BadRequestException(
              'Product ID, quantity, and unit price are required for all items',
            );
          }

          const validatedItems = dto.items.map((item) => ({
            productId: item.productId!,
            quantity: item.quantity!,
            unitPrice: item.unitPrice!,
          }));

          if (
            validatedItems.some(
              (item) =>
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0 ||
                !Number.isFinite(Number(item.unitPrice)) ||
                Number(item.unitPrice) < 0,
            )
          ) {
            throw new BadRequestException(
              'Item quantities must be positive integers and unit prices must be non-negative',
            );
          }

          const productIds = validatedItems.map((item) => item.productId);

          if (new Set(productIds).size !== productIds.length) {
            throw new BadRequestException('Duplicate products are not allowed');
          }

          const products = await tx.product.findMany({
            where: {
              id: { in: productIds },
              deletedAt: null,
            },
            select: { id: true },
          });

          if (products.length !== productIds.length) {
            throw new BadRequestException(
              'One or more products not found or inactive',
            );
          }

          subtotal = validatedItems.reduce(
            (sum, item) =>
              sum.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
            new Prisma.Decimal(0),
          );

          await tx.purchaseItem.deleteMany({
            where: { purchaseId },
          });

          await tx.purchaseItem.createMany({
            data: validatedItems.map((item) => ({
              purchaseId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              subtotal: new Prisma.Decimal(item.unitPrice).mul(item.quantity),
            })),
          });
        }

        const discount =
          dto.discount !== undefined
            ? new Prisma.Decimal(dto.discount)
            : purchase.discount;
        const tax =
          dto.tax !== undefined ? new Prisma.Decimal(dto.tax) : purchase.tax;

        if (discount.lessThan(0) || tax.lessThan(0)) {
          throw new BadRequestException('Discount and tax cannot be negative');
        }

        if (discount.greaterThan(subtotal)) {
          throw new BadRequestException(
            'Discount cannot exceed the purchase subtotal',
          );
        }

        const total = subtotal.minus(discount).plus(tax);

        if (total.lessThan(0)) {
          throw new BadRequestException('Purchase total cannot be negative');
        }

        const updatedCount = await tx.purchase.updateMany({
          where: {
            id: purchaseId,
            status: PurchaseStatus.PENDING,
          },
          data: {
            subtotal,
            discount,
            tax,
            total,
            ...(dto.supplierId !== undefined && {
              supplierId: dto.supplierId,
            }),
          },
        });

        if (updatedCount.count === 0) {
          throw new BadRequestException(
            'Only pending purchases can be updated',
          );
        }

        const updated = await tx.purchase.findUnique({
          where: { id: purchaseId },
          include: {
            supplier: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, email: true } },
            purchaseItems: {
              include: {
                product: { select: { id: true, name: true } },
              },
            },
          },
        });

        if (!updated) {
          throw new NotFoundException('Purchase not found');
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.UPDATE,
            module: ActivityModule.PURCHASE,
            action: 'UPDATE_PURCHASE',
            description: `Purchase ${purchase.invoiceNo} was updated`,
            entityType: 'Purchase',
            entityId: purchase.id,
            userId,
            oldValue: {
              supplierId: purchase.supplierId,
              subtotal: purchase.subtotal.toString(),
              discount: purchase.discount.toString(),
              tax: purchase.tax.toString(),
              total: purchase.total.toString(),
            },
            newValue: {
              supplierId: updated.supplierId,
              subtotal: updated.subtotal.toString(),
              discount: updated.discount.toString(),
              tax: updated.tax.toString(),
              total: updated.total.toString(),
            },
          },
          tx,
        );

        return {
          id: updated.id,
          invoiceNo: updated.invoiceNo,
          subtotal: updated.subtotal.toString(),
          discount: updated.discount.toString(),
          tax: updated.tax.toString(),
          total: updated.total.toString(),
          status: updated.status,
          supplier: updated.supplier,
          user: updated.user,
          items: updated.purchaseItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            subtotal: item.subtotal.toString(),
            productId: item.productId,
            product: item.product,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
