import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BannerPosition, BannerType } from '@/lib/prisma/client';

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

  @ApiProperty()
  imagePublicId!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner-mobile.jpg',
  })
  mobileImageUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  mobileImagePublicId!: string | null;

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

  @ApiProperty()
  openInNewTab!: boolean;

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
