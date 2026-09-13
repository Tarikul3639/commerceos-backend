import {
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    OrderReturnStatus,
} from '@/lib/prisma/client';

export class OrderReturnQueryDto {
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
        enum: OrderReturnStatus,
    })
    @IsOptional()
    @IsEnum(OrderReturnStatus)
    status?: OrderReturnStatus;

    @ApiPropertyOptional({
        example: 'cmabc123order',
    })
    @IsOptional()
    @IsString()
    orderId?: string;

    @ApiPropertyOptional({
        example: 'cmabc123user',
    })
    @IsOptional()
    @IsString()
    createdById?: string;

    @ApiPropertyOptional({
        example: 'cmabc123user',
    })
    @IsOptional()
    @IsString()
    approvedById?: string;
}