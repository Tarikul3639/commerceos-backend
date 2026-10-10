import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PurchaseStatus } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdatePurchaseDto } from '../dto/requests/update-purchase.dto';
import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto';

@Injectable()
export class UpdatePurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    purchaseId: string,
    dto: UpdatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // Ensure the purchase exists and can still be modified.
      const purchase = await tx.purchase.findUnique({
        where: {
          id: purchaseId,
        },
      });

      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }

      if (purchase.status !== PurchaseStatus.PENDING) {
        throw new BadRequestException('Only pending purchases can be updated');
      }

      // Validate the supplier before updating the purchase.
      if (dto.supplierId !== undefined) {
        const supplier = await tx.supplier.findFirst({
          where: {
            id: dto.supplierId,
            deletedAt: null,
            isActive: true,
          },
          select: {
            id: true,
          },
        });

        if (!supplier) {
          throw new NotFoundException('Active supplier not found');
        }
      }

      let subtotal = purchase.subtotal;

      if (dto.items !== undefined) {
        // A purchase must contain at least one item when items are supplied.
        if (!dto.items.length) {
          throw new BadRequestException(
            'Purchase must contain at least one item',
          );
        }

        // Validate required item fields before using their values.
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

        // Narrow optional DTO fields to required types after validation.
        const validatedItems = dto.items.map((item) => ({
          productId: item.productId!,
          quantity: item.quantity!,
          unitPrice: item.unitPrice!,
        }));

        // Validate quantities and prices before calculating totals.
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

        // Prevent duplicate products in the same purchase.
        if (new Set(productIds).size !== productIds.length) {
          throw new BadRequestException('Duplicate products are not allowed');
        }

        // Ensure all referenced products exist and are active.
        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
            deletedAt: null,
          },
          select: {
            id: true,
          },
        });

        if (products.length !== productIds.length) {
          throw new BadRequestException(
            'One or more products not found or inactive',
          );
        }

        // Recalculate subtotal using precise Decimal arithmetic.
        subtotal = validatedItems.reduce(
          (sum, item) =>
            sum.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
          new Prisma.Decimal(0),
        );

        // Replace existing purchase items inside the transaction.
        await tx.purchaseItem.deleteMany({
          where: {
            purchaseId,
          },
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

      // Preserve existing discount and tax when omitted from the request.
      const discount =
        dto.discount !== undefined
          ? new Prisma.Decimal(dto.discount)
          : purchase.discount;

      const tax =
        dto.tax !== undefined ? new Prisma.Decimal(dto.tax) : purchase.tax;

      // Validate discount and tax before updating the purchase.
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

      // Update purchase totals and the optional supplier assignment.
      const updated = await tx.purchase.update({
        where: {
          id: purchaseId,
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
        include: {
          supplier: {
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
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Convert Decimal values to strings for the response DTO.
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
    });
  }
}
