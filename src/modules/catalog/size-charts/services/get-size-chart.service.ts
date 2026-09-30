import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SizeChartResponseDto } from '../dto/responses/size-chart-response.dto';

@Injectable()
export class GetSizeChartService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(sizeChartId: string): Promise<SizeChartResponseDto> {
        const chart = await this.prisma.sizeChart.findUnique({
            where: { id: sizeChartId },
            include: { items: { orderBy: { size: 'asc' } } },
        });
        if (!chart) throw new NotFoundException('Size chart not found');

        return {
            ...chart,
            items: chart.items.map((item) => ({
                ...item,
                chest: item.chest?.toString() ?? null,
                length: item.length?.toString() ?? null,
                shoulder: item.shoulder?.toString() ?? null,
                sleeve: item.sleeve?.toString() ?? null,
                waist: item.waist?.toString() ?? null,
                hip: item.hip?.toString() ?? null,
                inseam: item.inseam?.toString() ?? null,
            })),
        };
    }
}