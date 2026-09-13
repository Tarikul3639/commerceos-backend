import { IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReceivePurchaseDto {
    @ApiPropertyOptional({
        example: 'All products received successfully',
        description: 'Optional receiving note',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}