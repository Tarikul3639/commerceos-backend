import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateOrderDto } from '@/modules/orders/dto/requests/create-order.dto';
import { OrderResponseDto } from '@/modules/orders/dto/responses/order-response.dto';
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
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    const productIds = dto.items.map(({ productId }) => productId);
    if (new Set(productIds).size !== productIds.length)
      throw new BadRequestException('Duplicate products are not allowed');

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, deletedAt: null, isActive: true },
        select: { id: true, name: true, sku: true, stock: true },
      });
      if (products.length !== productIds.length)
        throw new BadRequestException(
          'One or more products not found or inactive',
        );

      let subtotal = new Prisma.Decimal(0);
      const orderItems = dto.items.map((item) => {
        const amount = new Prisma.Decimal(item.unitPrice).mul(item.quantity);
        subtotal = subtotal.plus(amount);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          subtotal: amount,
        };
      });
      for (const item of dto.items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
            deletedAt: null,
            isActive: true,
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (!result.count)
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}`,
          );
      }

      const discount = new Prisma.Decimal(dto.discount ?? '0');
      const tax = new Prisma.Decimal(dto.tax ?? '0');
      const total = subtotal.minus(discount).plus(tax);
      if (total.lessThan(0))
        throw new BadRequestException('Order total cannot be negative');
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
          orderItems: { create: orderItems },
        },
        include: {
          customer: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
          orderItems: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      });
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
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });
  }
}
