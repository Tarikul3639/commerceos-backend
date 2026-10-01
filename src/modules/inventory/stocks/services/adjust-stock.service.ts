import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AdjustStockDto } from '../dto/requests/adjust-stock.dto';

@Injectable()
export class AdjustStockService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(_userId: string, dto: AdjustStockDto) {
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, deletedAt: null },
            select: { id: true, stock: true },
        });
        if (!product) throw new NotFoundException('Product not found');
        const stock = product.stock + dto.quantity;
        if (stock < 0) throw new BadRequestException('Stock cannot be negative');
        return this.prisma.product.update({
            where: { id: product.id },
            data: { stock },
            include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
        });
    }
}
