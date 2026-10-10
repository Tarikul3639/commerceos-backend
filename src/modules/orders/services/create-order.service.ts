import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateOrderDto } from '../dto/requests/create-order.dto';
import { OrderResponseDto } from '../dto/responses/order-response.dto';

import {
  generateDocumentNumber,
  getDocumentPrefix,
} from '@/common/utils/document-number.util';

@Injectable()
export class CreateOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateOrderDto,
    userId: string,
  ): Promise<OrderResponseDto> {
    // Validate the customer before starting the transaction.
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: dto.customerId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Prevent duplicate product-variant combinations in the same order.
    const lineKeys = dto.items.map(
      ({ productId, variantId }) => `${productId}:${variantId ?? ''}`,
    );

    if (new Set(lineKeys).size !== lineKeys.length) {
      throw new BadRequestException(
        'Duplicate product variants are not allowed',
      );
    }

    // Create the order and decrement inventory atomically.
    const orderId = await this.prisma.$transaction(async (tx) => {
      const productIds = [
        ...new Set(dto.items.map(({ productId }) => productId)),
      ];

      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          sellingPrice: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException(
          'One or more products not found or inactive',
        );
      }

      let subtotal = new Prisma.Decimal(0);

      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of dto.items) {
        const product = products.find(({ id }) => id === item.productId)!;

        const price = product.sellingPrice;

        // Validate the variant against the selected product.
        const variant = item.variantId
          ? await tx.productVariant.findFirst({
              where: {
                id: item.variantId,
                productId: item.productId,
                deletedAt: null,
              },
              select: {
                id: true,
                sku: true,
              },
            })
          : null;

        if (item.variantId && !variant) {
          throw new NotFoundException('Product variant not found or inactive');
        }

        // Calculate line totals using Decimal to avoid floating-point errors.
        const amount = price.mul(item.quantity);
        subtotal = subtotal.plus(amount);

        orderItems.push({
          variantSku: variant?.sku ?? null,
          variantColor: null,
          variantSize: null,
          quantity: item.quantity,
          unitPrice: price,
          subtotal: amount,
          product: {
            connect: {
              id: item.productId,
            },
          },
          ...(variant && {
            variant: {
              connect: {
                id: variant.id,
              },
            },
          }),
        });

        // Decrement stock only when enough inventory remains.
        if (variant) {
          const result = await tx.productVariant.updateMany({
            where: {
              id: variant.id,
              stock: {
                gte: item.quantity,
              },
              isActive: true,
              deletedAt: null,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (!result.count) {
            throw new BadRequestException(
              `Insufficient stock for variant ${variant.id}`,
            );
          }
        }
      }

      // Validate totals before persisting the order.
      const discount = new Prisma.Decimal(dto.discount ?? '0');
      const tax = new Prisma.Decimal(dto.tax ?? '0');
      const total = subtotal.minus(discount).plus(tax);

      if (discount.lessThan(0) || tax.lessThan(0)) {
        throw new BadRequestException('Discount and tax cannot be negative');
      }

      if (discount.greaterThan(subtotal)) {
        throw new BadRequestException(
          'Discount cannot exceed the order subtotal',
        );
      }

      if (total.lessThan(0)) {
        throw new BadRequestException('Order total cannot be negative');
      }

      const invoiceNo = generateDocumentNumber(getDocumentPrefix('ORD'), 1);

      const order = await tx.order.create({
        data: {
          invoiceNo,
          subtotal,
          discount,
          tax,
          total,
          customerId: dto.customerId,
          userId,
          orderItems: {
            create: orderItems,
          },
        },
        select: {
          id: true,
        },
      });

      return order.id;
    });

    // Fetch the completed order with customer, user, and item details.
    const order = await this.prisma.order.findUniqueOrThrow({
      where: {
        id: orderId,
      },
      include: {
        customer: {
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
        orderItems: {
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

    // Map Decimal values to strings for the API response.
    return {
      id: order.id,
      invoiceNo: order.invoiceNo,
      subtotal: order.subtotal.toString(),
      discount: order.discount.toString(),
      tax: order.tax.toString(),
      total: order.total.toString(),
      paymentStatus: order.paymentStatus,
      status: order.status,
      customer: order.customer,
      user: order.user,
      items: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        subtotal: item.subtotal.toString(),
        productId: item.productId,
        product: item.product,
        variantId: item.variantId,
        variantSku: item.variantSku,
        variantColor: item.variantColor,
        variantSize: item.variantSize,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
