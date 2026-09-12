import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateProductVariantDto {
    @ApiProperty({
        example: 'NIKE-AIR-MAX-RED-42',
    })
    @IsString()
    @IsNotEmpty()
    sku!: string;

    @ApiPropertyOptional({
        example: '1234567890123',
    })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiProperty({
        example: 100,
    })
    @IsNumber()
    @Min(0)
    purchasePrice!: number;

    @ApiProperty({
        example: 150,
    })
    @IsNumber()
    @Min(0)
    sellingPrice!: number;

    @ApiPropertyOptional({
        example: 'https://example.com/image.jpg',
    })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({
        example: 'products/variants/nike-air-max-red',
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

    @ApiPropertyOptional({
        example: [
            'attribute-value-id-1',
            'attribute-value-id-2',
        ],
    })
    @IsOptional()
    @IsArray()
    @IsString({
        each: true,
    })
    attributeValueIds?: string[];
}