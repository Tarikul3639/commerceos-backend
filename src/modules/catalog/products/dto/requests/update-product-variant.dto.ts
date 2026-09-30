import {
    IsBoolean,
    IsOptional,
    IsString,
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

    @ApiPropertyOptional({ example: 'Red' })
    @IsOptional()
    @IsString()
    color?: string | null;

    @ApiPropertyOptional({ example: '#FF0000' })
    @IsOptional()
    @IsString()
    colorHex?: string | null;

    @ApiPropertyOptional({ example: 'M' })
    @IsOptional()
    @IsString()
    size?: string | null;

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

}