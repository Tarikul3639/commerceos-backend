import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { StockMovementResponseDto } from '../dto/responses/stock-movement-response.dto';

@Injectable()
export class GetStockMovementService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(stockMovementId: string): Promise<StockMovementResponseDto> {
        const stockMovement = await this.prisma.stockMovement.findUnique({
            where: {
                id: stockMovementId,
            },

            select: {
                id: true,
                type: true,
                quantity: true,
                previousQuantity: true,
                currentQuantity: true,
                reason: true,
                variant: {
                    select: {
                        id: true,

                        sku: true,

                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },

                warehouse: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },

                createdAt: true,
            },
        });

        if (!stockMovement) {
            throw new NotFoundException('Stock movement not found');
        }

        return stockMovement;
    }
}
