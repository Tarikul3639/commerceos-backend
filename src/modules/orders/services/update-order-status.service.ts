import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, OrderStatus } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../infrastructure/database/generated/prisma/client.js';

import { UpdateOrderStatusDto } from '../dto/requests/update-order-status.dto.js';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class UpdateOrderStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Apply a valid order transition conditionally and audit the acting staff member.
   */
  async execute(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    userId: string,
  ) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId },
          });

          if (!order) {
            throw new NotFoundException('Order not found');
          }

          if (
            !allowedTransitions[order.status].includes(
              updateOrderStatusDto.status,
            )
          ) {
            throw new BadRequestException(
              `Order cannot transition from ${order.status} to ${updateOrderStatusDto.status}`,
            );
          }

          const updatedCount = await tx.order.updateMany({
            where: {
              id: orderId,
              status: order.status,
            },
            data: {
              status: updateOrderStatusDto.status,
            },
          });

          if (updatedCount.count === 0) {
            throw new ConflictException(
              'Order status changed while updating. Please retry.',
            );
          }

          const updatedOrder = await tx.order.findUniqueOrThrow({
            where: { id: orderId },
          });

          await this.createActivityLogService.execute(
            {
              type: ActivityType.STATUS_CHANGE,
              module: ActivityModule.ORDER,
              action: 'UPDATE_ORDER_STATUS',
              description: `Order ${orderId} status changed from ${order.status} to ${updatedOrder.status}`,
              entityType: 'Order',
              entityId: orderId,
              userId,
              oldValue: { status: order.status },
              newValue: { status: updatedOrder.status },
            },
            tx,
          );

          return updatedOrder;
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
          'Order status changed while updating. Please retry.',
        );
      }

      throw error;
    }
  }
}
