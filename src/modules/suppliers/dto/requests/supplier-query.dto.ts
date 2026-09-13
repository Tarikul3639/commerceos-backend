import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsIn,
    IsOptional,
    IsString,
} from 'class-validator';

export class SupplierQueryDto {
    @ApiPropertyOptional({
        example: '1',
        default: '1',
    })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiPropertyOptional({
        example: '10',
        default: '10',
    })
    @IsOptional()
    @IsString()
    limit?: string;

    @ApiPropertyOptional({
        example: 'ABC Trading',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 'true',
        enum: ['true', 'false'],
    })
    @IsOptional()
    @IsIn(['true', 'false'])
    isActive?: string;
}