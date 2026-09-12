import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
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
