import {
    IsBooleanString,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

import {
    Transform,
    Type,
} from 'class-transformer';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CategoryQueryDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'Search categories by name or slug',
        example: 'electronics',
    })
    search?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined) {
            return undefined;
        }

        return value === 'true';
    })
    @ApiPropertyOptional({
        description: 'Filter categories by active status',
        example: true,
        type: Boolean,
    })
    isActive?: boolean;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: 1,
    })
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    @ApiPropertyOptional({
        description: 'Number of categories per page',
        example: 10,
        default: 10,
    })
    limit: number = 10;
}