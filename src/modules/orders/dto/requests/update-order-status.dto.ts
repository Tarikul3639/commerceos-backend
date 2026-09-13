import {
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { OrderStatus } from '@/lib/prisma/client';

export class UpdateOrderStatusDto {
    @ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.CONFIRMED,
    })
    @IsEnum(OrderStatus)
    status!: OrderStatus;

    @ApiPropertyOptional({
        example: 'Order confirmed successfully',
    })
    @IsOptional()
    @IsString()
    reason?: string;
}