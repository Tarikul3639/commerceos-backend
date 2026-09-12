import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    ProductCategoryResponseDto,
    ProductBrandResponseDto,
} from './product-response.dto';

import {
    ProductImageResponseDto,
} from './product-image-response.dto';

import {
    ProductVariantResponseDto,
} from './product-variant-response.dto';

export class ProductDetailResponseDto {
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
        example: 'Comfortable and stylish running shoes',
        nullable: true,
    })
    description!: string | null;

    @ApiPropertyOptional({
        example:
            'https://res.cloudinary.com/demo/image/upload/product.jpg',
        nullable: true,
    })
    thumbnail!: string | null;

    @ApiPropertyOptional({
        example: 'products/nike-air-max-270',
        nullable: true,
    })
    publicId!: string | null;

    @ApiProperty({
        example: true,
    })
    isActive!: boolean;

    @ApiProperty({
        type: ProductCategoryResponseDto,
    })
    category!: ProductCategoryResponseDto;

    @ApiPropertyOptional({
        type: ProductBrandResponseDto,
        nullable: true,
    })
    brand!: ProductBrandResponseDto | null;

    @ApiProperty({
        type: [ProductImageResponseDto],
    })
    images!: ProductImageResponseDto[];

    @ApiProperty({
        type: [ProductVariantResponseDto],
    })
    variants!: ProductVariantResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}