import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { StockTransferDetailResponseDto } from '../dto/responses/stock-transfer-detail-response.dto';

@Injectable()
export class GetStockTransferService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        stockTransferId: string,
    ): Promise<StockTransferDetailResponseDto> {
        const stockTransfer = await this.prisma.stockTransfer.findUnique({
            where: {
                id: stockTransferId,
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

        if (!stockTransfer) {
            throw new NotFoundException('Stock transfer not found');
        }

        return stockTransfer;
    }
}
