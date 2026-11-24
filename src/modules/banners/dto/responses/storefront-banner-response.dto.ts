import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  BannerPosition,
  BannerType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

/** Public banner fields required by responsive storefront placements. */
export class StorefrontBannerItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'https://example.com/banner-desktop.jpg' })
  imageUrl!: string;

  @ApiPropertyOptional({ nullable: true })
  mobileImageUrl!: string | null;

  @ApiProperty({ enum: BannerType })
  type!: BannerType;

  @ApiProperty({ enum: BannerPosition })
  position!: BannerPosition;

  @ApiPropertyOptional({ nullable: true })
  link!: string | null;

  @ApiProperty()
  openInNewTab!: boolean;

  @ApiProperty()
  sortOrder!: number;
}

/** One storefront placement with its ordered banner items. */
export class StorefrontBannerResponseDto {
  @ApiProperty({ enum: BannerPosition })
  position!: BannerPosition;

  @ApiProperty({ type: [StorefrontBannerItemResponseDto] })
  banners!: StorefrontBannerItemResponseDto[];
}
