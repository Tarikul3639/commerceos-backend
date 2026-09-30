import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { Prisma } from '../../../../lib/prisma/client';
import { CreateSizeChartDto } from '../dto/requests/create-size-chart.dto';
import { CreateSizeChartItemDto } from '../dto/requests/create-size-chart-item.dto';
import { SizeChartResponseDto } from '../dto/responses/size-chart-response.dto';

@Injectable()
export class CreateSizeChartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(dto: CreateSizeChartDto): Promise<SizeChartResponseDto> {
        const existing = await this.prisma.sizeChart.findUnique({
            where: { name: dto.name },
        });

        if (existing) {
            throw new ConflictException('Size chart name already exists');
        }

        const chart = await this.prisma.sizeChart.create({
            data: {
                name: dto.name,
            },
            include: {
                items: true,
            },
        });

        return this.toResponse(chart);
    }

    async executeItem(
        sizeChartId: string,
        dto: CreateSizeChartItemDto,
    ): Promise<SizeChartResponseDto> {
        const chart = await this.prisma.sizeChart.findUnique({
            where: { id: sizeChartId },
        });

        if (!chart) {
            throw new NotFoundException('Size chart not found');
        }

        const existing = await this.prisma.sizeChartItem.findUnique({
            where: {
                sizeChartId_size: {
                    sizeChartId,
                    size: dto.size,
                },
            },
        });

        if (existing) {
            throw new ConflictException(
                `Size "${dto.size}" already exists in this size chart`,
            );
        }

        await this.prisma.sizeChartItem.create({
            data: {
                sizeChartId,
                size: dto.size,
                ...this.measurements(dto),
            },
        });

        return this.getWithItems(sizeChartId);
    }

    private async getWithItems(id: string): Promise<SizeChartResponseDto> {
        const chart = await this.prisma.sizeChart.findUniqueOrThrow({
            where: { id },
            include: {
                items: {
                    orderBy: {
                        size: 'asc',
                    },
                },
            },
        });

        return this.toResponse(chart);
    }

    private measurements(dto: CreateSizeChartItemDto) {
        return {
            ...(dto.chest !== undefined && { chest: dto.chest }),
            ...(dto.length !== undefined && { length: dto.length }),
            ...(dto.shoulder !== undefined && { shoulder: dto.shoulder }),
            ...(dto.sleeve !== undefined && { sleeve: dto.sleeve }),
            ...(dto.waist !== undefined && { waist: dto.waist }),
            ...(dto.hip !== undefined && { hip: dto.hip }),
            ...(dto.inseam !== undefined && { inseam: dto.inseam }),
        };
    }

    private toResponse(
        chart: Prisma.SizeChartGetPayload<{
            include: { items: true };
        }>,
    ): SizeChartResponseDto {
        return {
            id: chart.id,
            name: chart.name,
            items: chart.items.map((item) => ({
                ...item,
                chest: item.chest?.toString() ?? null,
                length: item.length?.toString() ?? null,
                shoulder: item.shoulder?.toString() ?? null,
                sleeve: item.sleeve?.toString() ?? null,
                waist: item.waist?.toString() ?? null,
                hip: item.hip?.toString() ?? null,
                inseam: item.inseam?.toString() ?? null,
            })) as SizeChartResponseDto['items'],
            createdAt: chart.createdAt,
            updatedAt: chart.updatedAt,
        };
    }
}
