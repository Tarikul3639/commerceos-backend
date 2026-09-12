import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

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

    @ApiPropertyOptional({
        example:
            'https://res.cloudinary.com/demo/image/upload/product.jpg',
        nullable: true,
    })
    thumbnail!: string | null;

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
        example: 5,
    })
    variantCount!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}