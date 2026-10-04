import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PurchaseReturnStatus } from '../../../lib/prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class PurchaseReturnActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async approve(id: string, userId: string) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
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

    const updated = await this.prisma.purchaseReturn.updateMany({
      where: { id, status: PurchaseReturnStatus.PENDING },
      data: {
        status: PurchaseReturnStatus.APPROVED,
        approvedById: userId,
        approvedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      throw new BadRequestException(
        'Only pending purchase returns can be approved',
      );
    }

    return { id, status: PurchaseReturnStatus.APPROVED };
  }

  async reject(id: string) {
    const updated = await this.prisma.purchaseReturn.updateMany({
      where: { id, status: PurchaseReturnStatus.PENDING },
      data: { status: PurchaseReturnStatus.REJECTED },
    });

    if (updated.count === 0) {
      await this.ensureExists(id);
      throw new BadRequestException(
        'Only pending purchase returns can be rejected',
      );
    }

    return { id, status: PurchaseReturnStatus.REJECTED };
  }

  async complete(id: string) {
    const updated = await this.prisma.purchaseReturn.updateMany({
      where: { id, status: PurchaseReturnStatus.APPROVED },
      data: { status: PurchaseReturnStatus.COMPLETED },
    });

    if (updated.count === 0) {
      await this.ensureExists(id);
      throw new BadRequestException(
        'Only approved purchase returns can be completed',
      );
    }

    return { id, status: PurchaseReturnStatus.COMPLETED };
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.prisma.purchaseReturn.deleteMany({
      where: {
        id,
        status: {
          in: [PurchaseReturnStatus.PENDING, PurchaseReturnStatus.REJECTED],
        },
      },
    });

    if (deleted.count === 0) {
      await this.ensureExists(id);
      throw new BadRequestException(
        'Only pending or rejected purchase returns can be deleted',
      );
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!purchaseReturn) {
      throw new NotFoundException('Purchase return not found');
    }
  }
}
