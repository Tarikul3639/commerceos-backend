import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

import { AdjustStockDto } from '../dto/requests/adjust-stock.dto.js';
import { StockResponseDto } from '../dto/responses/stock-response.dto.js';

@Injectable()
export class AdjustStockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLog: CreateActivityLogService,
  ) {}

  /**
   * Apply an atomic stock adjustment and prevent concurrent adjustments from making stock negative.
   */
  async execute(
    userId: string,
    dto: AdjustStockDto,
  ): Promise<StockResponseDto> {
    if (dto.quantity === 0) {
      throw new BadRequestException('Stock adjustment quantity cannot be zero');
    }

    let adjustment: {
      previousStock: number;
      updated: {
        id: string;
        productId: string;
        stock: number;
        sku: string;
        updatedAt: Date;
        product: {
          name: string;
          images: Array<{ imageUrl: string }>;
        };
      };
    };

    try {
      adjustment = await this.prisma.$transaction(
        async (tx) => {
          const variant = await tx.productVariant.findFirst({
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

          const minimumStock = dto.quantity < 0 ? -dto.quantity : 0;
          const updatedCount = await tx.productVariant.updateMany({
            where: {
              id: variant.id,
              deletedAt: null,
              stock: { gte: minimumStock },
            },
            data: {
              stock: { increment: dto.quantity },
            },
          });

          if (updatedCount.count === 0) {
            throw new BadRequestException('Stock cannot be negative');
          }

          const updated = await tx.productVariant.findUniqueOrThrow({
            where: { id: variant.id },
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          });

          return {
            previousStock: variant.stock,
            updated,
          };
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
          'Stock changed during this adjustment. Please retry.',
        );
      }

      throw error;
    }

    await this.createActivityLog.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.STOCK_MOVEMENT,
      action: 'ADJUST_STOCK',
      description: `Stock adjusted by ${dto.quantity} for variant ${adjustment.updated.id}`,
      entityType: 'ProductVariant',
      entityId: adjustment.updated.id,
      oldValue: {
        quantity: adjustment.previousStock,
      },
      newValue: {
        quantity: adjustment.updated.stock,
        adjustment: dto.quantity,
        reason: dto.reason ?? null,
      },
      userId,
    });

    return {
      id: adjustment.updated.id,
      variantId: adjustment.updated.id,
      productId: adjustment.updated.productId,
      quantity: adjustment.updated.stock,
      sku: adjustment.updated.sku,
      productName: adjustment.updated.product.name,
      productImage: adjustment.updated.product.images[0]?.imageUrl ?? null,
      updatedAt: adjustment.updated.updatedAt,
    };
  }
}
