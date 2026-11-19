import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import {
  generateDocumentNumber,
  getDocumentPrefix,
} from '../../../common/utils/document-number.util.js';

import { CreatePurchaseDto } from '../dto/requests/create-purchase.dto.js';
import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto.js';

@Injectable()
export class CreatePurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    dto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    if (userId === undefined || userId === null || userId.trim() === '') {
      throw new BadRequestException('User ID is required');
    }

    const supplier = await this.prisma.supplier.findFirst({
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
      throw new NotFoundException('Supplier not found or inactive');
    }

    if (!dto.items.length) {
      throw new BadRequestException('At least one purchase item is required');
    }

    const invalidPrice = dto.items.some((item) =>
      new Prisma.Decimal(item.unitPrice).lessThan(0),
    );

    if (invalidPrice) {
      throw new BadRequestException('Purchase item prices cannot be negative');
    }

    const productIds = dto.items.map(({ productId }) => productId);

    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException('Duplicate products are not allowed');
    }

    const products = await this.prisma.product.findMany({
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
        'One or more products are invalid or inactive',
      );
    }

    const subtotal = dto.items.reduce(
      (sum, item) =>
        sum.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
      new Prisma.Decimal(0),
    );

    const discount = new Prisma.Decimal(dto.discount ?? '0');

    const tax = new Prisma.Decimal(dto.tax ?? '0');

    if (discount.lessThan(0) || tax.lessThan(0)) {
      throw new BadRequestException('Discount and tax cannot be negative');
    }

    if (discount.greaterThan(subtotal)) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }

    const total = subtotal.minus(discount).plus(tax);

    if (total.lessThan(0)) {
      throw new BadRequestException('Purchase total cannot be negative');
    }

    const prefix = getDocumentPrefix('PUR');

    const latest = await this.prisma.purchase.findFirst({
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

    const sequence = latest
      ? Number(latest.invoiceNo.split('-').at(-1)) + 1
      : 1;

    const invoiceNo = generateDocumentNumber(prefix, sequence);

    const purchase = await this.prisma.purchase.create({
      data: {
        invoiceNo,
        subtotal,
        discount,
        tax,
        total,
        supplierId: dto.supplierId,
        userId,

        purchaseItems: {
          create: dto.items.map((item) => {
            const unitPrice = new Prisma.Decimal(item.unitPrice);

            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice,
              subtotal: unitPrice.mul(item.quantity),
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

    return {
      id: purchase.id,
      invoiceNo: purchase.invoiceNo,
      subtotal: purchase.subtotal.toString(),
      discount: purchase.discount.toString(),
      tax: purchase.tax.toString(),
      total: purchase.total.toString(),
      status: purchase.status,

      supplier: purchase.supplier,
      user: purchase.user,

      items: purchase.purchaseItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        subtotal: item.subtotal.toString(),
        productId: item.productId,
        product: item.product,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),

      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }
}
