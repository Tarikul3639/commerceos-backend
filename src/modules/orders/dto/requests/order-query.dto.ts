import {
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    OrderStatus,
    PaymentStatus,
} from '@/lib/prisma/client';

export class OrderQueryDto {
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
        example: 'ORD-20260914',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        enum: OrderStatus,
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional({
        enum: PaymentStatus,
    })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({
        example: 'cmabc123customer',
    })
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiPropertyOptional({
        example: 'cmabc123warehouse',
    })
    @IsOptional()
    @IsString()
    warehouseId?: string;

    @ApiPropertyOptional({
        example: 'cmabc123user',
    })
    @IsOptional()
    @IsString()
    userId?: string;
}