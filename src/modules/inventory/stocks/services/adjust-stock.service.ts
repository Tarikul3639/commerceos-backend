import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AdjustStockDto } from '../dto/requests/adjust-stock.dto';
import { StockResponseDto } from '../dto/responses/stock-response.dto';

@Injectable()
export class AdjustStockService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        _userId: string,
        dto: AdjustStockDto,
    ): Promise<StockResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: dto.productId,
                deletedAt: null,
            },
            select: {
                id: true,
                stock: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const stock = product.stock + dto.quantity;

        if (stock < 0) {
            throw new BadRequestException('Stock cannot be negative');
        }

        const updatedProduct = await this.prisma.product.update({
            where: {
                id: product.id,
            },
            data: {
                stock,
            },
            select: {
                id: true,
                sku: true,
                name: true,
                stock: true,
                updatedAt: true,
                images: {
                    orderBy: {
                        sortOrder: 'asc',
                    },
                    take: 1,
                    select: {
                        imageUrl: true,
                    },
                },
            },
        });

        return {
            id: updatedProduct.id,
            productId: updatedProduct.id,
            quantity: updatedProduct.stock,
            sku: updatedProduct.sku,
            productName: updatedProduct.name,
            productImage: updatedProduct.images[0]?.imageUrl ?? null,
            updatedAt: updatedProduct.updatedAt,
        };
    }
}