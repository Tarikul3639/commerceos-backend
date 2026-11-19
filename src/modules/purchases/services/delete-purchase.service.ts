import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PurchaseStatus } from '../../../lib/prisma/client.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';

@Injectable()
export class DeletePurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Permanently delete an unused pending purchase and write its audit record atomically.
   */
  async execute(purchaseId: string, userId: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const purchase = await tx.purchase.findUnique({
          where: { id: purchaseId },
          select: {
            id: true,
            invoiceNo: true,
            status: true,
            total: true,
            _count: { select: { returns: true } },
          },
        });

        if (!purchase) {
          throw new NotFoundException('Purchase not found');
        }

        if (purchase.status !== PurchaseStatus.PENDING) {
          throw new BadRequestException(
            'Only pending purchases can be deleted',
          );
        }

        if (purchase._count.returns > 0) {
          throw new BadRequestException(
            'A purchase with returns cannot be deleted',
          );
        }

        const deleted = await tx.purchase.deleteMany({
          where: {
            id: purchaseId,
            status: PurchaseStatus.PENDING,
            returns: { none: {} },
          },
        });

        if (deleted.count === 0) {
          throw new BadRequestException(
            'This purchase can no longer be deleted',
          );
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.DELETE,
            module: ActivityModule.PURCHASE,
            action: 'DELETE_PURCHASE',
            description: `Purchase ${purchase.invoiceNo} was deleted`,
            entityType: 'Purchase',
            entityId: purchase.id,
            userId,
            oldValue: {
              invoiceNo: purchase.invoiceNo,
              status: purchase.status,
              total: purchase.total.toString(),
            },
            newValue: 'Purchase permanently deleted',
          },
          tx,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
