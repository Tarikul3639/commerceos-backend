import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class AdjustStockDto {
    @ApiProperty({
        example: 'cmf123productid',
        description: 'Product ID',
    })
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @ApiProperty({
        example: 10,
        description:
            'Positive quantity increases stock and negative quantity decreases stock',
    })
    @IsInt()
    quantity!: number;

    @ApiPropertyOptional({
        example: 'Physical stock count correction',
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    reason?: string;
}
