import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  generateDocumentNumber,
  getDocumentPrefix,
} from '../../../common/utils/document-number.util';

import { CreatePurchaseDto } from '../dto/requests/create-purchase.dto';
import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto';

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
        isActive: true,
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

    if (discount.greaterThan(subtotal)) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }

    const total = subtotal.minus(discount).plus(tax);

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
