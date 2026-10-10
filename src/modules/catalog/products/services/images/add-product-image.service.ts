import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { AddProductImageDto } from '../../dto/requests/images/add-product-image.dto';

@Injectable()
export class AddProductImageService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string, dto: AddProductImageDto): Promise<void> {
    await this.prisma.productImage.create({
      data: {
        productId,
        imageUrl: dto.imageUrl,
        publicId: dto.publicId,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }
}
