import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { Prisma } from '../../../../lib/prisma/client';
import { UpdateSizeChartDto } from '../dto/requests/update-size-chart.dto';
import { UpdateSizeChartItemDto } from '../dto/requests/update-size-chart-item.dto';
import { SizeChartResponseDto } from '../dto/responses/size-chart-response.dto';

@Injectable()
export class UpdateSizeChartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        id: string,
        dto: UpdateSizeChartDto,
    ): Promise<SizeChartResponseDto> {
        const chart = await this.prisma.sizeChart.findUnique({
            where: { id },
        });

        if (!chart) {
            throw new NotFoundException('Size chart not found');
        }

        if (dto.name !== undefined && dto.name !== chart.name) {
            const duplicate = await this.prisma.sizeChart.findUnique({
                where: {
                    name: dto.name,
                },
            });

            if (duplicate) {
                throw new ConflictException('Size chart name already exists');
            }
        }

        const updated = await this.prisma.sizeChart.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && {
                    name: dto.name,
                }),
            },
            include: {
                items: {
                    orderBy: {
                        size: 'asc',
                    },
                },
            },
        });

        return this.toResponse(updated);
    }

    async executeItem(
        sizeChartId: string,
        itemId: string,
        dto: UpdateSizeChartItemDto,
    ): Promise<SizeChartResponseDto> {
        const chart = await this.prisma.sizeChart.findUnique({
            where: { id: sizeChartId },
        });

        if (!chart) {
            throw new NotFoundException('Size chart not found');
        }

        const item = await this.prisma.sizeChartItem.findFirst({
            where: {
                id: itemId,
                sizeChartId,
            },
        });

        if (!item) {
            throw new NotFoundException('Size chart item not found');
        }

        if (dto.size !== undefined && dto.size !== item.size) {
            const duplicate = await this.prisma.sizeChartItem.findUnique({
                where: {
                    sizeChartId_size: {
                        sizeChartId,
                        size: dto.size,
                    },
                },
            });

            if (duplicate) {
                throw new ConflictException(
                    `Size "${dto.size}" already exists in this size chart`,
                );
            }
        }

        await this.prisma.sizeChartItem.update({
            where: {
                id: itemId,
            },
            data: {
                ...(dto.size !== undefined && {
                    size: dto.size,
                }),
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

    private measurements(dto: UpdateSizeChartItemDto) {
        return {
            ...(dto.chest !== undefined && {
                chest: dto.chest,
            }),
            ...(dto.length !== undefined && {
                length: dto.length,
            }),
            ...(dto.shoulder !== undefined && {
                shoulder: dto.shoulder,
            }),
            ...(dto.sleeve !== undefined && {
                sleeve: dto.sleeve,
            }),
            ...(dto.waist !== undefined && {
                waist: dto.waist,
            }),
            ...(dto.hip !== undefined && {
                hip: dto.hip,
            }),
            ...(dto.inseam !== undefined && {
                inseam: dto.inseam,
            }),
        };
    }

    private toResponse(
        chart: Prisma.SizeChartGetPayload<{
            include: { items: true };
        }>,
    ): SizeChartResponseDto {
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
