import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CartQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customerId?: string;
}