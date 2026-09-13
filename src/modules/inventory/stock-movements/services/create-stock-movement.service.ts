import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateStockMovementParams } from '../interfaces/create-stock-movement-params.interface';

@Injectable()
export class CreateStockMovementService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(params: CreateStockMovementParams) {
        const {
            type,
            quantity,
            previousQuantity,
            currentQuantity,
            reason,
            variantId,
            warehouseId,
            userId,
        } = params;

        return this.prisma.stockMovement.create({
            data: {
                type,
                quantity,
                previousQuantity,
                currentQuantity,

                ...(reason !== undefined && {
                    reason,
                }),

                variantId,
                warehouseId,
                userId,
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
    }
}
