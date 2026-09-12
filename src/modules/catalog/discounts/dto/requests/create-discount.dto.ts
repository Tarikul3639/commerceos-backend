import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { DiscountType } from '../../../../../lib/prisma/client';

export class CreateDiscountDto {
    @ApiProperty({
        example: 'Eid Sale',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @ApiPropertyOptional({
        example: 'Special Eid discount campaign',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        enum: DiscountType,
        example: DiscountType.PERCENTAGE,
    })
    @IsEnum(DiscountType)
    type!: DiscountType;

    @ApiProperty({
        example: '10',
        description:
            'Discount percentage or fixed amount',
    })
    @IsNumberString()
    @IsNotEmpty()
    value!: string;

    @ApiPropertyOptional({
        example: '2026-09-15T00:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2026-09-30T23:59:59.000Z',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}