import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
    @ApiPropertyOptional({
        example: 100,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    purchasePrice?: number;

    @ApiPropertyOptional({
        example: 150,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sellingPrice?: number;

    @ApiPropertyOptional({
        example: 'Nike Air Max 270 Updated',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: 'Updated product description',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({
        example: 'cmf123categoryid',
    })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({
        example: 'cmf123brandid',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    brandId?: string | null;

    @ApiPropertyOptional({
        example: 'https://res.cloudinary.com/demo/image/upload/product.jpg',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    thumbnail?: string | null;

    @ApiPropertyOptional({
        example: 'products/nike-air-max-270',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    publicId?: string | null;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
