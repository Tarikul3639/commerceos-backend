import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  PaymentType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';

import { CancelOrderDto } from '../dto/requests/cancel-order.dto.js';

@Injectable()
export class CancelOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Cancel an eligible order, restore tracked stock and audit the change atomically.
   */
  async execute(
    orderId: string,
    cancelOrderDto: CancelOrderDto,
    userId: string,
  ) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
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

          const paidPayment = await tx.payment.findFirst({
            where: {
              orderId,
              type: PaymentType.PAYMENT,
              status: PaymentStatus.PAID,
            },
            select: { id: true },
          });

          if (order.paymentStatus === PaymentStatus.PAID || paidPayment) {
            throw new BadRequestException(
              'Paid orders cannot be cancelled until refund settlement is supported',
            );
          }

          if (
            order.status === OrderStatus.CANCELLED ||
            order.status === OrderStatus.SHIPPED ||
            order.status === OrderStatus.DELIVERED
          ) {
            throw new BadRequestException(
              `Order in ${order.status} status cannot be cancelled`,
            );
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
            throw new ConflictException(
              'Order status changed while cancelling. Please retry.',
            );
          }

          for (const item of order.orderItems) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }

          const cancelledOrder = await tx.order.findUniqueOrThrow({
            where: { id: orderId },
          });

          await this.createActivityLogService.execute(
            {
              type: ActivityType.CANCEL,
              module: ActivityModule.ORDER,
              action: 'CANCEL_ORDER',
              description: `Order ${orderId} was cancelled`,
              entityType: 'Order',
              entityId: orderId,
              userId,
              oldValue: { status: order.status },
              newValue: {
                status: OrderStatus.CANCELLED,
                reason: cancelOrderDto.reason ?? null,
                stockRestored: order.orderItems
                  .filter((item) => item.variantId)
                  .map((item) => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                  })),
              },
            },
            tx,
          );

          return cancelledOrder;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'Order status changed while cancelling. Please retry.',
        );
      }

      throw error;
    }
  }
}
