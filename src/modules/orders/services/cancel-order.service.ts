import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderStatus } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CancelOrderDto } from '../dto/requests/cancel-order.dto';

@Injectable()
export class CancelOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, cancelOrderDto: CancelOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            select: { variantId: true, quantity: true },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Order is already cancelled');
      }

      const cancelled = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: {
          status: OrderStatus.CANCELLED,
          ...(cancelOrderDto.reason !== undefined && {
            cancellationReason: cancelOrderDto.reason,
          }),
        },
      });

      if (!cancelled.count) {
        throw new BadRequestException('Order status changed while cancelling');
      }

      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });
  }
}
