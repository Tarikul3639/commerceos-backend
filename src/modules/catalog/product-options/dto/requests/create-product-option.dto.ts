
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ProductOptionType } from '@/lib/prisma/enums';

export class CreateProductOptionValueDto {
    @ApiProperty({
        example: 'Red',
        description: 'Option value',
    })
    @IsString()
    @IsNotEmpty()
    value!: string;

    @ApiPropertyOptional({
        example: '#FF0000',
        description: 'Hex color code for color options',
    })
    @IsOptional()
    @IsString()
    @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
    colorHex?: string;
}

export class CreateProductOptionDto {
    @ApiProperty({
        example: 'cm123product456',
        description: 'ID of the product this option belongs to',
    })
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @ApiProperty({
        example: 'Color',
        description: 'Name of the product option',
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        enum: ProductOptionType,
        enumName: 'ProductOptionType',
        example: ProductOptionType.COLOR,
        description: 'Type of the product option',
    })
    @IsEnum(ProductOptionType)
    type!: ProductOptionType;

    @ApiProperty({
        type: [CreateProductOptionValueDto],
        description: 'Initial values for this option',
        example: [
            { value: 'Red', colorHex: '#FF0000' },
            { value: 'Blue', colorHex: '#0000FF' },
        ],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateProductOptionValueDto)
    values!: CreateProductOptionValueDto[];
}
