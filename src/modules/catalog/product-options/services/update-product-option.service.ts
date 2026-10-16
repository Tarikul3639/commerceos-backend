
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { UpdateProductOptionDto } from '../dto/requests/update-product-option.dto';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto';

@Injectable()
export class UpdateProductOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(
    optionId: string,
    dto: UpdateProductOptionDto,
  ): Promise<ProductOptionResponseDto> {
    const option = await this.prisma.productOption.findUnique({
      where: { id: optionId },
      include: {
        values: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!option) {
      throw new NotFoundException('Product option not found');
    }

    if (dto.name !== undefined) {
      const existingOption = await this.prisma.productOption.findFirst({
        where: {
          productId: option.productId,
          name: dto.name.trim(),
          id: { not: option.id },
        },
        select: { id: true },
      });

      if (existingOption) {
        throw new ConflictException(
          'An option with this name already exists for this product',
        );
      }
    }

    const updatedOption = await this.prisma.productOption.update({
      where: { id: option.id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(dto.type !== undefined && {
          type: dto.type,
        }),
      },
      include: {
        values: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.PRODUCT,
      action: 'UPDATE_PRODUCT_OPTION',
      description: `Product option "${updatedOption.name}" was updated`,
      entityType: 'ProductOption',
      entityId: updatedOption.id,
      oldValue: {
        productId: option.productId,
        name: option.name,
        type: option.type,
        values: option.values.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
        })),
      },
      newValue: {
        productId: updatedOption.productId,
        name: updatedOption.name,
        type: updatedOption.type,
        values: updatedOption.values.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
        })),
      },
    });

    return updatedOption;
  }
}
