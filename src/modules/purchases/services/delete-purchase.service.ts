import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PurchaseStatus } from '../../../lib/prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DeletePurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(purchaseId: string): Promise<void> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: {
        status: true,
        _count: { select: { returns: true } },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException('Only pending purchases can be deleted');
    }

    if (purchase._count.returns > 0) {
      throw new BadRequestException(
        'A purchase with returns cannot be deleted',
      );
    }

    const deleted = await this.prisma.purchase.deleteMany({
      where: {
        id: purchaseId,
        status: PurchaseStatus.PENDING,
        returns: { none: {} },
      },
    });

    if (deleted.count === 0) {
      const stillExists = await this.prisma.purchase.findUnique({
        where: { id: purchaseId },
        select: { id: true },
      });

      if (!stillExists) {
        throw new NotFoundException('Purchase not found');
      }

      throw new BadRequestException('This purchase can no longer be deleted');
    }
  }
}
