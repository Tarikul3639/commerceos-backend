import {
    IsBooleanString,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../../../../lib/prisma/client';
import { PaginationQueryDto } from '../../../../../common/dto/requests/pagination-query.dto';

export class DiscountQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: DiscountType })
    @IsOptional()
    @IsEnum(DiscountType)
    type?: DiscountType;

    @ApiPropertyOptional({ example: 'true' })
    @IsOptional()
    @IsBooleanString()
    isActive?: string;
}