import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AssignProductDiscountDto } from '../dto/requests/assign-product-discount.dto';

@Injectable()
export class AssignProductDiscountService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        discountId: string,
        dto: AssignProductDiscountDto,
    ): Promise<void> {
        const discount = await this.prisma.discount.findFirst({
            where: {
                id: discountId,
                deletedAt: null,
            },

            select: {
                id: true,
                isActive: true,
            },
        });

        if (!discount) {
            throw new NotFoundException('Discount not found');
        }

        if (!discount.isActive) {
            throw new BadRequestException('Inactive discount cannot be assigned');
        }

        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: dto.productIds,
                },

                deletedAt: null,
                isActive: true,
            },

            select: {
                id: true,
            },
        });

        if (products.length !== dto.productIds.length) {
            throw new BadRequestException(
                'One or more products do not exist or are inactive',
            );
        }

        await this.prisma.$transaction(
            dto.productIds.map((productId) =>
                this.prisma.productDiscount.upsert({
                    where: {
                        productId_discountId: {
                            productId,
                            discountId,
                        },
                    },

                    update: {
                        isActive: true,
                        deletedAt: null,
                    },

                    create: {
                        productId,
                        discountId,
                    },
                }),
            ),
        );
    }
}
