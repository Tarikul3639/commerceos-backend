import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class DeleteBrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(brandId: string): Promise<void> {
    const brand = await this.prisma.brand.findFirst({
      where: {
        id: brandId,
        deletedAt: null,
      },
      select: {
        publicId: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    // Soft delete if the brand has associated products.
    if (brand._count.products > 0) {
      await this.prisma.brand.update({
        where: {
          id: brandId,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return;
    }

    // Delete the image from Cloudinary before hard delete.
    if (brand.publicId) {
      await this.cloudinaryService.delete(brand.publicId);
    }

    // Hard delete if the brand has no associated products.
    await this.prisma.brand.delete({
      where: {
        id: brandId,
      },
    });
  }
}
