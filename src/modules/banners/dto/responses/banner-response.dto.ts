import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  BannerPosition,
  BannerType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

export class BannerImageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  imageUrl!: string;

  @ApiProperty()
  publicId!: string;

  @ApiProperty()
  sortOrder!: number;
}

export class BannerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ example: 'Summer Sale' })
  title!: string | null;

  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  imageUrl!: string;

  @ApiProperty()
  imagePublicId!: string;

  @ApiProperty({ type: [BannerImageResponseDto] })
  images!: BannerImageResponseDto[];

  /** @deprecated Legacy fields retained while old clients are migrated. */
  @ApiPropertyOptional({ nullable: true })
  mobileImageUrl!: string | null;

  /** @deprecated Legacy fields retained while old clients are migrated. */
  @ApiPropertyOptional({ nullable: true })
  mobileImagePublicId!: string | null;

  @ApiProperty({ enum: BannerType })
  type!: BannerType;

  @ApiProperty({ enum: BannerPosition })
  position!: BannerPosition;

  @ApiPropertyOptional({ example: '/products/summer-sale' })
  link!: string | null;

  @ApiPropertyOptional({ example: 'Shop Now' })
  buttonText!: string | null;

  @ApiProperty()
  openInNewTab!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional()
  startAt!: Date | null;

  @ApiPropertyOptional()
  endAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  createdById!: string | null;

  @ApiPropertyOptional({ nullable: true })
  updatedById!: string | null;

  @ApiPropertyOptional({ type: () => BannerActorResponseDto, nullable: true })
  createdBy!: BannerActorResponseDto | null;

  @ApiPropertyOptional({ type: () => BannerActorResponseDto, nullable: true })
  updatedBy!: BannerActorResponseDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class BannerActorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}
