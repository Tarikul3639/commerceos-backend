import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

import { CreateProductOptionDto } from '../dto/requests/create-product-option.dto.js';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto.js';

@Injectable()
export class CreateProductOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    dto: CreateProductOptionDto,
    userId: string,
  ): Promise<ProductOptionResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
      select: { id: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    const [optionCount, existingOption] = await Promise.all([
      this.prisma.productOption.count({ where: { productId: product.id } }),
      this.prisma.productOption.findUnique({
        where: {
          productId_name: { productId: product.id, name: dto.name.trim() },
        },
        select: { id: true },
      }),
    ]);

    if (optionCount >= 2) {
      throw new BadRequestException(
        'A product can have at most two option groups',
      );
    }
    if (existingOption) {
      throw new ConflictException(
        'An option with this name already exists for this product',
      );
    }

    const labels = dto.values.map((value) => value.label.trim().toLowerCase());
    const ids = dto.values.map((value) => value.id);
    if (
      new Set(labels).size !== labels.length ||
      new Set(ids).size !== ids.length
    ) {
      throw new ConflictException('Option value labels and IDs must be unique');
    }

    const option = await this.prisma.productOption.create({
      data: {
        productId: product.id,
        name: dto.name.trim(),
        type: dto.type,
        sortOrder: dto.sortOrder ?? optionCount,
        values: dto.values.map((value) => ({
          id: value.id,
          label: value.label.trim(),
          ...(value.colorCode ? { colorCode: value.colorCode } : {}),
        })),
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.PRODUCT,
      action: 'CREATE_PRODUCT_OPTION',
      description: `Product option "${option.name}" was created`,
      entityType: 'ProductOption',
      entityId: option.id,
      userId,
      newValue: option,
    });

    return option as unknown as ProductOptionResponseDto;
  }
}
