import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { ProductImageResponseDto } from './product-image-response.dto';

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

    @ApiProperty({
        example: 'nike-air-max-270',
    })
    slug!: string;

    @ApiPropertyOptional({
        example: 'Comfortable running shoes',
        nullable: true,
    })
    description!: string | null;

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
        nullable: true,
    })
    colors!: unknown;

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