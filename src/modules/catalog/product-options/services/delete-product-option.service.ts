import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class DeleteProductOptionService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(optionId: string): Promise<{ message: string }> {
        const option = await this.prisma.productOption.findUnique({
            where: { id: optionId },
            select: { id: true },
        });

        if (!option) {
            throw new NotFoundException('Product option not found');
        }

        await this.prisma.productOption.delete({
            where: { id: option.id },
        });

        return { message: 'Product option deleted successfully' };
    }
}
