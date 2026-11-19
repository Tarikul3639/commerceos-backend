import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PurchaseReturnStatus } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

@Injectable()
export class PurchaseReturnActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Approve a purchase return with serializable quantity checks and an atomic audit record.
   */
  async approve(id: string, userId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const purchaseReturn = await tx.purchaseReturn.findUnique({
          where: { id },
          include: {
            items: {
              include: {
                purchaseItem: {
                  include: {
                    returnItems: {
                      include: {
                        purchaseReturn: {
                          select: { id: true, status: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!purchaseReturn) {
          throw new NotFoundException('Purchase return not found');
        }

        if (purchaseReturn.status !== PurchaseReturnStatus.PENDING) {
          throw new BadRequestException(
            'Only pending purchase returns can be approved',
          );
        }

        for (const item of purchaseReturn.items) {
          const alreadyApprovedQuantity = item.purchaseItem.returnItems.reduce(
            (total, returnItem) => {
              if (
                returnItem.purchaseReturn.id !== id &&
                (returnItem.purchaseReturn.status ===
                  PurchaseReturnStatus.APPROVED ||
                  returnItem.purchaseReturn.status ===
                    PurchaseReturnStatus.COMPLETED)
              ) {
                return total + returnItem.quantity;
              }
              return total;
            },
            0,
          );

          if (
            alreadyApprovedQuantity + item.quantity >
            item.purchaseItem.quantity
          ) {
            throw new BadRequestException(
              `Return quantity exceeds the remaining quantity for purchase item ${item.purchaseItemId}`,
            );
          }
        }

        const updated = await tx.purchaseReturn.updateMany({
          where: { id, status: PurchaseReturnStatus.PENDING },
          data: {
            status: PurchaseReturnStatus.APPROVED,
            approvedById: userId,
            approvedAt: new Date(),
          },
        });

        if (updated.count === 0) {
          throw new ConflictException(
            'Purchase return status changed while approving. Please retry.',
          );
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.APPROVE,
            module: ActivityModule.PURCHASE_RETURN,
            action: 'APPROVE_PURCHASE_RETURN',
            description: `Purchase return ${purchaseReturn.returnNo} was approved`,
            entityType: 'PurchaseReturn',
            entityId: id,
            userId,
            oldValue: { status: PurchaseReturnStatus.PENDING },
            newValue: { status: PurchaseReturnStatus.APPROVED },
          },
          tx,
        );

        return { id, status: PurchaseReturnStatus.APPROVED };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Reject only pending purchase returns and record the acting staff member.
   */
  async reject(id: string, userId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const purchaseReturn = await tx.purchaseReturn.findUnique({
          where: { id },
          select: { id: true, returnNo: true, status: true },
        });

        if (!purchaseReturn) {
          throw new NotFoundException('Purchase return not found');
        }

        if (purchaseReturn.status !== PurchaseReturnStatus.PENDING) {
          throw new BadRequestException(
            'Only pending purchase returns can be rejected',
          );
        }

        const updated = await tx.purchaseReturn.updateMany({
          where: { id, status: PurchaseReturnStatus.PENDING },
          data: { status: PurchaseReturnStatus.REJECTED },
        });

        if (updated.count === 0) {
          throw new ConflictException(
            'Purchase return status changed while rejecting. Please retry.',
          );
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.REJECT,
            module: ActivityModule.PURCHASE_RETURN,
            action: 'REJECT_PURCHASE_RETURN',
            description: `Purchase return ${purchaseReturn.returnNo} was rejected`,
            entityType: 'PurchaseReturn',
            entityId: id,
            userId,
            oldValue: { status: PurchaseReturnStatus.PENDING },
            newValue: { status: PurchaseReturnStatus.REJECTED },
          },
          tx,
        );

        return { id, status: PurchaseReturnStatus.REJECTED };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Complete an approved purchase return and record the transition atomically.
   */
  async complete(id: string, userId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const purchaseReturn = await tx.purchaseReturn.findUnique({
          where: { id },
          select: { id: true, returnNo: true, status: true },
        });

        if (!purchaseReturn) {
          throw new NotFoundException('Purchase return not found');
        }

        if (purchaseReturn.status !== PurchaseReturnStatus.APPROVED) {
          throw new BadRequestException(
            'Only approved purchase returns can be completed',
          );
        }

        const updated = await tx.purchaseReturn.updateMany({
          where: { id, status: PurchaseReturnStatus.APPROVED },
          data: { status: PurchaseReturnStatus.COMPLETED },
        });

        if (updated.count === 0) {
          throw new ConflictException(
            'Purchase return status changed while completing. Please retry.',
          );
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.COMPLETE,
            module: ActivityModule.PURCHASE_RETURN,
            action: 'COMPLETE_PURCHASE_RETURN',
            description: `Purchase return ${purchaseReturn.returnNo} was completed`,
            entityType: 'PurchaseReturn',
            entityId: id,
            userId,
            oldValue: { status: PurchaseReturnStatus.APPROVED },
            newValue: { status: PurchaseReturnStatus.COMPLETED },
          },
          tx,
        );

        return { id, status: PurchaseReturnStatus.COMPLETED };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Delete only pending/rejected purchase returns and retain the audit trail.
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const purchaseReturn = await tx.purchaseReturn.findUnique({
          where: { id },
          select: { id: true, returnNo: true, status: true },
        });

        if (!purchaseReturn) {
          throw new NotFoundException('Purchase return not found');
        }

        if (
          purchaseReturn.status !== PurchaseReturnStatus.PENDING &&
          purchaseReturn.status !== PurchaseReturnStatus.REJECTED
        ) {
          throw new BadRequestException(
            'Only pending or rejected purchase returns can be deleted',
          );
        }

        const deleted = await tx.purchaseReturn.deleteMany({
          where: {
            id,
            status: {
              in: [PurchaseReturnStatus.PENDING, PurchaseReturnStatus.REJECTED],
            },
          },
        });

        if (deleted.count === 0) {
          throw new ConflictException(
            'Purchase return status changed while deleting. Please retry.',
          );
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.DELETE,
            module: ActivityModule.PURCHASE_RETURN,
            action: 'DELETE_PURCHASE_RETURN',
            description: `Purchase return ${purchaseReturn.returnNo} was deleted`,
            entityType: 'PurchaseReturn',
            entityId: id,
            userId,
            oldValue: { status: purchaseReturn.status },
            newValue: 'Purchase return permanently deleted',
          },
          tx,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
