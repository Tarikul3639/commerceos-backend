import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  ProductBrandResponseDto,
  ProductCategoryResponseDto,
} from './product-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { DiscountSummaryResponseDto } from './discount-summary-response.dto';
import { ProductColorResponseDto } from './product-color-response.dto';
import { ProductReviewResponseDto } from './product-review-response.dto';
import { ProductRatingResponseDto } from './product-rating-response.dto';

export class ProductDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  sku!: string;

  @ApiPropertyOptional({ nullable: true })
  barcode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  subDescription!: string | null;

  @ApiProperty()
  purchasePrice!: string;

  @ApiProperty()
  sellingPrice!: string;

  @ApiProperty()
  stock!: number;

  @ApiProperty({ type: [String] })
  sizes!: string[];

  @ApiPropertyOptional({
    type: [ProductColorResponseDto],
    nullable: true,
  })
  colors!: ProductColorResponseDto[] | null;

  @ApiProperty({ type: ProductRatingResponseDto })
  rating!: ProductRatingResponseDto;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ type: ProductCategoryResponseDto })
  category!: ProductCategoryResponseDto;

  @ApiPropertyOptional({
    type: ProductBrandResponseDto,
    nullable: true,
  })
  brand!: ProductBrandResponseDto | null;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];

  @ApiPropertyOptional({ type: DiscountSummaryResponseDto, nullable: true })
  discount!: DiscountSummaryResponseDto | null;

  @ApiProperty({ type: [ProductReviewResponseDto] })
  reviews!: ProductReviewResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
