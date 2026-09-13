import {
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelPurchaseDto {
    @ApiPropertyOptional({
        example: 'Supplier cancelled the order',
        description: 'Reason for cancelling the purchase',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}