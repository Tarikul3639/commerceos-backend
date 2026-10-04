import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProductImageResponseDto } from '@/modules/catalog/products/dto/responses/product-image-response.dto';
import { ProductColorResponseDto } from '@/modules/catalog/products/dto/responses/product-color-response.dto';
import { DiscountSummaryResponseDto } from '@/modules/catalog/products/dto/responses/discount-summary-response.dto';

export class ProductCategoryResponseDto {
  @ApiProperty({
    example: 'cmf123456789',
  })
  id!: string;

  @ApiProperty({
    example: 'Shoes',
  })
  name!: string;

  @ApiProperty({
    example: 'shoes',
  })
  slug!: string;
}

export class ProductBrandResponseDto {
  @ApiProperty({
    example: 'cmf123456789',
  })
  id!: string;

  @ApiProperty({
    example: 'Nike',
  })
  name!: string;

  @ApiProperty({
    example: 'nike',
  })
  slug!: string;

  @ApiPropertyOptional({
    example: 'https://www.nike.com',
    nullable: true,
  })
  website!: string | null;
}

export class ProductResponseDto {
  @ApiProperty({
    example: 'cmf123456789',
  })
  id!: string;

  @ApiProperty({
    example: 'Nike Air Max 270',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'Comfortable running shoes',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  subDescription!: string | null;

  @ApiProperty()
  sku!: string;

  @ApiPropertyOptional({
    nullable: true,
  })
  barcode!: string | null;

  @ApiProperty()
  purchasePrice!: string;

  @ApiProperty()
  sellingPrice!: string;

  @ApiProperty()
  stock!: number;

  @ApiProperty({
    type: [String],
  })
  sizes!: string[];

  @ApiPropertyOptional({
    type: [ProductColorResponseDto],
    nullable: true,
  })
  colors!: ProductColorResponseDto[] | null;

  // Product list response: returns only image URLs for lightweight list rendering.
  @ApiPropertyOptional({
    type: [String],
    nullable: true,
  })
  image?: string | null;

  @ApiProperty({
    example: true,
  })
  isActive!: boolean;

  @ApiPropertyOptional({
    nullable: true,
  })
  deletedAt!: Date | null;

  @ApiProperty({
    type: ProductCategoryResponseDto,
  })
  category!: ProductCategoryResponseDto;

  @ApiPropertyOptional({
    type: ProductBrandResponseDto,
    nullable: true,
  })
  brand!: ProductBrandResponseDto | null;

  @ApiPropertyOptional({ type: DiscountSummaryResponseDto, nullable: true })
  discount!: DiscountSummaryResponseDto | null;

  // Product details response: returns complete image information for the details page.
  @ApiPropertyOptional({
    type: [ProductImageResponseDto],
  })
  images?: ProductImageResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
