import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { BannerPosition, BannerType } from '@/lib/prisma/client';

export class UpdateBannerDto {
  @ApiPropertyOptional({
    example: 'Summer Sale',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'banners/summer-sale_desktop' })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner-mobile.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  mobileImageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'banners/summer-sale_mobile',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  mobileImagePublicId?: string | null;

  @ApiPropertyOptional({
    enum: BannerType,
  })
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @ApiPropertyOptional({
    enum: BannerPosition,
  })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional({
    example: '/products/summer-sale',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string;

  @ApiPropertyOptional({
    example: 'Shop Now',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buttonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '2026-09-15T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startAt?: Date | null;

  @ApiPropertyOptional({
    example: '2026-09-30T23:59:59.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endAt?: Date | null;
}
