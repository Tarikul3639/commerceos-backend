import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PurchaseStatus } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { CancelPurchaseDto } from '../dto/requests/cancel-purchase.dto';

@Injectable()
export class CancelPurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Cancel only a pending purchase and audit the reason and acting staff member.
   */
  async execute(
    purchaseId: string,
    dto: CancelPurchaseDto,
    userId: string,
  ): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const purchase = await tx.purchase.findUnique({
          where: { id: purchaseId },
          select: {
            id: true,
            invoiceNo: true,
            status: true,
          },
        });

        if (!purchase) {
          throw new NotFoundException('Purchase not found');
        }

        if (purchase.status !== PurchaseStatus.PENDING) {
          throw new BadRequestException(
            'Only pending purchases can be cancelled',
          );
        }

        const cancelled = await tx.purchase.updateMany({
          where: {
            id: purchaseId,
            status: PurchaseStatus.PENDING,
          },
          data: {
            status: PurchaseStatus.CANCELLED,
          },
        });

        if (cancelled.count === 0) {
          throw new ConflictException(
            'Purchase status changed while cancelling. Please retry.',
          );
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.CANCEL,
            module: ActivityModule.PURCHASE,
            action: 'CANCEL_PURCHASE',
            description: `Purchase ${purchase.invoiceNo} was cancelled`,
            entityType: 'Purchase',
            entityId: purchase.id,
            userId,
            oldValue: { status: purchase.status },
            newValue: {
              status: PurchaseStatus.CANCELLED,
              reason: dto.reason ?? null,
            },
          },
          tx,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
