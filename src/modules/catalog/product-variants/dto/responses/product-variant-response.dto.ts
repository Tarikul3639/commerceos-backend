import { ApiProperty } from '@nestjs/swagger';
import { ProductOptionType } from '@/lib/prisma/enums';

/**
 * DTO for product variant option response.
 */
export class ProductVariantOptionResponseDto {
    @ApiProperty({
        example: 'cm123redvalue',
        description: 'Product option value ID',
    })
    id!: string;

    @ApiProperty({
        example: 'Red',
        description: 'Option value',
    })
    value!: string;

    @ApiProperty({
        example: '#FF0000',
        nullable: true,
        description: 'Hex color code for color options; null for non-color values',
    })
    colorHex!: string | null;

    @ApiProperty({
        example: 'cm123coloroption',
        description: 'Product option ID',
    })
    optionId!: string;

    @ApiProperty({
        example: 'Color',
        description: 'Name of the product option',
    })
    optionName!: string;

    @ApiProperty({
        enum: ProductOptionType,
        enumName: 'ProductOptionType',
        example: ProductOptionType.COLOR,
        description: 'Type of the product option',
    })
    optionType!: ProductOptionType;
}

/**
 * DTO for product variant response.
 */

export class ProductVariantResponseDto {
    @ApiProperty({
        example: 'cm123variant456',
        description: 'Product variant ID',
    })
    id!: string;

    @ApiProperty({
        example: 'cm123product456',
        description: 'Parent product ID',
    })
    productId!: string;

    @ApiProperty({
        example: 'Red / Large',
        nullable: true,
        description: 'Display title of the variant',
    })
    title!: string | null;

    @ApiProperty({
        example: 'TSHIRT-RED-L',
        description: 'Unique SKU of the variant',
    })
    sku!: string;

    @ApiProperty({
        example: '1234567890123',
        nullable: true,
        description: 'Barcode of the variant',
    })
    barcode!: string | null;

    @ApiProperty({
        example: 25,
        minimum: 0,
        description: 'Available stock quantity',
    })
    stock!: number;

    @ApiProperty({
        type: [ProductVariantOptionResponseDto],
        description: 'Option values assigned to this variant',
    })
    options!: ProductVariantOptionResponseDto[];

    @ApiProperty({
        example: true,
        description: 'Whether the variant is active',
    })
    isActive!: boolean;

    @ApiProperty({
        example: null,
        nullable: true,
        description: 'Soft deletion timestamp; null when not deleted',
    })
    deletedAt!: Date | null;

    @ApiProperty({
        example: '2026-10-10T12:00:00.000Z',
        type: String,
        format: 'date-time',
        description: 'Variant creation timestamp',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-10-10T12:00:00.000Z',
        type: String,
        format: 'date-time',
        description: 'Last update timestamp',
    })
    updatedAt!: Date;
}