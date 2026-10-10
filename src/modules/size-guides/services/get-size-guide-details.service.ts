import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto';

@Injectable()
export class GetSizeGuideDetailsService {
    constructor(private readonly prisma: PrismaService) { }

    /** Get size guide details */
    async execute(id: string): Promise<SizeGuideResponseDto> {
        const sizeGuide = await this.prisma.sizeGuide.findUnique({
            where: { id },
        });

        if (!sizeGuide) {
            throw new NotFoundException('Size guide not found');
        }

        return sizeGuide as unknown as SizeGuideResponseDto;
    }
}
