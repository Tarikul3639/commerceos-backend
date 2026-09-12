import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({
        example: 'Nike Air Max 270',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @ApiPropertyOptional({
        example: 'Comfortable and stylish running shoes',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 'cmf123categoryid',
    })
    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @ApiPropertyOptional({
        example: 'cmf123brandid',
    })
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({
        example: 'https://res.cloudinary.com/demo/image/upload/product.jpg',
    })
    @IsOptional()
    @IsString()
    thumbnail?: string;

    @ApiPropertyOptional({
        example: 'products/nike-air-max-270',
    })
    @IsOptional()
    @IsString()
    publicId?: string;

    @ApiPropertyOptional({
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
