import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PurchaseStatus } from '../../../lib/prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
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
      const purchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
      });
      if (!purchase) throw new NotFoundException('Purchase not found');
      if (purchase.status !== PurchaseStatus.PENDING)
        throw new BadRequestException('Only pending purchases can be updated');
      if (dto.supplierId) {
        const supplier = await tx.supplier.findFirst({
          where: { id: dto.supplierId, deletedAt: null, isActive: true },
          select: { id: true },
        });
        if (!supplier) throw new NotFoundException('Active supplier not found');
      }
      let subtotal = purchase.subtotal;
      let validatedItems: Array<{
        productId: string;
        quantity: number;
        unitPrice: string;
      }> = [];
      if (dto.items !== undefined) {
        if (!dto.items.length)
          throw new BadRequestException(
            'Purchase must contain at least one item',
          );
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
        validatedItems = dto.items as Array<{
          productId: string;
          quantity: number;
          unitPrice: string;
        }>;
        const productIds = validatedItems.map((item) => item.productId);
        if (new Set(productIds).size !== productIds.length)
          throw new BadRequestException('Duplicate products are not allowed');
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, deletedAt: null, isActive: true },
          select: { id: true },
        });
        if (products.length !== productIds.length)
          throw new BadRequestException('One or more products not found');
        subtotal = validatedItems.reduce(
          (sum, item) =>
            sum.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
          new Prisma.Decimal(0),
        );
        await tx.purchaseItem.deleteMany({ where: { purchaseId } });
      }
      const discount =
        dto.discount !== undefined
          ? new Prisma.Decimal(dto.discount)
          : purchase.discount;
      const tax =
        dto.tax !== undefined ? new Prisma.Decimal(dto.tax) : purchase.tax;
      const total = subtotal.minus(discount).plus(tax);
      if (total.lessThan(0))
        throw new BadRequestException('Purchase total cannot be negative');
      const updated = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          subtotal,
          discount,
          tax,
          total,
          ...(dto.supplierId && { supplierId: dto.supplierId }),
          ...(dto.items !== undefined && {
            purchaseItems: {
              create: validatedItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: new Prisma.Decimal(item.unitPrice),
                subtotal: new Prisma.Decimal(item.unitPrice).mul(item.quantity),
              })),
            },
          }),
        },
        include: {
          supplier: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
          purchaseItems: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      });
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
