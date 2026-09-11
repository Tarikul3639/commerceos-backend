import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CloudinaryService } from '../../../../common/cloudinary/cloudinary.service';

@Injectable()
export class DeleteCategoryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async execute(categoryId: string): Promise<void> {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, deletedAt: null },
            select: {
                id: true,
                publicId: true,
                _count: { select: { products: true } },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        /**
         * If the category has associated products,
         * we perform a soft delete by setting the deletedAt field to the current date.
         */
        if (category._count.products > 0) {
            await this.prisma.category.update({
                where: { id: categoryId },
                data: { deletedAt: new Date() },
            });

            /**
             * If the category has an associated image,
             * we can also delete the image from Cloudinary.
             */
            if (category.publicId) {
                await this.cloudinaryService.delete(category.publicId);
            }

            /**
             * After performing a soft delete, we return early to avoid further processing.
             */
            return;
        }

        /**
         * If the category has no associated products,
         * we can safely perform a hard delete.
         */
        await this.prisma.category.delete({
            where: { id: categoryId },
        });
    }
}
