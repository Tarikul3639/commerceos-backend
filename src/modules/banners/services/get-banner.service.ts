import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { BannerResponseDto } from '../dto/responses/banner-response.dto';

@Injectable()
export class GetBannerService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(
        bannerId: string,
    ): Promise<BannerResponseDto> {
        const banner = await this.prisma.banner.findUnique({
            where: {
                id: bannerId,
            },
        });

        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        return {
            id: banner.id,
            title: banner.title,
            imageUrl: banner.imageUrl,
            mobileImageUrl: banner.mobileImageUrl,
            type: banner.type,
            position: banner.position,
            link: banner.link,
            buttonText: banner.buttonText,
            sortOrder: banner.sortOrder,
            isActive: banner.isActive,
            startAt: banner.startAt,
            endAt: banner.endAt,
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
        };
    }
}