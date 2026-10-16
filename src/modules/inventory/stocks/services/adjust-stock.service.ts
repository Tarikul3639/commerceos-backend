import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { AdjustStockDto } from '../dto/requests/adjust-stock.dto';
import { StockResponseDto } from '../dto/responses/stock-response.dto';

@Injectable()
export class AdjustStockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLog: CreateActivityLogService,
  ) { }

  async execute(
    _userId: string,
    dto: AdjustStockDto,
  ): Promise<StockResponseDto> {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: dto.variantId,
        deletedAt: null,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    const stock = variant.stock + dto.quantity;

    if (stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    await this.prisma.productVariant.update({
      where: {
        id: variant.id,
      },
      data: {
        stock,
      },
    });

    // Activity Log Creation
    await this.createActivityLog.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.STOCK_MOVEMENT,
      action: 'ADJUST_STOCK',
      description: `Stock adjusted by ${dto.quantity} for variant ${variant.id}`,
      entityType: 'ProductVariant',
      entityId: variant.id,
      oldValue: {
        quantity: variant.stock,
      },
      newValue: {
        quantity: stock,
        reason: dto.reason ?? null,
      },
      userId: _userId,
    });

    return this.prisma.productVariant
      .findUniqueOrThrow({
        where: {
          id: variant.id,
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  sortOrder: 'asc',
                },
                take: 1,
              },
            },
          },
        },
      })
      .then((updated) => ({
        id: updated.id,
        variantId: updated.id,
        productId: updated.productId,
        quantity: updated.stock,
        sku: updated.sku,
        productName: updated.product.name,
        productImage: updated.product.images[0]?.imageUrl ?? null,
        updatedAt: updated.updatedAt,
      }));
  }
}