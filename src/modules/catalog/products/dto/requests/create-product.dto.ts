import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ProductStatus } from '@/lib/prisma/enums';

export class CreateProductDto {
    @ApiProperty({
        example: 'Premium Cotton T-Shirt',
        description: 'Product name',
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiPropertyOptional({
        example: 'Comfortable everyday cotton T-shirt',
        description: 'Short product description',
    })
    @IsOptional()
    @IsString()
    subDescription?: string;

    @ApiPropertyOptional({
        example: 'Made from premium cotton fabric.',
        description: 'Full product description',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 350,
        minimum: 0,
        description: 'Product purchase price',
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    purchasePrice!: number;

    @ApiProperty({
        example: 650,
        minimum: 0,
        description: 'Product selling price',
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    sellingPrice!: number;

    @ApiProperty({
        example: 'cm123category456',
        description: 'Product category ID',
    })
    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @ApiPropertyOptional({
        example: 'cm123brand456',
        description: 'Product brand ID',
    })
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({
        example: 'cm123sizeguide456',
        description: 'Product size guide ID',
    })
    @IsOptional()
    @IsString()
    sizeGuideId?: string;

    @ApiPropertyOptional({
        enum: ProductStatus,
        enumName: 'ProductStatus',
        example: ProductStatus.DRAFT,
        default: ProductStatus.DRAFT,
        description: 'Product publication status',
    })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
}
