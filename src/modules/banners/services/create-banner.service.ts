import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CreateBannerDto } from '../dto/requests/create-banner.dto';
import { BannerResponseDto } from '../dto/responses/banner-response.dto';

@Injectable()
export class CreateBannerService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(createBannerDto: CreateBannerDto): Promise<BannerResponseDto> {
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
        } = createBannerDto;

        const banner = await this.prisma.banner.create({
            data: {
                imageUrl,
                type,
                position,

                ...(title !== undefined && {
                    title,
                }),

                ...(mobileImageUrl !== undefined && {
                    mobileImageUrl,
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
                    startAt: new Date(startAt),
                }),

                ...(endAt !== undefined && {
                    endAt: new Date(endAt),
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
