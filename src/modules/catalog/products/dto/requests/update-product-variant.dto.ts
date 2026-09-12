import {
    IsArray,
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    IsNotEmpty,
    Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductVariantDto {
    @ApiPropertyOptional({
        example: 'TSHIRT-RED-L',
    })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiPropertyOptional({
        example: '1234567890123',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    barcode?: string | null;

    @ApiPropertyOptional({
        example: 550,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    purchasePrice?: number;

    @ApiPropertyOptional({
        example: 800,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sellingPrice?: number;

    @ApiPropertyOptional({
        example:
            'https://res.cloudinary.com/demo/image/upload/variant.jpg',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    image?: string | null;

    @ApiPropertyOptional({
        example: 'products/variants/tshirt-red-l',
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

    @ApiPropertyOptional({
        example: [
            'attribute-value-id-red',
            'attribute-value-id-large',
        ],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({
        each: true,
    })
    @IsNotEmpty({
        each: true,
    })
    attributeValueIds?: string[];
}