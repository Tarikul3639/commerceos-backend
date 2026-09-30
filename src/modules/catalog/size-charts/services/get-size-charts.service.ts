import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { PaginatedResponse } from '../../../../common/interfaces/paginated-response.interface';
import { SizeChartResponseDto } from '../dto/responses/size-chart-response.dto';

interface SizeChartQuery {
    search?: string;
    page?: string | number;
    limit?: string | number;
}

@Injectable()
export class GetSizeChartsService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(query: SizeChartQuery): Promise<PaginatedResponse<SizeChartResponseDto>> {
        const page = Math.max(Number(query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
        const search = query.search?.trim();
        const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};

        const [charts, total] = await this.prisma.$transaction([
            this.prisma.sizeChart.findMany({
                where,
                include: { items: { orderBy: { size: 'asc' } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.sizeChart.count({ where }),
        ]);

        return {
            data: charts.map((chart) => ({
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
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }
}