import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductOptionType,
  ProductStatus,
} from '../../../../../infrastructure/database/generated/prisma/enums.js';
import { ProductDiscountResponseDto } from './product-discount-response.dto.js';

export class AdminProductRelationDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class AdminProductImageDto {
  @ApiProperty() id!: string;
  @ApiProperty() imageUrl!: string;
  @ApiProperty() publicId!: string;
  @ApiProperty() sortOrder!: number;
}

export class AdminProductOptionValueDto {
  @ApiProperty() id!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ type: String, nullable: true }) colorCode!: string | null;
}

export class AdminProductOptionDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: ProductOptionType, enumName: 'ProductOptionType' })
  type!: ProductOptionType;
  @ApiProperty({ type: [AdminProductOptionValueDto] })
  values!: AdminProductOptionValueDto[];
  @ApiProperty() sortOrder!: number;
}

export class AdminProductVariantDto {
  @ApiProperty() id!: string;
  @ApiProperty() sku!: string;
  @ApiProperty({ type: String, nullable: true }) barcode!: string | null;
  @ApiProperty() stock!: number;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ type: String, nullable: true }) deletedAt!: Date | null;
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  options!: Record<string, string>;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class AdminProductSizeGuideDto extends AdminProductRelationDto {
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty() unit!: string;
  @ApiProperty({ type: [String] }) columns!: string[];
  @ApiProperty({
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  rows!: Record<string, string | number>[];
}

export class AdminProductDetailResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: String, nullable: true }) subDescription!: string | null;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty() purchasePrice!: string;
  @ApiProperty() sellingPrice!: string;
  @ApiPropertyOptional({ type: ProductDiscountResponseDto, nullable: true })
  productDiscount!: ProductDiscountResponseDto | null;
  @ApiProperty({ enum: ProductStatus, enumName: 'ProductStatus' })
  status!: ProductStatus;
  @ApiProperty() isFeatured!: boolean;
  @ApiProperty() categoryId!: string;
  @ApiProperty({ type: AdminProductRelationDto })
  category!: AdminProductRelationDto;
  @ApiProperty({ type: String, nullable: true }) brandId!: string | null;
  @ApiPropertyOptional({ type: AdminProductRelationDto, nullable: true })
  brand!: AdminProductRelationDto | null;
  @ApiProperty({ type: String, nullable: true }) sizeGuideId!: string | null;
  @ApiPropertyOptional({ type: AdminProductSizeGuideDto, nullable: true })
  sizeGuide!: AdminProductSizeGuideDto | null;
  @ApiProperty({ type: [AdminProductImageDto] })
  images!: AdminProductImageDto[];
  @ApiProperty({ type: [AdminProductOptionDto] })
  options!: AdminProductOptionDto[];
  @ApiProperty({ type: [AdminProductVariantDto] })
  variants!: AdminProductVariantDto[];
  @ApiProperty({ type: String, nullable: true }) deletedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
