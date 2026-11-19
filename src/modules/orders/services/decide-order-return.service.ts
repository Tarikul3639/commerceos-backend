import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderReturnStatus, Prisma } from '../../../lib/prisma/client.js';

import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class DecideOrderReturnService {
  constructor(private readonly prisma: PrismaService) {}

  async approve(returnId: string, userId: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const orderReturn = await tx.orderReturn.findUnique({
          where: { id: returnId },
          include: {
            items: {
              include: {
                orderItem: { select: { id: true, quantity: true } },
              },
            },
          },
        });

        if (!orderReturn) {
          throw new NotFoundException('Order return not found');
        }

        if (orderReturn.status !== OrderReturnStatus.PENDING) {
          throw new BadRequestException(
            `Only pending returns can be approved. Current status: ${orderReturn.status}`,
          );
        }

        for (const item of orderReturn.items) {
          const previouslyApproved = await tx.orderReturnItem.aggregate({
            where: {
              orderItemId: item.orderItemId,
              orderReturn: {
                status: {
                  in: [OrderReturnStatus.APPROVED, OrderReturnStatus.COMPLETED],
                },
              },
            },
            _sum: { quantity: true },
          });

          const alreadyApproved = previouslyApproved._sum.quantity ?? 0;
          if (alreadyApproved + item.quantity > item.orderItem.quantity) {
            throw new BadRequestException(
              `Approved return quantity exceeds the purchased quantity for order item ${item.orderItemId}`,
            );
          }
        }

        const updated = await tx.orderReturn.updateMany({
          where: { id: returnId, status: OrderReturnStatus.PENDING },
          data: {
            status: OrderReturnStatus.APPROVED,
            approvedById: userId,
            approvedAt: new Date(),
            rejectionReason: null,
            rejectedById: null,
            rejectedAt: null,
          },
        });

        if (updated.count !== 1) {
          throw new BadRequestException(
            'Return status changed while approving. Refresh and try again.',
          );
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async reject(
    returnId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    const result = await this.prisma.orderReturn.updateMany({
      where: { id: returnId, status: OrderReturnStatus.PENDING },
      data: {
        status: OrderReturnStatus.REJECTED,
        rejectionReason: reason.trim(),
        rejectedById: userId,
        rejectedAt: new Date(),
      },
    });

    if (result.count === 1) return;

    const exists = await this.prisma.orderReturn.findUnique({
      where: { id: returnId },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException('Order return not found');
    throw new BadRequestException('Only pending returns can be rejected');
  }

  async complete(returnId: string, userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const orderReturn = await tx.orderReturn.findUnique({
        where: { id: returnId },
        include: {
          items: {
            include: {
              orderItem: { select: { variantId: true } },
            },
          },
        },
      });

      if (!orderReturn) {
        throw new NotFoundException('Order return not found');
      }

      if (orderReturn.status !== OrderReturnStatus.APPROVED) {
        throw new BadRequestException(
          `Only approved returns can be completed. Current status: ${orderReturn.status}`,
        );
      }

      const updated = await tx.orderReturn.updateMany({
        where: { id: returnId, status: OrderReturnStatus.APPROVED },
        data: {
          status: OrderReturnStatus.COMPLETED,
          completedById: userId,
          completedAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        throw new BadRequestException(
          'Return status changed while completing. Refresh and try again.',
        );
      }

      for (const item of orderReturn.items) {
        const variantId = item.orderItem.variantId;
        if (!variantId) continue;

        await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
  }
}
