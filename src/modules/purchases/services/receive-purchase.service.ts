import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PurchaseStatus } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ReceivePurchaseDto } from '../dto/requests/receive-purchase.dto';

@Injectable()
export class ReceivePurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(purchaseId: string, _userId: string, _dto: ReceivePurchaseDto) {
    // Verify that the purchase exists before processing receipt.
    const purchase = await this.prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        purchaseItems: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Prevent receiving purchases that are already received or cancelled.
    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('Purchase has already been received');
    }

    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new BadRequestException('Cancelled purchase cannot be received');
    }

    // Inventory cannot be received safely without variant-linked purchase items.
    throw new BadRequestException(
      'Purchase items are not linked to product variants; inventory cannot be received safely',
    );
  }
}
