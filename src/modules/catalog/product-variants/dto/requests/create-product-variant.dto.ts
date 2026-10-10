import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayUnique,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateProductVariantDto {
    @ApiProperty({
        example: 'cm123product456',
        description: 'ID of the product this variant belongs to',
    })
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @ApiPropertyOptional({
        example: 'Red / Large',
        description: 'Optional display title for the variant',
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        example: 'TSHIRT-RED-L',
        description: 'Unique SKU for this variant',
    })
    @IsString()
    @IsNotEmpty()
    sku!: string;

    @ApiPropertyOptional({
        example: '1234567890123',
        description: 'Unique barcode for this variant',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    barcode?: string;

    @ApiPropertyOptional({
        example: 25,
        minimum: 0,
        default: 0,
        description: 'Available stock quantity',
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({
        type: [String],
        example: ['cm123redvalue', 'cm123largevalue'],
        description: 'IDs of existing ProductOptionValue records',
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    optionValueIds?: string[];
}