import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateProductOptionDto } from '../../dto/requests/options/create-product-option.dto';

@Injectable()
export class CreateProductOptionService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string, dto: CreateProductOptionDto): Promise<void> {
    await this.prisma.productOption.create({
      data: {
        productId,
        name: dto.name,
        type: dto.type ?? 'CUSTOM',
        values: {
          create: dto.values.map((value: { value: string; colorHex?: string | null }) => ({
            value: value.value,
            colorHex: value.colorHex ?? null,
          })),
        },
      },
    });
  }
}
