import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    BannerPosition,
    BannerType,
} from '@/lib/prisma/client';

export class BannerResponseDto {
    @ApiProperty()
    id!: string;

    @ApiPropertyOptional({
        example: 'Summer Sale',
    })
    title!: string | null;

    @ApiProperty({
        example: 'https://example.com/banner.jpg',
    })
    imageUrl!: string;

    @ApiPropertyOptional({
        example: 'https://example.com/banner-mobile.jpg',
    })
    mobileImageUrl!: string | null;

    @ApiProperty({
        enum: BannerType,
    })
    type!: BannerType;

    @ApiProperty({
        enum: BannerPosition,
    })
    position!: BannerPosition;

    @ApiPropertyOptional({
        example: '/products/summer-sale',
    })
    link!: string | null;

    @ApiPropertyOptional({
        example: 'Shop Now',
    })
    buttonText!: string | null;

    @ApiProperty({
        example: 0,
    })
    sortOrder!: number;

    @ApiProperty()
    isActive!: boolean;

    @ApiPropertyOptional()
    startAt!: Date | null;

    @ApiPropertyOptional()
    endAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}