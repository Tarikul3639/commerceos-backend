import {
    IsEnum,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { CustomerStatus } from '../../../../lib/prisma/client';

export class CustomerQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiPropertyOptional({
        example: 1,
        default: 1,
        description: 'Page number',
    })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @ApiPropertyOptional({
        example: 10,
        default: 10,
        description: 'Number of customers per page',
    })
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        example: 'John',
        description: 'Search by name, email, or phone',
    })
    search?: string;

    @IsOptional()
    @IsEnum(CustomerStatus)
    @ApiPropertyOptional({
        enum: CustomerStatus,
        example: CustomerStatus.ACTIVE,
        description: 'Filter customers by status',
    })
    status?: CustomerStatus;

    @IsOptional()
    @IsIn([
        'name',
        'email',
        'createdAt',
        'updatedAt',
    ])
    @ApiPropertyOptional({
        enum: [
            'name',
            'email',
            'createdAt',
            'updatedAt',
        ],
        default: 'createdAt',
        description: 'Field to sort customers by',
    })
    sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt' = 'createdAt';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    @ApiPropertyOptional({
        enum: ['asc', 'desc'],
        default: 'desc',
        description: 'Sort order',
    })
    sortOrder?: 'asc' | 'desc' = 'desc';
}