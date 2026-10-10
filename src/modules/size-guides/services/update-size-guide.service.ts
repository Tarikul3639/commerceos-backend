import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateSizeGuideDto } from '../dto/requests/update-size-guide.dto';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto';

@Injectable()
export class UpdateSizeGuideService {
    constructor(private readonly prisma: PrismaService) { }

    /** Update a size guide */
    async execute(
        id: string,
        dto: UpdateSizeGuideDto,
    ): Promise<SizeGuideResponseDto> {
        const existing = await this.prisma.sizeGuide.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            throw new NotFoundException('Size guide not found');
        }

        if (dto.name !== undefined) {
            const duplicate = await this.prisma.sizeGuide.findFirst({
                where: {
                    name: { equals: dto.name, mode: 'insensitive' },
                    NOT: { id },
                },
                select: { id: true },
            });

            if (duplicate) {
                throw new ConflictException('Size guide already exists');
            }
        }

        const sizeGuide = await this.prisma.sizeGuide.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && {
                    description: dto.description,
                }),
                ...(dto.unit !== undefined && { unit: dto.unit }),
                ...(dto.columns !== undefined && {
                    columns: dto.columns as unknown as Prisma.InputJsonValue,
                }),
                ...(dto.rows !== undefined && {
                    rows: dto.rows as unknown as Prisma.InputJsonValue,
                }),
            },
        });

        return sizeGuide as unknown as SizeGuideResponseDto;
    }
}
