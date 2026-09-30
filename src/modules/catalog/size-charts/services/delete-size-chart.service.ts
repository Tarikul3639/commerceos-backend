import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteSizeChartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string): Promise<void> {
        const chart = await this.prisma.sizeChart.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!chart) {
            throw new NotFoundException('Size chart not found');
        }

        await this.prisma.sizeChart.delete({
            where: { id },
        });
    }

    async executeItem(sizeChartId: string, itemId: string): Promise<void> {
        const item = await this.prisma.sizeChartItem.findFirst({
            where: {
                id: itemId,
                sizeChartId,
            },
            select: {
                id: true,
            },
        });

        if (!item) {
            throw new NotFoundException('Size chart item not found');
        }

        await this.prisma.sizeChartItem.delete({
            where: { id: itemId },
        });
    }
}
