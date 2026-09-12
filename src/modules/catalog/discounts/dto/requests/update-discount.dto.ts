import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNumberString,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { DiscountType } from '../../../../../lib/prisma/client';

export class UpdateDiscountDto {
    @ApiPropertyOptional({
        example: 'Eid Mega Sale',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: 'Updated Eid discount campaign',
    })
    @IsOptional()
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({
        enum: DiscountType,
        example: DiscountType.PERCENTAGE,
    })
    @IsOptional()
    @IsEnum(DiscountType)
    type?: DiscountType;

    @ApiPropertyOptional({
        example: '15',
    })
    @IsOptional()
    @IsNumberString()
    value?: string;

    @ApiPropertyOptional({
        example: '2026-09-15T00:00:00.000Z',
        nullable: true,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string | null;

    @ApiPropertyOptional({
        example: '2026-09-30T23:59:59.000Z',
        nullable: true,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string | null;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}