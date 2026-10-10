import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SizeGuideQueryDto } from '../dto/requests/size-guide-query.dto';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto';

@Injectable()
export class GetSizeGuidesService {
    constructor(private readonly prisma: PrismaService) { }

    /** Get paginated size guides */
    async execute(query: SizeGuideQueryDto): Promise<{
        data: SizeGuideResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const page = query.page;
        const limit = query.limit;

        const where = query.search
            ? {
                name: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                },
            }
            : {};

        const [sizeGuides, total] = await this.prisma.$transaction([
            this.prisma.sizeGuide.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.sizeGuide.count({ where }),
        ]);

        return {
            data: sizeGuides as unknown as SizeGuideResponseDto[],
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
