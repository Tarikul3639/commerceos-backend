import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductOptionType, ProductStatus } from '@/lib/prisma/enums';

/* ============================================================================
 * RELATION DTO
 * ============================================================================ */

export class AdminProductRelationDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;
}

/* ============================================================================
 * PRODUCT IMAGE DTO
 * ============================================================================ */

export class AdminProductImageDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    imageUrl!: string;

    @ApiProperty()
    publicId!: string;

    @ApiProperty()
    sortOrder!: number;
}

/* ============================================================================
 * PRODUCT OPTION VALUE DTO
 * ============================================================================ */

export class AdminProductOptionValueDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    value!: string;

    @ApiProperty({ type: String, nullable: true })
    colorHex!: string | null;
}

/* ============================================================================
 * PRODUCT OPTION DTO
 * ============================================================================ */

export class AdminProductOptionDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({
        enum: ProductOptionType,
        enumName: 'ProductOptionType',
    })
    type!: ProductOptionType;

    @ApiProperty({
        type: [AdminProductOptionValueDto],
    })
    values!: AdminProductOptionValueDto[];
}

/* ============================================================================
 * PRODUCT VARIANT OPTION DTO
 * ============================================================================ */

export class AdminProductVariantOptionDto {
    @ApiProperty({
        description: 'Product option value ID',
    })
    id!: string;

    @ApiProperty()
    value!: string;

    @ApiProperty({ type: String, nullable: true })
    colorHex!: string | null;

    @ApiProperty({
        description: 'Product option ID',
    })
    optionId!: string;

    @ApiProperty({
        description: 'Product option name, e.g. Color or Size',
    })
    name!: string;

    @ApiProperty({
        enum: ProductOptionType,
        enumName: 'ProductOptionType',
    })
    type!: ProductOptionType;
}

/* ============================================================================
 * PRODUCT VARIANT DTO
 * ============================================================================ */

export class AdminProductVariantDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ type: String, nullable: true })
    title!: string | null;

    @ApiProperty()
    sku!: string;

    @ApiProperty({ type: String, nullable: true })
    barcode!: string | null;

    @ApiProperty()
    stock!: number;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty({ type: String, nullable: true })
    deletedAt!: Date | null;

    @ApiProperty({
        type: [AdminProductVariantOptionDto],
    })
    options!: AdminProductVariantOptionDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

/* ============================================================================
 * PRODUCT SIZE GUIDE DTO
 * ============================================================================ */

export class AdminProductSizeGuideDto extends AdminProductRelationDto {
    @ApiProperty({ type: String, nullable: true })
    description!: string | null;

    @ApiProperty()
    unit!: string;

    @ApiProperty({
        type: [String],
        description: 'Column names for the size guide table',
    })
    columns!: string[];

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            additionalProperties: true,
        },
        description: 'Size guide table rows',
    })
    rows!: Record<string, string | number>[];
}

/* ============================================================================
 * PRODUCT DETAIL RESPONSE DTO
 * ============================================================================ */

export class AdminProductDetailResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({ type: String, nullable: true })
    subDescription!: string | null;

    @ApiProperty({ type: String, nullable: true })
    description!: string | null;

    @ApiProperty()
    purchasePrice!: string;

    @ApiProperty()
    sellingPrice!: string;

    @ApiProperty({
        enum: ProductStatus,
        enumName: 'ProductStatus',
    })
    status!: ProductStatus;

    @ApiProperty()
    categoryId!: string;

    @ApiProperty({ type: AdminProductRelationDto })
    category!: AdminProductRelationDto;

    @ApiProperty({ type: String, nullable: true })
    brandId!: string | null;

    @ApiPropertyOptional({
        type: AdminProductRelationDto,
        nullable: true,
    })
    brand!: AdminProductRelationDto | null;

    @ApiProperty({ type: String, nullable: true })
    sizeGuideId!: string | null;

    @ApiPropertyOptional({
        type: AdminProductSizeGuideDto,
        nullable: true,
    })
    sizeGuide!: AdminProductSizeGuideDto | null;

    @ApiProperty({
        type: [AdminProductImageDto],
    })
    images!: AdminProductImageDto[];

    /**
     * All available product options.
     * Used to render Color, Size, Material, etc. in the UI.
     */
    @ApiProperty({
        type: [AdminProductOptionDto],
    })
    options!: AdminProductOptionDto[];

    /**
     * Actual option combinations with individual stock.
     */
    @ApiProperty({
        type: [AdminProductVariantDto],
    })
    variants!: AdminProductVariantDto[];

    @ApiProperty({ type: String, nullable: true })
    deletedAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}