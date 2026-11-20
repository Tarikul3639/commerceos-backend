import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  BannerPosition,
  BannerType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

class BannerImageInputDto {
  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsUrl()
  imageUrl!: string;

  @ApiProperty({ example: 'banners/summer-sale' })
  @IsString()
  publicId!: string;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class CreateBannerDto {
  @ApiPropertyOptional({ example: 'Summer Sale' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ type: [BannerImageInputDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BannerImageInputDto)
  images!: BannerImageInputDto[];

  @ApiProperty({ enum: BannerType })
  @IsEnum(BannerType)
  type!: BannerType;

  @ApiProperty({ enum: BannerPosition })
  @IsEnum(BannerPosition)
  position!: BannerPosition;

  @ApiPropertyOptional({ example: '/products/summer-sale' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string;

  @ApiPropertyOptional({ example: 'Shop Now' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buttonText?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-09-15T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startAt?: Date;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endAt?: Date;
}
