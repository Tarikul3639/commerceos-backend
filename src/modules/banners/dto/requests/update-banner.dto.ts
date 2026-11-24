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

import {
  BannerPosition,
  BannerType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

export class UpdateBannerDto {
  @ApiPropertyOptional({ example: 'Summer Sale' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/banner-desktop.jpg' })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'banners/summer-sale-desktop' })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner-mobile.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  mobileImageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'banners/summer-sale-mobile',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  mobileImagePublicId?: string | null;

  @ApiPropertyOptional({ enum: BannerType })
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @ApiPropertyOptional({ enum: BannerPosition })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional({ example: '/collections/summer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-09-15T00:00:00.000Z', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.000Z', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endAt?: Date | null;
}
