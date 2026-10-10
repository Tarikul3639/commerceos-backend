import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DiscountSummaryResponseDto } from './discount-summary-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductVariantResponseDto } from './product-variant-response.dto';

export class ProductCategoryResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

export class ProductBrandResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) website!: string | null;
}

export class ProductResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true }) subDescription!: string | null;
  @ApiProperty() purchasePrice!: string;
  @ApiProperty() sellingPrice!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: ProductCategoryResponseDto }) category!: ProductCategoryResponseDto;
  @ApiPropertyOptional({ type: ProductBrandResponseDto, nullable: true }) brand!: ProductBrandResponseDto | null;
  @ApiPropertyOptional({ type: [ProductImageResponseDto] }) images?: ProductImageResponseDto[];
  @ApiProperty({ type: [ProductVariantResponseDto] }) variants!: ProductVariantResponseDto[];
  @ApiPropertyOptional({ type: DiscountSummaryResponseDto, nullable: true }) discount!: DiscountSummaryResponseDto | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
