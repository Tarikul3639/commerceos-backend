import { ApiProperty } from '@nestjs/swagger';
import { ProductOptionType } from '../../../../../infrastructure/database/generated/prisma/enums.js';

export class StoreProductImageDto {
  @ApiProperty() id!: string;
  @ApiProperty() imageUrl!: string;
  @ApiProperty() publicId!: string;
  @ApiProperty() sortOrder!: number;
}
export class StoreProductCategoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}
export class StoreProductBrandDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}
export class StoreProductOptionValueDto {
  @ApiProperty() id!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ nullable: true, example: '#FF0000' })
  colorCode!: string | null;
}
export class StoreProductOptionDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: ProductOptionType, enumName: 'ProductOptionType' })
  type!: ProductOptionType;
  @ApiProperty({ type: [StoreProductOptionValueDto] })
  values!: StoreProductOptionValueDto[];
}
export class StoreProductVariantOptionDto {
  @ApiProperty() id!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ nullable: true, example: '#FF0000' })
  colorCode!: string | null;
  @ApiProperty() optionId!: string;
  @ApiProperty() optionName!: string;
  @ApiProperty({ enum: ProductOptionType, enumName: 'ProductOptionType' })
  optionType!: ProductOptionType;
}
export class StoreProductVariantDto {
  @ApiProperty() id!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() stock!: number;
  @ApiProperty({ description: 'Whether the variant has available stock' })
  isAvailable!: boolean;
  @ApiProperty({ type: [StoreProductVariantOptionDto] })
  options!: StoreProductVariantOptionDto[];
}
export class StoreProductDetailResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) subDescription!: string | null;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty({ example: '650.00' }) sellingPrice!: string;
  @ApiProperty({ type: String, nullable: true }) originalPrice!: string | null;
  @ApiProperty({ type: String, nullable: true }) discountPercentage!:
    string | null;
  @ApiProperty({ type: StoreProductCategoryDto })
  category!: StoreProductCategoryDto;
  @ApiProperty({ type: StoreProductBrandDto, nullable: true })
  brand!: StoreProductBrandDto | null;
  @ApiProperty({
    nullable: true,
    description: 'Product size guide details',
    type: Object,
  })
  sizeGuide!: Record<string, unknown> | null;
  @ApiProperty({ type: [StoreProductImageDto] })
  images!: StoreProductImageDto[];
  @ApiProperty({ type: [StoreProductOptionDto] })
  options!: StoreProductOptionDto[];
  @ApiProperty({ type: [StoreProductVariantDto] })
  variants!: StoreProductVariantDto[];
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: Date;
}
