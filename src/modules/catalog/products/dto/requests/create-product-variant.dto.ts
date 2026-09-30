import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
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

    @ApiPropertyOptional({ example: 'Red' })
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional({ example: '#FF0000' })
    @IsOptional()
    @IsString()
    colorHex?: string;

    @ApiPropertyOptional({ example: 'M' })
    @IsOptional()
    @IsString()
    size?: string;

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

}