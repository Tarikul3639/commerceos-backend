import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserStatus } from '../../../../lib/prisma/client';

export enum UserSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    NAME = 'name',
    EMAIL = 'email',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class UserQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: 1,
    })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @ApiPropertyOptional({
        description: 'Number of users per page',
        example: 10,
        default: 10,
    })
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'Search users by name, email, or phone',
        example: 'john',
    })
    search?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    @ApiPropertyOptional({
        description: 'Filter users by status',
        enum: UserStatus,
        example: UserStatus.ACTIVE,
    })
    status?: UserStatus;

    @IsOptional()
    @IsEnum(UserSortBy)
    @ApiPropertyOptional({
        description: 'Field to sort by',
        enum: UserSortBy,
        example: UserSortBy.CREATED_AT,
        default: UserSortBy.CREATED_AT,
    })
    sortBy?: UserSortBy = UserSortBy.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC,
        default: SortOrder.DESC,
    })
    sortOrder?: SortOrder = SortOrder.DESC;
}