import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { StockTransferStatus } from '@/lib/prisma/client';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class CancelStockTransferService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(stockTransferId: string): Promise<void> {
        const stockTransfer = await this.prisma.stockTransfer.findUnique({
            where: {
                id: stockTransferId,
            },

            select: {
                id: true,
                status: true,
            },
        });

        if (!stockTransfer) {
            throw new NotFoundException('Stock transfer not found');
        }

        if (stockTransfer.status === StockTransferStatus.COMPLETED) {
            throw new BadRequestException(
                'Completed stock transfer cannot be cancelled',
            );
        }

        if (stockTransfer.status === StockTransferStatus.CANCELLED) {
            throw new BadRequestException('Stock transfer is already cancelled');
        }

        await this.prisma.stockTransfer.update({
            where: {
                id: stockTransferId,
            },

            data: {
                status: StockTransferStatus.CANCELLED,
            },
        });
    }
}
