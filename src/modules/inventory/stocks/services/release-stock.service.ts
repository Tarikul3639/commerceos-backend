import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class ReleaseStockService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        variantId: string,
        warehouseId: string,
        quantity: number,
    ): Promise<void> {
        
        if (quantity <= 0) {
            throw new BadRequestException(
                'Release quantity must be greater than zero',
            );
        }

        await this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: {
                    variantId_warehouseId: {
                        variantId,
                        warehouseId,
                    },
                },
            });

            if (!inventory) {
                throw new NotFoundException('Stock not found');
            }

            if (inventory.reservedQuantity < quantity) {
                throw new BadRequestException(
                    'Cannot release more than reserved stock',
                );
            }

            await tx.inventory.update({
                where: {
                    id: inventory.id,
                },

                data: {
                    reservedQuantity: {
                        decrement: quantity,
                    },
                },
            });
        });
    }
}
