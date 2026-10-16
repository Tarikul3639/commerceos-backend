import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { CreateProductOptionDto } from '../dto/requests/create-product-option.dto';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto';

@Injectable()
export class CreateProductOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(
    dto: CreateProductOptionDto,
  ): Promise<ProductOptionResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingOption = await this.prisma.productOption.findUnique({
      where: {
        productId_name: {
          productId: product.id,
          name: dto.name,
        },
      },
      select: { id: true },
    });

    if (existingOption) {
      throw new ConflictException(
        'An option with this name already exists for this product',
      );
    }

    const values = dto.values.map((item) => item.value.trim());

    if (new Set(values).size !== values.length) {
      throw new ConflictException('Duplicate option values are not allowed');
    }

    const option = await this.prisma.productOption.create({
      data: {
        productId: product.id,
        name: dto.name.trim(),
        type: dto.type,
        values: {
          create: dto.values.map((item) => ({
            value: item.value.trim(),
            ...(item.colorHex !== undefined && {
              colorHex: item.colorHex,
            }),
          })),
        },
      },
      include: {
        values: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.PRODUCT,
      action: 'CREATE_PRODUCT_OPTION',
      description: `Product option "${option.name}" was created`,
      entityType: 'ProductOption',
      entityId: option.id,
      newValue: {
        productId: option.productId,
        name: option.name,
        type: option.type,
        values: option.values.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
        })),
      },
    });

    return option;
  }
}
