import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CreateStockTransferDto } from '../dto/requests/create-stock-transfer.dto';
import { StockTransferDetailResponseDto } from '../dto/responses/stock-transfer-detail-response.dto';

@Injectable()
export class CreateStockTransferService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        createStockTransferDto: CreateStockTransferDto,
    ): Promise<StockTransferDetailResponseDto> {
        const { fromWarehouseId, toWarehouseId, items, notes } =
            createStockTransferDto;

        if (fromWarehouseId === toWarehouseId) {
            throw new BadRequestException(
                'Source and destination warehouses cannot be the same',
            );
        }

        const [fromWarehouse, toWarehouse] = await Promise.all([
            this.prisma.warehouse.findFirst({
                where: {
                    id: fromWarehouseId,
                    deletedAt: null,
                    isActive: true,
                },
                select: {
                    id: true,
                },
            }),

            this.prisma.warehouse.findFirst({
                where: {
                    id: toWarehouseId,
                    deletedAt: null,
                    isActive: true,
                },
                select: {
                    id: true,
                },
            }),
        ]);

        if (!fromWarehouse) {
            throw new NotFoundException('Source warehouse not found or inactive');
        }

        if (!toWarehouse) {
            throw new NotFoundException(
                'Destination warehouse not found or inactive',
            );
        }

        const variantIds = items.map((item) => item.variantId);

        const uniqueVariantIds = new Set(variantIds);

        if (uniqueVariantIds.size !== variantIds.length) {
            throw new BadRequestException(
                'Duplicate product variants are not allowed',
            );
        }

        const variants = await this.prisma.productVariant.findMany({
            where: {
                id: {
                    in: variantIds,
                },
                deletedAt: null,
                isActive: true,
            },
            select: {
                id: true,
            },
        });

        if (variants.length !== variantIds.length) {
            throw new NotFoundException(
                'One or more product variants were not found or are inactive',
            );
        }

        const transferCount = await this.prisma.stockTransfer.count();

        const transferNo = `TRF-${String(transferCount + 1).padStart(6, '0')}`;

        const stockTransfer = await this.prisma.stockTransfer.create({
            data: {
                transferNo,
                ...(notes && { notes }),
                fromWarehouseId,
                toWarehouseId,
                userId,

                items: {
                    create: items.map((item) => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                    })),
                },
            },

            include: {
                fromWarehouse: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                toWarehouse: {
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

                items: {
                    include: {
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
                    },
                },
            },
        });

        return stockTransfer;
    }
}
