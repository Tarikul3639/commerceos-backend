import {
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CancelOrderDto {
    @ApiPropertyOptional({
        example: 'Customer requested cancellation',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    reason?: string;
}