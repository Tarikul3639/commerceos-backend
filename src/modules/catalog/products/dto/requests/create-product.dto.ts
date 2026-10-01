import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator'

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger'

export class CreateProductDto {
    @ApiProperty({
        example: 'Nike Air Max 270',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string

    @ApiProperty({
        example: 'nike-air-max-270',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    slug!: string

    @ApiPropertyOptional({
        example: 'Comfortable and stylish running shoes',
    })
    @IsOptional()
    @IsString()
    description?: string

    @ApiProperty({
        example: 100,
        description: 'Product purchase price',
    })
    @IsNumber()
    @Min(0)
    purchasePrice!: number

    @ApiProperty({
        example: 150,
        description: 'Product selling price',
    })
    @IsNumber()
    @Min(0)
    sellingPrice!: number

    @ApiProperty({
        example: 'cmf123categoryid',
    })
    @IsString()
    @IsNotEmpty()
    categoryId!: string

    @ApiPropertyOptional({
        example: 'cmf123brandid',
    })
    @IsOptional()
    @IsString()
    brandId?: string

    @ApiPropertyOptional({
        example: 'cmf123sizechartid',
    })
    @IsOptional()
    @IsString()
    sizeChartId?: string

    @ApiPropertyOptional({
        example: 'https://res.cloudinary.com/demo/image/upload/product.jpg',
    })
    @IsOptional()
    @IsString()
    thumbnail?: string

    @ApiPropertyOptional({
        example: 'products/nike-air-max-270',
        description: 'Cloudinary public ID',
    })
    @IsOptional()
    @IsString()
    publicId?: string

    @ApiPropertyOptional({
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}