import { ApiProperty } from '@nestjs/swagger';

import { ProductOptionType } from '@/lib/prisma/enums';

/* ============================================================================
 * PRODUCT IMAGE
 * ============================================================================ */

export class StoreProductImageDto {
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
 * PRODUCT CATEGORY
 * ============================================================================ */

export class StoreProductCategoryDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;
}

/* ============================================================================
 * PRODUCT BRAND
 * ============================================================================ */

export class StoreProductBrandDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;
}

/* ============================================================================
 * PRODUCT OPTION VALUE
 * ============================================================================ */

export class StoreProductOptionValueDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    value!: string;

    @ApiProperty({
        nullable: true,
        example: '#FF0000',
    })
    colorHex!: string | null;
}

/* ============================================================================
 * PRODUCT OPTION
 * ============================================================================ */

export class StoreProductOptionDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({
        enum: ProductOptionType,
        enumName: 'ProductOptionType',
    })
    type!: ProductOptionType;

    @ApiProperty({ type: [StoreProductOptionValueDto] })
    values!: StoreProductOptionValueDto[];
}

/* ============================================================================
 * PRODUCT VARIANT OPTION
 * ============================================================================ */

export class StoreProductVariantOptionDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    value!: string;

    @ApiProperty({
        nullable: true,
        example: '#FF0000',
    })
    colorHex!: string | null;

    @ApiProperty()
    optionId!: string;

    @ApiProperty()
    optionName!: string;

    @ApiProperty({
        enum: ProductOptionType,
        enumName: 'ProductOptionType',
    })
    optionType!: ProductOptionType;
}

/* ============================================================================
 * PRODUCT VARIANT
 * ============================================================================ */

export class StoreProductVariantDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({
        nullable: true,
    })
    title!: string | null;

    @ApiProperty()
    sku!: string;

    @ApiProperty()
    stock!: number;

    @ApiProperty({
        description: 'Whether the variant has available stock',
    })
    isAvailable!: boolean;

    @ApiProperty({ type: [StoreProductVariantOptionDto] })
    options!: StoreProductVariantOptionDto[];
}

/* ============================================================================
 * STORE PRODUCT DETAILS RESPONSE
 * ============================================================================ */

export class StoreProductDetailResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({
        nullable: true,
    })
    subDescription!: string | null;

    @ApiProperty({
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({
        example: '650.00',
        description: 'Product selling price',
    })
    sellingPrice!: string;

    @ApiProperty({ type: StoreProductCategoryDto })
    category!: StoreProductCategoryDto;

    @ApiProperty({
        type: StoreProductBrandDto,
        nullable: true,
    })
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

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    createdAt!: Date;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    updatedAt!: Date;
}
