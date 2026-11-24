import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

import { UpdateProductOptionDto } from '../dto/requests/update-product-option.dto.js';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto.js';

@Injectable()
export class UpdateProductOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    optionId: string,
    dto: UpdateProductOptionDto,
    userId: string,
  ): Promise<ProductOptionResponseDto> {
    const option = await this.prisma.productOption.findUnique({
      where: { id: optionId },
    });
    if (!option) throw new NotFoundException('Product option not found');

    if (dto.name !== undefined) {
      const duplicate = await this.prisma.productOption.findFirst({
        where: {
          productId: option.productId,
          name: dto.name.trim(),
          id: { not: option.id },
        },
        select: { id: true },
      });
      if (duplicate)
        throw new ConflictException(
          'An option with this name already exists for this product',
        );
    }

    if (dto.values !== undefined) {
      const labels = dto.values.map((value) =>
        value.label.trim().toLowerCase(),
      );
      const ids = dto.values.map((value) => value.id);
      if (
        new Set(labels).size !== labels.length ||
        new Set(ids).size !== ids.length
      ) {
        throw new ConflictException(
          'Option value labels and IDs must be unique',
        );
      }

      const variants = await this.prisma.productVariant.findMany({
        where: { productId: option.productId, deletedAt: null },
        select: { options: true },
      });
      const retainedIds = new Set(ids);
      const removedInUse = variants.some((variant) => {
        const selected = variant.options as Record<string, string>;
        return (
          selected[option.id] !== undefined &&
          !retainedIds.has(selected[option.id])
        );
      });
      if (removedInUse) {
        throw new BadRequestException(
          'One or more values are used by existing variants. Remove or update those variants first.',
        );
      }
    }

    if (dto.type !== undefined && dto.type !== option.type) {
      const variants = await this.prisma.productVariant.findMany({
        where: { productId: option.productId, deletedAt: null },
        select: { options: true },
      });
      if (
        variants.some(
          (variant) => (variant.options as Record<string, string>)[option.id],
        )
      ) {
        throw new BadRequestException(
          'Option type cannot change while variants use this option',
        );
      }
    }

    const updated = await this.prisma.productOption.update({
      where: { id: option.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.values !== undefined && {
          values: dto.values.map((value) => ({
            id: value.id,
            label: value.label.trim(),
            ...(value.colorCode ? { colorCode: value.colorCode } : {}),
          })),
        }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.PRODUCT,
      action: 'UPDATE_PRODUCT_OPTION',
      description: `Product option "${updated.name}" was updated`,
      entityType: 'ProductOption',
      entityId: updated.id,
      userId,
      oldValue: option,
      newValue: updated,
    });

    return updated as unknown as ProductOptionResponseDto;
  }
}
