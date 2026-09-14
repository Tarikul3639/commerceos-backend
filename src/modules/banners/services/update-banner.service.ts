import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UpdateBannerDto } from '../dto/requests/update-banner.dto';
import { BannerResponseDto } from '../dto/responses/banner-response.dto';

@Injectable()
export class UpdateBannerService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(
        bannerId: string,
        updateBannerDto: UpdateBannerDto,
    ): Promise<BannerResponseDto> {
        const existingBanner =
            await this.prisma.banner.findUnique({
                where: {
                    id: bannerId,
                },
            });

        if (!existingBanner) {
            throw new NotFoundException(
                'Banner not found',
            );
        }

        const {
            title,
            imageUrl,
            mobileImageUrl,
            type,
            position,
            link,
            buttonText,
            sortOrder,
            isActive,
            startAt,
            endAt,
        } = updateBannerDto;

        const banner = await this.prisma.banner.update({
            where: {
                id: bannerId,
            },

            data: {
                ...(title !== undefined && {
                    title,
                }),

                ...(imageUrl !== undefined && {
                    imageUrl,
                }),

                ...(mobileImageUrl !== undefined && {
                    mobileImageUrl,
                }),

                ...(type !== undefined && {
                    type,
                }),

                ...(position !== undefined && {
                    position,
                }),

                ...(link !== undefined && {
                    link,
                }),

                ...(buttonText !== undefined && {
                    buttonText,
                }),

                ...(sortOrder !== undefined && {
                    sortOrder,
                }),

                ...(isActive !== undefined && {
                    isActive,
                }),

                ...(startAt !== undefined && {
                    startAt: startAt
                        ? new Date(startAt)
                        : null,
                }),

                ...(endAt !== undefined && {
                    endAt: endAt
                        ? new Date(endAt)
                        : null,
                }),
            },
        });

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