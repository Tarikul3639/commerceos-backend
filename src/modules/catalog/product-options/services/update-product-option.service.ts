import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductOptionDto } from '../dto/requests/update-product-option.dto';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto';

@Injectable()
export class UpdateProductOptionService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        optionId: string,
        dto: UpdateProductOptionDto,
    ): Promise<ProductOptionResponseDto> {
        const option = await this.prisma.productOption.findUnique({
            where: { id: optionId },
            select: {
                id: true,
                productId: true,
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

        return this.prisma.productOption.update({
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
    }
}
