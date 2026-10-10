import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { ProductStatus } from '@/lib/prisma/enums';

export class ProductQueryDto {
    @ApiPropertyOptional({
        example: 1,
        minimum: 1,
        default: 1,
        description: 'Page number',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Number of products per page',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({
        example: 'T-Shirt',
        description: 'Search products by name',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 'cm123category456',
        description: 'Filter by category ID',
    })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({
        example: 'cm123brand456',
        description: 'Filter by brand ID',
    })
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({
        enum: ProductStatus,
        enumName: 'ProductStatus',
        description: 'Filter by product status',
    })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
}
