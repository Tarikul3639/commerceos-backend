import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PurchaseStatus } from '../../../infrastructure/database/generated/prisma/client.js';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

import { ReceivePurchaseDto } from '../dto/requests/receive-purchase.dto.js';

@Injectable()
export class ReceivePurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(purchaseId: string, userId: string, dto: ReceivePurchaseDto) {
    void userId;
    void dto;
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
