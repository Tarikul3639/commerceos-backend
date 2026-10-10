import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductVariantResponseDto } from '@/modules/catalog/product-variants/dto/responses/product-variant-response.dto';

@Injectable()
export class GenerateProductVariantsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<ProductVariantResponseDto[]> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const options = await this.prisma.productOption.findMany({
            where: { productId: product.id },
            include: {
                values: {
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        if (
            options.length === 0 ||
            options.some((option) => option.values.length === 0)
        ) {
            throw new BadRequestException(
                'Every product option must have at least one value',
            );
        }

        // Generate every possible combination of option values.
        const combinations = options.reduce<
            Array<(typeof options)[number]['values']>
        >(
            (current, option) =>
                current.flatMap((combination) =>
                    option.values.map((value) => [...combination, value]),
                ),
            [[]],
        );

        const variants: ProductVariantResponseDto[] = [];

        for (const combination of combinations) {
            const optionValueIds = combination.map((value) => value.id);

            // Stable SKU prevents duplicate generation for the same combination.
            const sku = `${product.id}-${[...optionValueIds].sort().join('-')}`;

            const existingVariant = await this.prisma.productVariant.findUnique({
                where: { sku },
                select: { id: true },
            });

            if (existingVariant) {
                continue;
            }

            const variant = await this.prisma.productVariant.create({
                data: {
                    productId: product.id,
                    title: combination.map((value) => value.value).join(' / '),
                    sku,
                    stock: 0,
                    options: {
                        connect: optionValueIds.map((id) => ({ id })),
                    },
                },
                include: {
                    options: {
                        include: {
                            option: true,
                        },
                    },
                },
            });

            variants.push({
                id: variant.id,
                productId: variant.productId,
                title: variant.title,
                sku: variant.sku,
                barcode: variant.barcode,
                stock: variant.stock,
                options: variant.options.map((value) => ({
                    id: value.id,
                    value: value.value,
                    colorHex: value.colorHex,
                    optionId: value.optionId,
                    optionName: value.option.name,
                    optionType: value.option.type,
                })),
                isActive: variant.isActive,
                deletedAt: variant.deletedAt,
                createdAt: variant.createdAt,
                updatedAt: variant.updatedAt,
            });
        }

        return variants;
    }
}
